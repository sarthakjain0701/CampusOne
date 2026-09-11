/* ==========================================================================
   POORNIMA ATTENDANCE MANAGEMENT SYSTEM (PAMS) - CENTRALIZED FIREBASE SERVICE
   Firebase Web SDK v10 Auth & Cloud Firestore Adapter with Centralized Auth State
   ========================================================================== */

const FirebaseService = {
  isInitialized: false,
  auth: null,
  db: null,
  currentUser: null,
  rawFirebaseUser: null,
  isAuthReady: false,
  _authReadyResolve: null,
  _authReadyPromise: null,
  _authListenerRegistered: false,
  _authSubscribers: new Set(),

  init() {
    if (this._authReadyPromise) {
      return this._authReadyPromise;
    }

    this._authReadyPromise = new Promise((resolve) => {
      this._authReadyResolve = resolve;
    });

    try {
      if (!this.isInitialized) {
        if (window.firebase && window.firebase.apps && window.firebase.apps.length === 0) {
          window.firebase.initializeApp(window.PAMS_CONFIG.FIREBASE_CONFIG);
        }
        
        if (window.firebase) {
          this.auth = window.firebase.auth();
          this.db = window.firebase.firestore();
          
          // Enable offline cache if available
          try {
            this.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn("Auth persistence:", e));
          } catch (pErr) {
            console.warn("Set persistence notice:", pErr);
          }

          // Register SINGLE centralized onAuthStateChanged listener
          if (!this._authListenerRegistered && this.auth) {
            this._authListenerRegistered = true;
            this.auth.onAuthStateChanged(async (firebaseUser) => {
              this.rawFirebaseUser = firebaseUser;
              
              if (firebaseUser) {
                // If we don't have user in memory, try loading from local session or Firestore
                if (!this.currentUser) {
                  const stored = localStorage.getItem('pas_session_user');
                  if (stored) {
                    try {
                      this.currentUser = JSON.parse(stored);
                      if (window.DataStore) window.DataStore.setCurrentUser(this.currentUser);
                    } catch (e) {
                      console.warn("Error parsing stored session:", e);
                    }
                  }
                  
                  // Non-blocking background verification if needed
                  this._verifyAndRefreshProfile(firebaseUser).catch(err => {
                    console.warn("Background profile sync:", err);
                  });
                }
              } else {
                // Signed out
                this.currentUser = null;
                if (window.DataStore) window.DataStore.setCurrentUser(null);
                localStorage.removeItem('pas_session_user');
              }

              this.isAuthReady = true;
              if (this._authReadyResolve) {
                this._authReadyResolve(this.currentUser);
                this._authReadyResolve = null;
              }
              this._notifyAuthSubscribers(this.currentUser);
            });
          }
        }
        this.isInitialized = true;
      }
    } catch (err) {
      console.warn("Firebase Init notice: Using hybrid DataStore fallback mode.", err);
      this.isInitialized = true;
      this.isAuthReady = true;
      if (this._authReadyResolve) {
        this._authReadyResolve(this.currentUser);
        this._authReadyResolve = null;
      }
    }

    return this._authReadyPromise;
  },

  async waitForAuthReady() {
    if (this.isAuthReady) return this.currentUser;
    return this.init();
  },

  subscribeAuthState(callback) {
    if (typeof callback === 'function') {
      this._authSubscribers.add(callback);
      if (this.isAuthReady) {
        callback(this.currentUser);
      }
    }
    return () => this._authSubscribers.delete(callback);
  },

  _notifyAuthSubscribers(user) {
    this._authSubscribers.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error("Auth subscriber error:", err);
      }
    });
  },

  async _verifyAndRefreshProfile(firebaseUser) {
    if (!this.db || !firebaseUser) return null;
    try {
      const userDoc = await this.db.collection('users').doc(firebaseUser.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const roleLower = (userData.role || '').toLowerCase();
        const normalizedRole = (roleLower === 'administrator' || roleLower === 'admin') ? 'ADMIN' : roleLower.toUpperCase();
        
        this.currentUser = {
          uid: firebaseUser.uid,
          email: userData.email || firebaseUser.email,
          role: normalizedRole,
          name: userData.name || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
          active: (userData.status || 'ACTIVE').toUpperCase() === 'ACTIVE',
          mustChangePassword: userData.mustChangePassword === true
        };

        localStorage.setItem('pas_session_user', JSON.stringify(this.currentUser));
        if (window.DataStore) window.DataStore.setCurrentUser(this.currentUser);
        return this.currentUser;
      }
    } catch (err) {
      console.warn("Silent profile sync skipped:", err);
    }
    return this.currentUser;
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
      // 2. Dynamic Migration Fallback: Query legacy collections in PARALLEL
      console.log(`Profile missing in centralized "users" collection for ${authenticatedEmail}. Searching legacy collections in parallel...`);
      
      let legacyDoc = null;
      let legacyRole = '';
      
      try {
        const [adminSnap, facultySnap, studentSnap] = await Promise.allSettled([
          this.db.collection('admins').doc(authenticatedEmail).get(),
          this.db.collection('faculties').doc(authenticatedEmail).get(),
          this.db.collection('authorizedUsers').doc(authenticatedEmail).get()
        ]);

        if (adminSnap.status === 'fulfilled' && adminSnap.value.exists) {
          legacyDoc = adminSnap.value;
          legacyRole = 'ADMIN';
        } else if (facultySnap.status === 'fulfilled' && facultySnap.value.exists) {
          legacyDoc = facultySnap.value;
          const data = legacyDoc.data();
          legacyRole = (data.role || data.staffRole || 'FACULTY').toUpperCase();
        } else if (studentSnap.status === 'fulfilled' && studentSnap.value.exists) {
          legacyDoc = studentSnap.value;
          legacyRole = 'STUDENT';
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
          status: (legacyData.status || 'ACTIVE').toLowerCase(),
          name: legacyData.name || authenticatedEmail.split('@')[0],
          updatedAt: new Date().toISOString(),
          createdAt: legacyData.createdAt || new Date().toISOString()
        };

        // Write non-blocking
        this.db.collection('users').doc(firebaseUser.uid).set(userData).catch(err => {
          console.error("Failed to write migrated user profile to Firestore", err);
        });
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

    // 4. Convert to PAMS internal user object structure for the session
    const normalizedRole = (roleLower === 'administrator' || roleLower === 'admin') ? 'ADMIN' : roleLower.toUpperCase();
    const pamsUser = {
      uid: firebaseUser.uid,
      email: userData.email || authenticatedEmail,
      role: normalizedRole,
      name: userData.name || authenticatedEmail.split('@')[0],
      active: true,
      mustChangePassword: userData.mustChangePassword === true
    };

    this.currentUser = pamsUser;
    this.rawFirebaseUser = firebaseUser;
    if (window.DataStore) window.DataStore.setCurrentUser(pamsUser);
    localStorage.setItem('pas_session_user', JSON.stringify(pamsUser));
    this._notifyAuthSubscribers(pamsUser);
    
    return pamsUser;
  },

  async signOut() {
    if (this.auth) {
      try {
        await this.auth.signOut();
      } catch (err) {
        console.warn("Sign out notice:", err);
      }
    }
    this.currentUser = null;
    this.rawFirebaseUser = null;
    if (window.DataStore) window.DataStore.setCurrentUser(null);
    localStorage.removeItem('pas_session_user');
    this._notifyAuthSubscribers(null);
    return true;
  },

  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem('pas_session_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        this.currentUser = null;
      }
    }
    return this.currentUser;
  }
};

window.FirebaseService = FirebaseService;

