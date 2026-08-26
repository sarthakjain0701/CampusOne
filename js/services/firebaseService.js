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

  async loginWithEmailAndPassword(email, password, expectedRole) {
    await this.init();
    
    if (!this.auth || !this.db) {
      throw new Error("Firebase is not properly configured. Cannot sign in.");
    }

    let result;
    try {
      result = await this.auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      throw new Error("Invalid email or password.");
    }

    const firebaseUser = result.user;
    const authenticatedEmail = firebaseUser.email.toLowerCase().trim();

    let collectionName = '';
    let roleText = '';
    if (expectedRole === 'STUDENT') {
      collectionName = 'authorizedUsers';
      roleText = 'Student';
    } else if (expectedRole === 'FACULTY') {
      collectionName = 'faculties';
      roleText = 'Faculty';
    } else if (expectedRole === 'ADMIN') {
      collectionName = 'admins';
      roleText = 'Admin';
    } else if (expectedRole === 'LIBRARIAN') {
      collectionName = 'faculties';
      roleText = 'Librarian';
    } else {
      await this.auth.signOut();
      throw new Error("Invalid role selected.");
    }

    let authDoc;
    try {
      authDoc = await this.db.collection(collectionName).doc(authenticatedEmail).get();
    } catch (err) {
      console.error(err);
      await this.auth.signOut();
      throw new Error("Unable to verify authorization. Please try again.");
    }

    if (!authDoc.exists) {
      await this.auth.signOut();
      if (expectedRole === 'ADMIN') {
        throw new Error("This account is not registered as Admin.");
      } else if (expectedRole === 'LIBRARIAN') {
        throw new Error("This account is not registered as Librarian.");
      }
      throw new Error(${This account is not registered as ${expectedRole === 'FACULTY' ? 'Faculty' : 'a Student'}.});
    }

    const finalAuthData = authDoc.data();

    if (finalAuthData.role !== expectedRole) {
      await this.auth.signOut();
      if (expectedRole === 'ADMIN') {
        throw new Error("This account is not registered as Admin.");
      } else if (expectedRole === 'LIBRARIAN') {
        throw new Error("This account is not registered as Librarian.");
      }
      throw new Error(${This account is not registered as ${expectedRole === 'FACULTY' ? 'Faculty' : 'a Student'}.});
    }

    if (finalAuthData.status && finalAuthData.status !== 'ACTIVE') {
      await this.auth.signOut();
      throw new Error("Your PAMS account is inactive. Please contact the administrator.");
    }

    // Write to users collection
    const userData = {
      uid: firebaseUser.uid,
      email: authenticatedEmail,
      role: finalAuthData.role,
      status: finalAuthData.status || 'ACTIVE',
      name: finalAuthData.name || authenticatedEmail.split('@')[0],
      updatedAt: new Date().toISOString()
    };

    try {
      await this.db.collection('users').doc(firebaseUser.uid).set(userData, { merge: true });
    } catch (err) {
      console.error("Failed to update user record", err);
    }

    // Convert to PAMS internal user object structure for the session
    const pamsUser = {
      uid: firebaseUser.uid,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      active: userData.status === 'ACTIVE',
      mustChangePassword: finalAuthData.mustChangePassword === true
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

