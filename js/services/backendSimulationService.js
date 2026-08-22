/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - BACKEND SIMULATION SERVICE
   (Client-side Provisioning using Secondary Firebase App workaround for Free Tier)
   ========================================================================== */

const BackendSimulationService = {
  /**
   * Provisions a user securely by creating an Auth account via a secondary
   * Firebase app (to avoid logging out the current Admin) and writing the
   * profile to Firestore using the primary authenticated app.
   * 
   * @param {Object} userData - Data for Firestore profile
   * @param {string} role - 'STUDENT', 'FACULTY', or 'ADMIN'
   */
  async provisionUser(userData, role) {
    if (!window.firebase || !window.FirebaseService || !window.FirebaseService.db) {
      throw new Error("Firebase is not properly initialized.");
    }

    const email = userData.email.toLowerCase().trim();
    const tempPassword = "password123";

    let collectionName = "";
    if (role === "STUDENT") collectionName = "authorizedUsers";
    else if (role === "FACULTY") collectionName = "faculties";
    else if (role === "ADMIN") collectionName = "admins";
    else throw new Error("Invalid role specified.");

    const db = window.FirebaseService.db;

    try {
      // 1. Check if user already exists in Firestore (Duplicate Check)
      const existingDoc = await db.collection(collectionName).doc(email).get();
      if (existingDoc.exists) {
        throw new Error("This account already exists.");
      }

      // 2. Initialize Secondary Firebase App if it doesn't exist
      let secondaryApp;
      const secondaryAppName = 'ProvisioningApp';
      if (!window.firebase.apps.some(app => app.name === secondaryAppName)) {
        secondaryApp = window.firebase.initializeApp(window.PAMS_CONFIG.FIREBASE_CONFIG, secondaryAppName);
      } else {
        secondaryApp = window.firebase.app(secondaryAppName);
      }

      // 3. Create Auth Account using the Secondary App
      let uid = "";
      try {
        const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, tempPassword);
        uid = userCredential.user.uid;
        
        // Immediately sign out the secondary app so it doesn't linger
        await secondaryApp.auth().signOut();
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error("This email is already registered in Firebase Authentication.");
        }
        console.error("Auth creation failed:", authErr);
        throw new Error("Unable to create authentication account. " + authErr.message);
      }

      // 4. Create the Firestore Document using the Primary App (Authenticated as Admin)
      const docData = {
        ...userData,
        uid: uid,
        email: email,
        role: role,
        status: userData.status || "ACTIVE",
        mustChangePassword: true,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection(collectionName).doc(email).set(docData);

      return { success: true, message: "User provisioned successfully.", uid: uid, profile: docData };

    } catch (err) {
      console.error("[PAMS PROVISIONING ERROR] Client-Side Fallback Failed:", err);
      throw new Error(err.message || "User provisioning could not be completed. Please contact the system administrator.");
    }
  }
};

window.BackendSimulationService = BackendSimulationService;
