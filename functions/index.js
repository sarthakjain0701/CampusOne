const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Helper function to verify caller is an active Admin in Firestore.
 * Checks centralized collection '/users/{uid}' first, then falls back to '/admins/{email}'.
 */
async function verifyAdmin(callerUid, callerEmail) {
  const db = admin.firestore();
  
  // 1. Try centralized users collection by UID
  try {
    const userDoc = await db.collection("users").doc(callerUid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const roleLower = (userData.role || "").toLowerCase();
      const statusLower = (userData.status || "").toLowerCase();
      if ((roleLower === "admin" || roleLower === "administrator") && statusLower === "active") {
        return true;
      }
    }
  } catch (err) {
    console.error("Central users check failed:", err);
  }

  // 2. Fallback to legacy admins collection by email
  if (callerEmail) {
    try {
      const adminDoc = await db.collection("admins").doc(callerEmail.toLowerCase().trim()).get();
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        const roleUpper = (adminData.role || "").toUpperCase();
        const statusUpper = (adminData.status || "").toUpperCase();
        if (roleUpper === "ADMIN" && statusUpper === "ACTIVE") {
          return true;
        }
      }
    } catch (err) {
      console.error("Legacy admins check failed:", err);
    }
  }

  throw new functions.https.HttpsError(
    "permission-denied",
    "You are not authorized to perform administrative tasks."
  );
}

/**
 * Cloud Function to securely provision PAMS users (Student, Faculty, Librarian, etc.).
 * Accessible only by authenticated and authorized Admins.
 */
