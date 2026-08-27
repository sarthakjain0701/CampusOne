/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - ADMIN SERVICE
   Firestore-backed CRUD for Admins (admins collection).
   Firestore is the source of truth.
   ========================================================================== */

const adminService = {
  _unsubscribe: null,

  // --------------------------------------------------------------------------
  // FIRESTORE HELPERS
  // --------------------------------------------------------------------------
  async _ensureDb() {
    if (!window.FirebaseService) throw new Error("Firebase Service is not loaded.");
    await window.FirebaseService.init();
    if (!window.FirebaseService.db) throw new Error("Firestore is not available. Please check your connection.");
    return window.FirebaseService.db;
  },

  _collection() {
    return 'admins';
  },

  // --------------------------------------------------------------------------
  // READ — One-shot
  // --------------------------------------------------------------------------
  async getAdmins() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection()).get();
      const admins = [];
      snapshot.forEach(doc => {
        admins.push({ id: doc.id, email: doc.id, ...doc.data() });
      });
      return admins;
    } catch (err) {
      console.error("Failed to fetch admins from Firestore", err);
      throw new Error("Unable to load administrator records. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // READ — Single document
  // --------------------------------------------------------------------------
  async getAdminById(docId) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(docId).get();
      if (!doc.exists) return null;
      return { id: doc.id, email: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to fetch admin", err);
      throw new Error("Unable to load admin information.");
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME LISTENER
  // --------------------------------------------------------------------------
  listenToAdmins(callback) {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }

    const setup = async () => {
      const db = await this._ensureDb();
      this._unsubscribe = db.collection(this._collection()).onSnapshot(
        (snapshot) => {
          const admins = [];
          snapshot.forEach(doc => {
            admins.push({ id: doc.id, email: doc.id, ...doc.data() });
          });
          callback(null, admins);
        },
        (err) => {
          console.error("Admin listener error", err);
          callback(new Error("Unable to load admin records. Real-time sync failed."), []);
        }
      );
    };
    setup().catch(err => callback(err, []));
  },

  stopListening() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  },

  // --------------------------------------------------------------------------
  // CREATE — Provisions Firebase Auth + Firestore doc
  // --------------------------------------------------------------------------
  async addAdmin(adminData) {
    const rules = {
      name: { required: true, label: "Admin Name" },
      email: { required: true, email: true, label: "Official Email" }
    };

    const valResult = Validation.validateForm(adminData, rules);
    if (!valResult.isValid) {
      throw new Error(Object.values(valResult.errors)[0]);
    }

    if (!adminData.email.endsWith('@poornima.org')) {
      throw new Error("Admin accounts must use an @poornima.org email address.");
    }

    const payload = {
      name: adminData.name.trim(),
      email: adminData.email.trim().toLowerCase(),
      status: adminData.status || 'ACTIVE',
      role: 'ADMIN'
    };

    try {
      if (!window.BackendSimulationService) {
        throw new Error("Client Provisioning Service is not loaded.");
      }
      await window.BackendSimulationService.provisionUser(payload, 'ADMIN');
      return payload;
    } catch (err) {
      console.error("[PAMS PROVISIONING ERROR]", err);
      let uiMessage = err.message || "Unable to provision admin account. Please try again.";
      if (err.message && err.message.includes('already exists')) {
        uiMessage = "Admin account already exists.";
      }
      throw new Error(uiMessage);
    }
  },

  // --------------------------------------------------------------------------
  // UPDATE — Writes directly to Firestore
  // --------------------------------------------------------------------------
  async updateAdmin(docId, updatedFields) {
    try {
      if (!window.BackendSimulationService) {
        throw new Error("Client Provisioning Service is not loaded.");
      }
      const payload = {
        email: docId,
        ...updatedFields
      };
      await window.BackendSimulationService.updateUser(payload, 'ADMIN');
    } catch (err) {
      console.error("Failed to update admin via backend", err);
      throw new Error(err.message || "Unable to save admin information.");
    }
  },

  // Convenience method for status-only updates
  async updateAdminStatus(email, status) {
    return this.updateAdmin(email, { status: status });
  }
};

window.adminService = adminService;
