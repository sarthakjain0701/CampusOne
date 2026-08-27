/* ==========================================================================
   POORNIMA ATTENDANCE MANAGEMENT SYSTEM (PAMS) - FIREBASE SERVICE
   Firebase Web SDK v10 Auth & Cloud Firestore Adapter
   ========================================================================== */

const FirebaseService = {
  isInitialized: false,
  auth: null,
  db: null,

  async init() {
    try {
      if (!this.isInitialized) {
        if (window.firebase && window.firebase.apps && window.firebase.apps.length === 0) {
          window.firebase.initializeApp(window.PAMS_CONFIG.FIREBASE_CONFIG);
        }
        
        if (window.firebase) {
          this.auth = window.firebase.auth();
          this.db = window.firebase.firestore();
          // Optional: handle auth state persistence here if needed
          await this.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
        }
        this.isInitialized = true;
      }
    } catch (err) {
      console.warn("Firebase Init notice: Using hybrid DataStore fallback mode.", err);
      this.isInitialized = true;
    }
  },

  async loginWithEmailAndPassword(email, password) {
    await this.init();
    
    if (!this.auth || !this.db) {
      throw new Error("Firebase is not properly configured. Cannot sign in.");
    }

    let result;
    try {
      result = await this.auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        throw new Error("Invalid email or password.");
      } else {
        throw new Error("Unable to connect. Please check your internet connection and try again.");
      }
    }

    const firebaseUser = result.user;
    const authenticatedEmail = firebaseUser.email.toLowerCase().trim();

    // 1. Fetch from centralized "users" collection first
    let userDoc;
    try {
      userDoc = await this.db.collection('users').doc(firebaseUser.uid).get();
    } catch (err) {
      console.error(err);
      await this.auth.signOut();
      throw new Error("Unable to verify authorization. Please check your connection.");
    }

    let userData;
    if (userDoc.exists) {
      userData = userDoc.data();
    } else {
      // 2. Dynamic Migration Fallback: Query legacy collections
      console.log(`Profile missing in centralized "users" collection for ${authenticatedEmail}. Searching legacy collections...`);
      
      let legacyDoc;
      let legacyRole = '';
      
      // Try admins first
      try {
        legacyDoc = await this.db.collection('admins').doc(authenticatedEmail).get();
        if (legacyDoc.exists) {
          legacyRole = 'administrator';
        } else {
          // Try faculties next
          legacyDoc = await this.db.collection('faculties').doc(authenticatedEmail).get();
          if (legacyDoc.exists) {
            const data = legacyDoc.data();
            legacyRole = (data.role || data.staffRole || 'faculty').toLowerCase();
            if (legacyRole === 'librarian') legacyRole = 'librarian';
            else if (legacyRole === 'faculty') legacyRole = 'faculty';
            else if (legacyRole === 'lab_assistant') legacyRole = 'lab_assistant';
          } else {
            // Try authorizedUsers (students) last
            legacyDoc = await this.db.collection('authorizedUsers').doc(authenticatedEmail).get();
            if (legacyDoc.exists) {
              legacyRole = 'student';
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch legacy documents during fallback check", err);
      }

      if (legacyDoc && legacyDoc.exists) {
        const legacyData = legacyDoc.data();
        
        // Write the normalized document to users/{uid}
        userData = {
          uid: firebaseUser.uid,
          email: authenticatedEmail,
          role: legacyRole.toLowerCase(),
          status: (legacyData.status || 'active').toLowerCase(),
          name: legacyData.name || authenticatedEmail.split('@')[0],
          updatedAt: new Date().toISOString(),
          createdAt: legacyData.createdAt || new Date().toISOString()
        };

        try {
          await this.db.collection('users').doc(firebaseUser.uid).set(userData);
          console.log(`Successfully migrated user ${authenticatedEmail} to centralized users collection with role: ${userData.role}`);
        } catch (err) {
          console.error("Failed to write migrated user profile to Firestore", err);
        }
      } else {
        await this.auth.signOut();
        throw new Error("User profile not found. Please contact the administrator.");
      }
    }

    // 3. Validation Checks
    if (!userData.role) {
      await this.auth.signOut();
      throw new Error("Your account role is not configured. Please contact the administrator.");
    }
    
    const roleLower = userData.role.toLowerCase();
    if (!window.ROLE_CONFIG[roleLower]) {
      await this.auth.signOut();
      throw new Error("Your account role is not configured. Please contact the administrator.");
    }

    const statusLower = (userData.status || '').toLowerCase();
    if (statusLower !== 'active') {
      await this.auth.signOut();
      throw new Error("Your account is inactive. Please contact the administrator.");
    }

    // 4. Convert to PAMS internal user object structure for the session (normalise role to UPPERCASE for runtime backward-compatibility)
    const normalizedRole = (roleLower === 'administrator' || roleLower === 'admin') ? 'ADMIN' : roleLower.toUpperCase();
    const pamsUser = {
      uid: firebaseUser.uid,
      email: userData.email,
      role: normalizedRole,
      name: userData.name,
      active: true,
      mustChangePassword: userData.mustChangePassword === true
    };

    window.DataStore.setCurrentUser(pamsUser);
    localStorage.setItem('pas_session_user', JSON.stringify(pamsUser));
    
    return pamsUser;
  },

  async signOut() {
    if (this.auth) {
      await this.auth.signOut();
    }
    window.DataStore.setCurrentUser(null);
    return true;
  },

  async getCurrentUser() {
    return window.DataStore.getCurrentUser();
  }
};

window.FirebaseService = FirebaseService;
