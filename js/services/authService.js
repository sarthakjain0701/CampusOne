/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - AUTHENTICATION SERVICE
   Centralized Client-Side Auth State with Firebase Auth Synchronization
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

    if (!safeEmail.endsWith('@poornima.org')) {
      throw new Error("Access restricted: Please use your official @poornima.org email address.");
    }

    if (!window.FirebaseService) {
      throw new Error("Firebase Service is not loaded.");
    }

    // Call Firebase Service which handles Auth + Firestore Verification + Centralized State
    return await window.FirebaseService.loginWithEmailAndPassword(safeEmail, password);
  },

  async resetPassword(email) {
    const safeEmail = email ? email.trim().toLowerCase() : '';
    if (!window.Validation) {
      // Basic fallback if Validation isn't globally available here
      if (!safeEmail || !safeEmail.includes('@')) throw new Error("Please enter a valid email address.");
    } else {
      if (!Validation.isRequired(safeEmail) || !Validation.isValidEmail(safeEmail)) {
        throw new Error("Please enter a valid email address.");
      }
    }

    if (!safeEmail.endsWith('@poornima.org')) {
      throw new Error("Access restricted: Please use your official @poornima.org email address.");
    }
    if (!window.firebase || !window.firebase.auth) {
      throw new Error("Firebase Service is not loaded.");
    }
    return await window.firebase.auth().sendPasswordResetEmail(safeEmail);
  },

  async logout() {
    if (window.FirebaseService) {
      try {
        await window.FirebaseService.signOut();
      } catch (err) {
        console.warn("Firebase signout failed", err);
      }
    }
    localStorage.removeItem(this.STORAGE_KEY);
    if (window.DataStore) window.DataStore.setCurrentUser(null);
    return true;
  },

  getCurrentUser() {
    let user = null;
    if (window.FirebaseService && window.FirebaseService.currentUser) {
      user = window.FirebaseService.currentUser;
    } else {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        try {
          user = JSON.parse(data);
          if (window.FirebaseService) window.FirebaseService.currentUser = user;
        } catch (e) {
          return null;
        }
      }
    }
    if (user && user.role) {
      user.role = String(user.role).trim().toUpperCase();
    }
    return user;
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

