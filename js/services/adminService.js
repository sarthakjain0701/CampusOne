/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - ADMIN & USER MANAGEMENT SERVICE
   Firestore-backed CRUD for Admins and Unified User Management across all roles.
   Firestore is the source of truth with controlled memory caching & timeouts.
   ========================================================================== */

const adminService = {
  _unsubscribeList: [],
  _usersCache: null,
  _lastFetchTime: 0,
  CACHE_TTL_MS: 30000, // 30 seconds cache TTL

  // --------------------------------------------------------------------------
  // FIRESTORE HELPERS
  // --------------------------------------------------------------------------
  async _ensureDb() {
    if (!window.FirebaseService) throw new Error("Firebase Service is not loaded.");
    await window.FirebaseService.init();
    if (!window.FirebaseService.db) throw new Error("Firestore is not available. Please check your connection.");
    return window.FirebaseService.db;
  },

  _withTimeout(promise, timeoutMs = 8000, errorMessage = "Request timed out. Please check your connection.") {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
    ]);
  },

  // --------------------------------------------------------------------------
  // UNIFIED USER MANAGEMENT (Across all roles: Admin, Faculty, Lab Assistant, Librarian, Student)
  // --------------------------------------------------------------------------
  async getUsers(options = {}) {
    const { forceRefresh = false, limit = 50, lastDocs = null, roleFilter = 'ALL' } = options;
    const db = await this._ensureDb();
    
    try {
      let fetchAdmins = roleFilter === 'ALL' || roleFilter === 'ADMIN';
      let fetchFaculties = roleFilter === 'ALL' || ['FACULTY', 'LAB_ASSISTANT', 'LIBRARIAN'].includes(roleFilter);
      let fetchStudents = roleFilter === 'ALL' || roleFilter === 'STUDENT';

      // Using __name__ (document ID, which is email here) to ensure all docs are included and ordered
      let adminsQuery = db.collection('admins').orderBy('__name__').limit(limit);
      let facultiesQuery = db.collection('faculties').orderBy('__name__').limit(limit);
      let studentsQuery = db.collection('authorizedUsers').orderBy('__name__').limit(limit);

      if (lastDocs?.admins) adminsQuery = adminsQuery.startAfter(lastDocs.admins);
      if (lastDocs?.faculties) facultiesQuery = facultiesQuery.startAfter(lastDocs.faculties);
      if (lastDocs?.students) studentsQuery = studentsQuery.startAfter(lastDocs.students);

      const [adminsSnap, facultiesSnap, studentsSnap] = await this._withTimeout(
        Promise.all([
          fetchAdmins ? adminsQuery.get().catch(e => { console.warn("Admins fetch notice:", e); return { docs: [] }; }) : Promise.resolve({ docs: [] }),
          fetchFaculties ? facultiesQuery.get().catch(e => { console.warn("Faculties fetch notice:", e); return { docs: [] }; }) : Promise.resolve({ docs: [] }),
          fetchStudents ? studentsQuery.get().catch(e => { console.warn("Students fetch notice:", e); return { docs: [] }; }) : Promise.resolve({ docs: [] })
        ]),
        8000,
        "Failed to load users within timeout limit. Please retry."
      );

      const usersMap = new Map();

      // Process Admins
      if (adminsSnap && adminsSnap.docs) {
        adminsSnap.docs.forEach(doc => {
          const data = doc.data();
          const email = (doc.id || data.email || '').toLowerCase().trim();
          usersMap.set(email, {
            id: doc.id,
            email: email,
            name: data.name || email.split('@')[0],
            role: 'ADMIN',
            status: (data.status || 'ACTIVE').toUpperCase(),
            collection: 'admins',
            ...data
          });
        });
      }

      // Process Faculties, Lab Assistants, Librarians
      if (facultiesSnap && facultiesSnap.docs) {
        facultiesSnap.docs.forEach(doc => {
          const data = doc.data();
          const email = (doc.id || data.email || '').toLowerCase().trim();
          const role = (data.role || data.staffRole || 'FACULTY').toUpperCase();
          usersMap.set(email, {
            id: doc.id,
            email: email,
            name: data.name || email.split('@')[0],
            role: role,
            status: (data.status || 'ACTIVE').toUpperCase(),
            department: data.department || 'General',
            designation: data.designation || 'Staff',
            employeeId: data.employeeId || '',
            collection: 'faculties',
            ...data
          });
        });
      }

      // Process Students
      if (studentsSnap && studentsSnap.docs) {
        studentsSnap.docs.forEach(doc => {
          const data = doc.data();
          const email = (doc.id || data.email || '').toLowerCase().trim();
          usersMap.set(email, {
            id: doc.id,
            email: email,
            name: data.name || email.split('@')[0],
            role: 'STUDENT',
            status: (data.status || 'ACTIVE').toUpperCase(),
            department: data.department || '',
            rollNumber: data.rollNumber || data.rollNo || '',
            registrationNumber: data.registrationNumber || '',
            semester: data.semester || '',
            section: data.section || '',
            collection: 'authorizedUsers',
            ...data
          });
        });
      }

      const usersList = Array.from(usersMap.values());
      
      const nextDocs = {
        admins: adminsSnap.docs && adminsSnap.docs.length > 0 ? adminsSnap.docs[adminsSnap.docs.length - 1] : (lastDocs ? lastDocs.admins : null),
        faculties: facultiesSnap.docs && facultiesSnap.docs.length > 0 ? facultiesSnap.docs[facultiesSnap.docs.length - 1] : (lastDocs ? lastDocs.faculties : null),
        students: studentsSnap.docs && studentsSnap.docs.length > 0 ? studentsSnap.docs[studentsSnap.docs.length - 1] : (lastDocs ? lastDocs.students : null)
      };

      const hasMore = (adminsSnap.docs && adminsSnap.docs.length === limit) || 
                      (facultiesSnap.docs && facultiesSnap.docs.length === limit) || 
                      (studentsSnap.docs && studentsSnap.docs.length === limit);

      return {
        users: usersList,
        lastDocs: nextDocs,
        hasMore
      };
    } catch (err) {
      console.error("Failed to fetch system users:", err);
      throw new Error(err.message || "Unable to load system users. Please try again.");
    }
  },

  listenToUsers(callback) {
    // Deprecated.
  },

  async getUserById(docId) {
    const db = await this._ensureDb();
    const cleanId = docId.toLowerCase().trim();

    // Check cache first
    if (this._usersCache) {
      const cached = this._usersCache.find(u => u.id.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
      if (cached) return cached;
    }

    try {
      const [adminDoc, facultyDoc, studentDoc] = await Promise.allSettled([
        db.collection('admins').doc(cleanId).get(),
        db.collection('faculties').doc(cleanId).get(),
        db.collection('authorizedUsers').doc(cleanId).get()
      ]);

      if (adminDoc.status === 'fulfilled' && adminDoc.value.exists) {
        return { id: adminDoc.value.id, email: adminDoc.value.id, role: 'ADMIN', collection: 'admins', ...adminDoc.value.data() };
      }
      if (facultyDoc.status === 'fulfilled' && facultyDoc.value.exists) {
        const d = facultyDoc.value.data();
        return { id: facultyDoc.value.id, email: facultyDoc.value.id, role: (d.role || d.staffRole || 'FACULTY').toUpperCase(), collection: 'faculties', ...d };
      }
      if (studentDoc.status === 'fulfilled' && studentDoc.value.exists) {
        return { id: studentDoc.value.id, email: studentDoc.value.id, role: 'STUDENT', collection: 'authorizedUsers', ...studentDoc.value.data() };
      }

      return null;
    } catch (err) {
      console.error("Failed to fetch user by ID", err);
      throw new Error("Unable to load user details.");
    }
  },

  async addUser(userData) {
    const rules = {
      name: { required: true, label: "Full Name" },
      email: { required: true, email: true, label: "Official Email" },
      role: { required: true, label: "System Role" }
    };

    const valResult = Validation.validateForm(userData, rules);
    if (!valResult.isValid) {
      throw new Error(Object.values(valResult.errors)[0]);
    }

    const email = userData.email.trim().toLowerCase();
    if (!email.endsWith('@poornima.org')) {
      throw new Error("User accounts must use an @poornima.org email address.");
    }

    let role = (userData.role || 'STUDENT').toUpperCase();
    if (role === 'ADMINISTRATOR' || role === 'ADMIN') role = 'ADMIN';

    const payload = {
      name: userData.name.trim(),
      email: email,
      role: role,
      status: userData.status || 'ACTIVE'
    };

    if (role === 'FACULTY' || role === 'LAB_ASSISTANT' || role === 'LIBRARIAN') {
      payload.department = userData.department || "Computer Science & Engineering";
      payload.employeeId = userData.employeeId || `PGE-EMP-${Math.floor(100 + Math.random() * 900)}`;
      payload.designation = userData.designation || (role === 'LIBRARIAN' ? 'Head Librarian' : role === 'LAB_ASSISTANT' ? 'Lab Assistant' : 'Assistant Professor');
    }

    if (!window.CloudFunctionsService) {
      throw new Error("Backend Provisioning Service is not loaded.");
    }

    const provisionResult = await window.CloudFunctionsService.provisionUser(payload, role);
    payload.tempPassword = provisionResult.tempPassword;
    this.invalidateCache();
    return payload;
  },

  async updateUser(docId, updatedFields) {
    const db = await this._ensureDb();
    const cleanId = docId.toLowerCase().trim();
    const user = await this.getUserById(cleanId);
    
    if (!user) {
      throw new Error("User record not found in the database.");
    }

    const targetCollection = user.collection || 'admins';
    updatedFields.updatedAt = window.firebase.firestore.FieldValue.serverTimestamp();

    try {
      await db.collection(targetCollection).doc(cleanId).update(updatedFields);

      // If user has a matching users/{uid} document, update status/name there too
      if (user.uid) {
        db.collection('users').doc(user.uid).update(updatedFields).catch(e => console.warn("User profile sync notice:", e));
      }

      this.invalidateCache();
      return true;
    } catch (err) {
      console.error("Failed to update user in Firestore", err);
      if (err.code === 'permission-denied') throw new Error("You do not have permission to update this record.");
      throw new Error(err.message || "Unable to save user information. Please try again.");
    }
  },

  async updateUserStatus(docId, status) {
    return this.updateUser(docId, { status: status });
  },

  invalidateCache() {
    this._usersCache = null;
    this._lastFetchTime = 0;
  },

  // --------------------------------------------------------------------------
  // ADMIN SPECIFIC CRUD (Backward compatibility)
  // --------------------------------------------------------------------------
  async getAdmins() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection('admins').get();
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

  async getAdminById(docId) {
    return this.getUserById(docId);
  },

  listenToAdmins(callback) {
    // Deprecated.
  },

  stopListening() {
    if (this._unsubscribeList.length > 0) {
      this._unsubscribeList.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
      this._unsubscribeList = [];
    }
  },

  async addAdmin(adminData) {
    return this.addUser({ ...adminData, role: 'ADMIN' });
  },

  async updateAdmin(docId, updatedFields) {
    return this.updateUser(docId, updatedFields);
  },

  async updateAdminStatus(email, status) {
    return this.updateUserStatus(email, status);
  }
};

window.adminService = adminService;

