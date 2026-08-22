/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - BACKEND SIMULATION SERVICE
   (Now delegates to the secure Firebase Cloud Function backend)
   ========================================================================== */

const BackendSimulationService = {
  /**
   * Provisions a user securely by calling the 'provisionUser' Cloud Function.
   * @param {Object} userData - Data for Firestore profile
   * @param {string} role - 'STUDENT', 'FACULTY', or 'ADMIN'
   */
  async provisionUser(userData, role) {
    if (!window.firebase || !window.firebase.functions) {
      throw new Error("Firebase Functions SDK is not loaded.");
    }

    try {
      const provisionUserFunction = window.firebase.functions().httpsCallable('provisionUser');
      
      const payload = {
        role: role,
        email: userData.email,
        profileData: userData
      };

      const result = await provisionUserFunction(payload);
      return result.data;
    } catch (err) {
      console.error("Cloud Function provisionUser failed:", err);
      // Map Firebase Functions errors to user-friendly messages
      if (err.code === 'functions/permission-denied') {
        throw new Error("You are not authorized to provision user accounts.");
      }
      if (err.code === 'functions/unauthenticated') {
        throw new Error("You must be logged in to provision users.");
      }
      if (err.code === 'functions/already-exists') {
        throw new Error("This user account already exists.");
      }
      if (err.code === 'functions/invalid-argument') {
        throw new Error("Invalid data submitted. Please check the required fields.");
      }
      // If the backend threw a specific message, use it
      if (err.message && !err.message.includes("internal")) {
        throw new Error(err.message);
      }
      
      throw new Error("User provisioning could not be completed. Please retry or contact the system administrator.");
    }
  }
};

window.BackendSimulationService = BackendSimulationService;
