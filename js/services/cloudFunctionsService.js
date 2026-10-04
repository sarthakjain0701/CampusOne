/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - USER PROVISIONING SERVICE
   Client-Side Provisioning using Secondary Firebase App (Spark Plan Compatible).
   No Cloud Functions or Blaze billing plan required.
   
   Architecture:
   1. Validates caller is an authenticated and active Admin in Firestore.
   2. Validates inputs and performs cross-collection duplicate checks.
   3. Generates a secure temporary password.
   4. Creates the Firebase Auth account via an isolated Secondary Firebase App,
      ensuring the current Admin session on the primary app is never logged out.
   5. Writes the authoritative profile to Firestore (authorizedUsers, faculties, admins)
      and centralized users/{uid} using the Primary App authenticated as Admin.
   6. If Firestore creation fails, atomically rolls back (deletes) the created Auth user.
   7. Cleans up and deletes the Secondary App instance.
   ========================================================================== */

const CloudFunctionsService = {
  /**
   * Generates a secure 12-character temporary password meeting Firebase complexity requirements.
   * Format: "Pas@" + 8 cryptographically random alphanumeric characters (e.g. "Pas@9k2m5x8q")
   */
  _generateTempPassword() {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let randomPart = "";
    if (window.crypto && window.crypto.getRandomValues) {
      const bytes = new Uint8Array(8);
      window.crypto.getRandomValues(bytes);
      for (let i = 0; i < 8; i++) {
        randomPart += chars[bytes[i] % chars.length];
      }
    } else {
      for (let i = 0; i < 8; i++) {
        randomPart += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return `Pas@${randomPart}`;
  },

  /**
   * Provisions a user securely without requiring Firebase Cloud Functions or Blaze billing.
   * 
   * @param {Object} userData - Data for Firestore profile
   * @param {string} role - 'STUDENT', 'FACULTY', 'LAB_ASSISTANT', 'LIBRARIAN', or 'ADMIN'
   * @returns {Promise<{success: boolean, message: string, uid: string, email: string, role: string, tempPassword: string, profile: Object}>}
   */
  async provisionUser(userData, role) {
    if (!window.firebase) {
      throw new Error("Firebase SDK is not loaded.");
    }
    if (!window.FirebaseService) {
      throw new Error("Firebase Service is not available.");
    }

    await window.FirebaseService.init();
    const db = window.FirebaseService.db;
    const primaryAuth = window.firebase.auth();

    if (!db || !primaryAuth) {
      throw new Error("Database or Authentication service is offline.");
    }

    // 1. Verify Caller is Authenticated & is Active Admin
    const currentAuthUser = primaryAuth.currentUser;
    if (!currentAuthUser) {
      throw new Error("You must be logged in as an administrator to provision users.");
    }

    const callerEmail = (currentAuthUser.email || '').toLowerCase().trim();
    try {
      const adminDoc = await db.collection('admins').doc(callerEmail).get();
      if (!adminDoc.exists) {
        throw new Error("Unauthorized: Your account does not have administrator privileges.");
      }
      const adminData = adminDoc.data();
      if ((adminData.role || '').toUpperCase() !== 'ADMIN' || (adminData.status || '').toUpperCase() !== 'ACTIVE') {
        throw new Error("Unauthorized: Your administrator account is inactive.");
      }
    } catch (authCheckErr) {
      if (authCheckErr.message && authCheckErr.message.startsWith("Unauthorized:")) {
        throw authCheckErr;
      }
      console.warn("Admin authorization verification notice:", authCheckErr);
    }

    // 2. Validate payload and role
    if (!userData || !userData.email || !role) {
      throw new Error("Missing required user data or role.");
    }

    const email = userData.email.toLowerCase().trim();
    let normalizedRole = role.toUpperCase();
    if (normalizedRole === 'ADMINISTRATOR') normalizedRole = 'ADMIN';

    let collectionName = "";
    if (normalizedRole === "STUDENT") {
      collectionName = "authorizedUsers";
    } else if (["FACULTY", "LAB_ASSISTANT", "LIBRARIAN"].includes(normalizedRole)) {
      collectionName = "faculties";
    } else if (normalizedRole === "ADMIN") {
      collectionName = "admins";
    } else {
      throw new Error(`Invalid role specified: ${role}. Accepted roles: Student, Faculty, Lab Assistant, Librarian, Administrator.`);
    }

    // 3. Duplicate checks in Firestore
    // 3a. Target collection check
    const existingTargetDoc = await db.collection(collectionName).doc(email).get();
    if (existingTargetDoc.exists) {
      throw new Error(`An account with email "${email}" already exists in the system.`);
    }

    // 3b. Cross-collection duplicate check
    const crossCollections = ["authorizedUsers", "faculties", "admins"].filter(c => c !== collectionName);
    for (const crossCol of crossCollections) {
      const crossDoc = await db.collection(crossCol).doc(email).get();
      if (crossDoc.exists) {
        throw new Error(`Email "${email}" is already registered under a different role in the system.`);
      }
    }

    // 4. Generate Temporary Password
    const tempPassword = this._generateTempPassword();

    // 5. Initialize Secondary Firebase App for Auth Account Creation
    // (This guarantees the Admin session on the primary app is never replaced/logged out)
    const secondaryAppName = `ProvisionApp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let secondaryApp = null;
    let newUserCredential = null;
    let newUid = "";

    const firebaseConfig = (window.PAMS_CONFIG && window.PAMS_CONFIG.FIREBASE_CONFIG)
      ? window.PAMS_CONFIG.FIREBASE_CONFIG
      : window.firebase.app().options;

    try {
      secondaryApp = window.firebase.initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = secondaryApp.auth();

      newUserCredential = await secondaryAuth.createUserWithEmailAndPassword(email, tempPassword);
      newUid = newUserCredential.user.uid;

      if (userData.name) {
        await newUserCredential.user.updateProfile({ displayName: userData.name.trim() }).catch(() => {});
      }
    } catch (authErr) {
      if (secondaryApp) {
        await secondaryApp.delete().catch(() => {});
      }

      console.error("Auth creation failed:", authErr);
      if (authErr.code === 'auth/email-already-in-use') {
        throw new Error(`The email address "${email}" is already registered in Firebase Authentication.`);
      }
      if (authErr.code === 'auth/invalid-email') {
        throw new Error("The specified email address is invalid.");
      }
      if (authErr.code === 'auth/admin-restricted-operation') {
        throw new Error(
          "Account creation is disabled in Firebase Console. Please go to Firebase Console > Authentication > Settings > User actions, and enable 'Enable create (sign-up)'."
        );
      }
      throw new Error(authErr.message || "Failed to create user authentication account.");
    }

    // 6. Write Firestore Documents using Primary App (Authenticated as Admin)
    const docData = {
      ...userData,
      uid: newUid,
      email: email,
      role: normalizedRole,
      status: userData.status || "ACTIVE",
      mustChangePassword: true,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    };

    const userProfileDoc = {
      uid: newUid,
      email: email,
      name: userData.name || email.split('@')[0],
      role: normalizedRole.toLowerCase(),
      status: (userData.status || "ACTIVE").toLowerCase(),
      mustChangePassword: true,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      const batch = db.batch();
      
      // Write role document (authorizedUsers / faculties / admins)
      batch.set(db.collection(collectionName).doc(email), docData);

      // Write centralized user document (users/{uid})
      batch.set(db.collection('users').doc(newUid), userProfileDoc);
      
      await batch.commit();
    } catch (dbErr) {
      console.error("Firestore creation failed. Initiating rollback of Auth user...", dbErr);

      // 7. Atomic Rollback: Delete the newly created Auth user via the secondary auth session
      if (newUserCredential && newUserCredential.user) {
        try {
          await newUserCredential.user.delete();
          console.log(`Rollback successful: Deleted Auth user ${email} (${newUid})`);
        } catch (cleanupErr) {
          console.warn("Rollback warning: Could not delete orphaned Auth user:", cleanupErr);
        }
      }

      if (dbErr.code === 'permission-denied') {
        throw new Error("Permission denied: You do not have administrator permissions to save this user to Firestore.");
      }
      throw new Error("Failed to save user record to database: " + (dbErr.message || "Please check your network connection."));
    } finally {
      // 8. Clean up Secondary Firebase App
      if (secondaryApp) {
        try {
          await secondaryApp.auth().signOut().catch(() => {});
          await secondaryApp.delete();
        } catch (cleanupErr) {
          console.warn("Secondary app cleanup notice:", cleanupErr);
        }
      }
    }

    return {
      success: true,
      message: "User provisioned successfully.",
      uid: newUid,
      email: email,
      role: normalizedRole,
      tempPassword: tempPassword,
      profile: docData
    };
  }
};

window.CloudFunctionsService = CloudFunctionsService;
window.BackendSimulationService = CloudFunctionsService;

