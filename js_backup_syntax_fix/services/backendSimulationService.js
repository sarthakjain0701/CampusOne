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
    console.warn("DEPRECATED: BackendSimulationService.provisionUser is no longer supported.");
    console.warn("Please use the secure Cloud Function 'provisionUser' instead.");
    throw new Error("Client-side provisioning has been disabled for security reasons.");
  }
};

window.BackendSimulationService = BackendSimulationService;
