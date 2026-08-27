/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - AUTHENTICATION SERVICE (MOCK)
   Pure client-side authentication without Firebase dependencies.
   ========================================================================== */

const authService = {
  STORAGE_KEY: 'pas_session_user',

  async login(email, password) {
    const safeEmail = email ? email.trim().toLowerCase() : '';
    
    // Validate inputs
    if (!Validation.isRequired(safeEmail) || !Validation.isValidEmail(safeEmail)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!Validation.isRequired(password)) {
      throw new Error("Password is required.");
    }

    if (!window.FirebaseService) {
      throw new Error("Firebase Service is not loaded.");
    }

    // Call Firebase Service which handles Auth + Firestore Verification + Local Session
    return await window.FirebaseService.loginWithEmailAndPassword(safeEmail, password);
  },

  async logout() {
    const user = this.getCurrentUser();
    if (user && window.FirebaseService) {
      try {
        await window.FirebaseService.signOut();
      } catch (err) {
        console.warn("Firebase signout failed", err);
      }
    }
    localStorage.removeItem(this.STORAGE_KEY);
    return true;
  },

  getCurrentUser() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  getCurrentRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  isAuthorized(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }
};

window.authService = authService;
