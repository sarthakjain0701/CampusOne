/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - BACKEND SIMULATION SERVICE
   (Now delegates to the trusted Firebase Cloud Function for user provisioning)
   ========================================================================== */

const BackendSimulationService = {
  /**
   * Provisions a user securely by calling the 'provisionUser' Cloud Function.
   * 
   * @param {Object} userData - Data for Firestore profile
   * @param {string} role - 'STUDENT', 'FACULTY', or 'ADMIN'
   */
  async provisionUser(userData, role) {
    if (!window.firebase || !window.firebase.functions) {
      throw new Error("Firebase Functions SDK is not properly initialized.");
    }

    const email = userData.email.toLowerCase().trim();

    try {
      // Call the Cloud Function securely
      const provisionFunction = window.firebase.functions().httpsCallable('provisionUser');
      
      const result = await provisionFunction({
        role: role,
        email: email,
        profileData: userData
      });

      // result.data contains the response from the Cloud Function
      return { 
        success: true, 
        message: result.data.message || "User provisioned successfully.", 
        uid: result.data.uid, 
        profile: userData 
      };

    } catch (err) {
      console.error("PROVISIONING DIAGNOSIS");
      console.error("Firebase error code: ", err.code || 'UNKNOWN');
      console.error("Firebase error message: ", err.message || 'UNKNOWN');
      console.error("HTTP status: ", err.status || 'UNKNOWN');
      console.error("Authenticated user: ", window.firebase && window.firebase.auth().currentUser ? window.firebase.auth().currentUser.uid : 'None');

      throw new Error(err.message || "User provisioning could not be completed. Please contact the system administrator.");
    }
  }
};

window.BackendSimulationService = BackendSimulationService;
