const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Cloud Function to securely provision PAMS users (Student, Faculty, Admin).
 * Only accessible by authenticated and authorized Admins.
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

  // 2. Verify caller is an active Admin in Firestore
  try {
    const adminDoc = await admin.firestore().collection("admins").doc(callerEmail).get();
    
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You are not authorized to provision user accounts."
      );
    }

    const adminData = adminDoc.data();
    if (adminData.role !== "ADMIN" || adminData.status !== "ACTIVE") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Your admin account is inactive or lacks correct permissions."
      );
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error;
    console.error("Authorization check failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to verify admin permissions."
    );
  }

  // 3. Validate requested role and payload
  const { role, email, profileData } = data;
  
  if (!email || !role || !profileData) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: email, role, or profileData."
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const tempPassword = "password123";

  let collectionName = "";
  if (role === "STUDENT") collectionName = "authorizedUsers";
  else if (role === "FACULTY" || role === "LAB_ASSISTANT" || role === "LIBRARIAN") collectionName = "faculties";
  else if (role === "ADMIN") collectionName = "admins";
  else {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid role specified. Accepted roles: STUDENT, FACULTY, LAB_ASSISTANT, LIBRARIAN, ADMIN."
    );
  }

  // 4. Duplicate Check - Firestore (within target collection)
  const db = admin.firestore();
  const existingDoc = await db.collection(collectionName).doc(normalizedEmail).get();
  if (existingDoc.exists) {
    throw new functions.https.HttpsError(
      "already-exists",
      "A profile with this email already exists in PAMS."
    );
  }

  // 4b. Cross-collection duplicate check (prevent same email in multiple collections)
  const crossCheckCollections = ["authorizedUsers", "faculties", "admins"].filter(c => c !== collectionName);
  for (const crossCol of crossCheckCollections) {
    const crossDoc = await db.collection(crossCol).doc(normalizedEmail).get();
    if (crossDoc.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "This email is already registered under a different role in PAMS."
      );
    }
  }

  // 5. Provision Firebase Authentication Account
  let newUserRecord;
  try {
    newUserRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: tempPassword,
      displayName: profileData.name || "",
    });
  } catch (authError) {
    console.error("Auth creation failed:", authError);
    if (authError.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError(
        "already-exists",
        "This user account already exists."
      );
    }
    throw new functions.https.HttpsError(
      "internal",
      "Unable to create authentication account."
    );
  }

  // 6. Create corresponding Firestore profile
  try {
    const docData = {
      ...profileData,
      uid: newUserRecord.uid,
      email: normalizedEmail,
      role: role,
      status: profileData.status || "ACTIVE",
      mustChangePassword: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection(collectionName).doc(normalizedEmail).set(docData);
    
    return { success: true, message: "User provisioned successfully.", uid: newUserRecord.uid };
  } catch (dbError) {
    console.error("Firestore creation failed, rolling back Auth...", dbError);
    // 7. Partial Failure Rollback
    try {
      await admin.auth().deleteUser(newUserRecord.uid);
    } catch (cleanupError) {
      console.error("Rollback failed. Orphaned Auth account:", cleanupError);
    }
    throw new functions.https.HttpsError(
      "internal",
      "User provisioning could not be completed. Please retry or contact the system administrator."
    );
  }
});
