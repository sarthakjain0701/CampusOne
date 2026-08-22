/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - FACULTY SERVICE
   Firestore-backed CRUD for Faculty (faculties collection).
   Firestore is the source of truth.
   ========================================================================== */

const facultyService = {
  _unsubscribe: null,

  generateOfficialEmail(firstName, lastName) {
    if (!firstName || !lastName) return "";
    const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanFirst || !cleanLast) return "";
    return `${cleanFirst}.${cleanLast}@poornima.org`;
  },

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
    return 'faculties';
  },

  // --------------------------------------------------------------------------
  // READ — One-shot
  // --------------------------------------------------------------------------
  async getFacultyFromFirestore() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection()).get();
      const facultyList = [];
      snapshot.forEach(doc => {
        facultyList.push({ id: doc.id, email: doc.id, ...doc.data() });
      });
      return facultyList;
    } catch (err) {
      console.error("Failed to fetch faculty from Firestore", err);
      throw new Error("Unable to load faculty records. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // READ — Single document
  // --------------------------------------------------------------------------
  async getFacultyById(docId) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(docId).get();
      if (!doc.exists) return null;
      return { id: doc.id, email: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to fetch faculty member", err);
      throw new Error("Unable to load faculty information.");
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME LISTENER
  // --------------------------------------------------------------------------
  listenToFaculty(callback) {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }

    const setup = async () => {
      const db = await this._ensureDb();
      this._unsubscribe = db.collection(this._collection()).onSnapshot(
        (snapshot) => {
          const facultyList = [];
          snapshot.forEach(doc => {
            facultyList.push({ id: doc.id, email: doc.id, ...doc.data() });
          });
          callback(null, facultyList);
        },
        (err) => {
          console.error("Faculty listener error", err);
          callback(new Error("Unable to load faculty records. Real-time sync failed."), []);
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
  async addFaculty(facultyData) {
    const rules = {
      name: { required: true, label: "Faculty Name" },
      employeeId: { required: true, label: "Employee ID" },
      email: { required: true, email: true, label: "Email Address" },
      department: { required: true, label: "Department" }
    };

    const valResult = Validation.validateForm(facultyData, rules);
    if (!valResult.isValid) {
      throw new Error(Object.values(valResult.errors)[0]);
    }

    const officialEmail = facultyData.email.trim().toLowerCase();

    const payload = {
      employeeId: facultyData.employeeId.trim().toUpperCase(),
      name: facultyData.name.trim(),
      email: officialEmail,
      phone: facultyData.phone ? facultyData.phone.trim() : "",
      department: facultyData.department,
      designation: facultyData.designation || "Assistant Professor",
      qualification: facultyData.qualification || "Ph.D.",
      specialization: facultyData.specialization || "General",
      status: facultyData.status || "ACTIVE"
    };

    await window.BackendSimulationService.provisionUser(payload, 'FACULTY');
    return payload;
  },

  // --------------------------------------------------------------------------
  // UPDATE — Writes directly to Firestore
  // --------------------------------------------------------------------------
  async updateFaculty(docId, updatedFields) {
    const db = await this._ensureDb();

    updatedFields.updatedAt = window.firebase.firestore.FieldValue.serverTimestamp();

    try {
      await db.collection(this._collection()).doc(docId).update(updatedFields);
    } catch (err) {
      console.error("Failed to update faculty in Firestore", err);
      if (err.code === 'not-found') throw new Error("Faculty record not found in the database.");
      if (err.code === 'permission-denied') throw new Error("You do not have permission to update this record.");
      throw new Error("Unable to save faculty information. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // DELETE — Removes document from Firestore
  // --------------------------------------------------------------------------
  async deleteFaculty(docId) {
    const db = await this._ensureDb();
    try {
      await db.collection(this._collection()).doc(docId).delete();
    } catch (err) {
      console.error("Failed to delete faculty from Firestore", err);
      if (err.code === 'permission-denied') throw new Error("You do not have permission to delete this record.");
      throw new Error("Unable to delete faculty record. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // Legacy stubs — kept for backward compatibility with bulk import
  // --------------------------------------------------------------------------
  getFaculty() {
    return window.MOCK_DATA ? [...MOCK_DATA.faculty] : [];
  },

  checkEmailCollision(email) {
    if (!window.MOCK_DATA) return false;
    return MOCK_DATA.faculty.some(f => f.email === email);
  },

  checkEmployeeIdCollision(employeeId) {
    if (!window.MOCK_DATA) return false;
    return MOCK_DATA.faculty.some(f => f.employeeId === employeeId);
  },

  bulkImportFaculty(validRecords) {
    if (!validRecords || validRecords.length === 0) return 0;
    let importedCount = 0;
    for (const record of validRecords) {
      const newFaculty = {
        id: "FAC" + String(MOCK_DATA.faculty.length + 1).padStart(3, '0'),
        employeeId: String(record['Employee ID']).trim().toUpperCase(),
        name: String(record['Name']).trim(),
        email: record['Generated Email'] || String(record['Email']).trim(),
        phone: record['Phone'] ? String(record['Phone']).trim() : "",
        department: String(record['Department']).trim(),
        designation: record['Designation'] ? String(record['Designation']).trim() : "Assistant Professor",
        qualification: record['Qualification'] ? String(record['Qualification']).trim() : "Ph.D.",
        specialization: record['Specialization'] ? String(record['Specialization']).trim() : "General",
        status: record['Status'] ? String(record['Status']).trim().toUpperCase() : "ACTIVE"
      };
      MOCK_DATA.faculty.unshift(newFaculty);
      importedCount++;
    }
    return importedCount;
  },

  searchFaculty(query) {
    if (!query || !query.trim()) return this.getFaculty();
    const q = query.trim().toLowerCase();
    return MOCK_DATA.faculty.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.employeeId.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q)
    );
  }
};

window.facultyService = facultyService;