exports.provisionUser = functions.https.onCall(async (data, context) => {
  // 1. Verify caller authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to provision users."
    );
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email;

  // 2. Verify caller is an active Admin
  await verifyAdmin(callerUid, callerEmail);

  // 3. Validate input parameters
  const { role, email, profileData } = data;
  if (!email || !role || !profileData) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: email, role, or profileData."
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRole = role.toLowerCase().trim();
  const tempPassword = "password123";

  // Map roles to legacy collections
  let collectionName = "";
  if (normalizedRole === "student") {
    collectionName = "authorizedUsers";
  } else if (
    [
      "faculty",
      "librarian",
      "lab_assistant",
      "proctor",
      "hod",
      "dean",
      "registrar",
      "coe",
      "finance_officer",
      "it_support",
      "management"
    ].includes(normalizedRole)
  ) {
    collectionName = "faculties";
  } else if (normalizedRole === "admin" || normalizedRole === "administrator") {
    collectionName = "admins";
  } else {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid role specified: ${role}.`
    );
  }

  const db = admin.firestore();

  // 4. Duplicate Check - Firestore cross-collection
  const allCollections = ["authorizedUsers", "faculties", "admins"];
  for (const col of allCollections) {
    const doc = await db.collection(col).doc(normalizedEmail).get();
    if (doc.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        `This email is already registered under collection: ${col}.`
      );
    }
  }

  // 5. Auth Account creation/recovery
  let userRecord;
  let isExistingAuthUser = false;
  try {
    userRecord = await admin.auth().getUserByEmail(normalizedEmail);
    isExistingAuthUser = true;
  } catch (err) {
    if (err.code !== "auth/user-not-found") {
      throw new functions.https.HttpsError(
        "internal",
        "Error checking existing user in authentication: " + err.message
      );
    }
  }

  if (!isExistingAuthUser) {
    try {
      userRecord = await admin.auth().createUser({
        email: normalizedEmail,
        password: tempPassword,
        displayName: profileData.name || "",
      });
    } catch (authError) {
      console.error("Auth creation failed:", authError);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to create authentication account: " + authError.message
      );
    }
  } else {
    // If the user already existed in Auth, make sure they are enabled if status is ACTIVE
    const reqStatus = (profileData.status || "ACTIVE").toUpperCase();
    try {
      await admin.auth().updateUser(userRecord.uid, {
        disabled: reqStatus === "INACTIVE"
      });
    } catch (err) {
      console.error("Failed to update status on existing Auth user:", err);
    }
  }

  // 6. Profile synchronization
  try {
    const docData = {
      ...profileData,
      uid: userRecord.uid,
      email: normalizedEmail,
      role: role.toUpperCase(), // Keep legacy collection role uppercase
      status: profileData.status || "ACTIVE",
      mustChangePassword: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const centralData = {
      uid: userRecord.uid,
      email: normalizedEmail,
      role: normalizedRole,
      status: (profileData.status || "ACTIVE").toLowerCase(),
      name: profileData.name || normalizedEmail.split("@")[0],
      updatedAt: new Date().toISOString()
    };

    // Save to legacy collection
    await db.collection(collectionName).doc(normalizedEmail).set(docData, { merge: true });

    // Save to centralized collection
    await db.collection("users").doc(userRecord.uid).set(centralData, { merge: true });

    return { success: true, message: "User provisioned successfully.", uid: userRecord.uid };
  } catch (dbError) {
    console.error("Firestore synchronization failed, rolling back newly created Auth...", dbError);
    
    // Only delete user from Auth if we newly created them in this call
    if (!isExistingAuthUser) {
      try {
        await admin.auth().deleteUser(userRecord.uid);
      } catch (cleanupError) {
        console.error("Rollback failed. Orphaned Auth account:", cleanupError);
      }
    }

    throw new functions.https.HttpsError(
      "internal",
      "User profile synchronization could not be completed. Please contact the system administrator."
    );
  }
});

/**
 * Cloud Function to securely update PAMS users (including activation/deactivation).
 * Accessible only by authenticated and authorized Admins.
 */
exports.updateUser = functions.https.onCall(async (data, context) => {
  // 1. Verify caller authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to update users."
    );
  }

  const callerUid = context.auth.uid;
  const callerEmail = context.auth.token.email;

  // 2. Verify caller is an active Admin
  await verifyAdmin(callerUid, callerEmail);

  // 3. Validate input parameters
  const { role, email, profileData } = data;
  if (!email || !role || !profileData) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: email, role, or profileData."
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRole = role.toLowerCase().trim();
  const db = admin.firestore();

  // Map roles to legacy collections
  let collectionName = "";
  if (normalizedRole === "student") {
    collectionName = "authorizedUsers";
  } else if (
    [
      "faculty",
      "librarian",
      "lab_assistant",
      "proctor",
      "hod",
      "dean",
      "registrar",
      "coe",
      "finance_officer",
      "it_support",
      "management"
    ].includes(normalizedRole)
  ) {
    collectionName = "faculties";
  } else if (normalizedRole === "admin" || normalizedRole === "administrator") {
    collectionName = "admins";
  } else {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `Invalid role specified: ${role}.`
    );
  }

  // 4. Locate UID
  let uid = profileData.uid || "";
  if (!uid) {
    const doc = await db.collection(collectionName).doc(normalizedEmail).get();
    if (doc.exists) {
      uid = doc.data().uid;
    }
  }

  if (!uid) {
    try {
      const authUser = await admin.auth().getUserByEmail(normalizedEmail);
      uid = authUser.uid;
    } catch (err) {
      console.error("Could not locate UID by email in Auth:", err);
    }
  }

  if (!uid) {
    throw new functions.https.HttpsError(
      "not-found",
      "User record does not have a linked Firebase UID."
    );
  }

  // 5. Update Auth account (e.g. displayName, disabled status)
  try {
    const authUpdate = {};
    if (profileData.name) authUpdate.displayName = profileData.name;
    if (profileData.status) {
      authUpdate.disabled = profileData.status.toUpperCase() === "INACTIVE";
    }
    
    await admin.auth().updateUser(uid, authUpdate);
  } catch (err) {
    console.error("Failed to update Auth account:", err);
  }

  // 6. Update Firestore documents
  try {
    const updateTime = admin.firestore.FieldValue.serverTimestamp();
    const legacyUpdate = {
      ...profileData,
      updatedAt: updateTime
    };

    const centralUpdate = {
      updatedAt: new Date().toISOString()
    };
    if (profileData.name) centralUpdate.name = profileData.name;
    if (profileData.status) centralUpdate.status = profileData.status.toLowerCase();
    if (profileData.role) centralUpdate.role = profileData.role.toLowerCase();

    // Update legacy collection
    await db.collection(collectionName).doc(normalizedEmail).update(legacyUpdate);

    // Update centralized users collection
    await db.collection("users").doc(uid).set(centralUpdate, { merge: true });

    return { success: true, message: "User updated successfully." };
  } catch (dbError) {
    console.error("Firestore update failed:", dbError);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to synchronize user profile in Firestore: " + dbError.message
    );
  }
});
