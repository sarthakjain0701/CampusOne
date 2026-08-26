/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - STUDENT SERVICE
   Firestore-backed CRUD for Students (authorizedUsers collection).
   Firestore is the source of truth. No MOCK_DATA fallback for user data.
   ========================================================================== */

const studentService = {
  // Active real-time listener unsubscribe function
  _unsubscribe: null,

  // --------------------------------------------------------------------------
  // IDENTITY GENERATION
  // --------------------------------------------------------------------------
  generateOfficialEmail(firstName, enrollmentYear, department, registrationNumber) {
    if (!firstName || !enrollmentYear || !department || !registrationNumber) return "";
    
    const cleanFirstName = firstName.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    
    const deptMap = {
      "computer science & engineering": "cs",
      "cs": "cs",
      "information technology": "it",
      "it": "it",
      "artificial intelligence": "ai",
      "ai": "ai",
      "electronics": "ec",
      "ec": "ec",
      "mechanical": "me",
      "me": "me",
      "civil": "ce",
      "ce": "ce"
    };
    const cleanDept = deptMap[department.toLowerCase()] || department.toLowerCase().substring(0, 2).replace(/[^a-z]/g, '');

    const regNoMatch = registrationNumber.match(/\d+$/);
    const suffix = regNoMatch ? regNoMatch[0] : registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-3);

    return `${enrollmentYear}piet${cleanDept}${cleanFirstName}${suffix}@poornima.org`.toLowerCase();
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
    return 'authorizedUsers';
  },

  // --------------------------------------------------------------------------
  // READ — One-shot fetch
  // --------------------------------------------------------------------------
  async getStudentsFromFirestore() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection()).get();
      const students = [];
      snapshot.forEach(doc => {
        students.push({ id: doc.id, email: doc.id, ...doc.data() });
      });
      return students;
    } catch (err) {
      console.error("Failed to fetch students from Firestore", err);
      throw new Error("Unable to load student records. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // READ — Single document
  // --------------------------------------------------------------------------
  async getStudentById(docId) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(docId).get();
      if (!doc.exists) return null;
      return { id: doc.id, email: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to fetch student", err);
      throw new Error("Unable to load student information.");
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME LISTENER
  // --------------------------------------------------------------------------
  listenToStudents(callback) {
    // Clean up previous listener
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }

    // We need db synchronously for onSnapshot, so we init first
    const setup = async () => {
      const db = await this._ensureDb();
      this._unsubscribe = db.collection(this._collection()).onSnapshot(
        (snapshot) => {
          const students = [];
          snapshot.forEach(doc => {
            students.push({ id: doc.id, email: doc.id, ...doc.data() });
          });
          callback(null, students);
        },
        (err) => {
          console.error("Student listener error", err);
          callback(new Error("Unable to load student records. Real-time sync failed."), []);
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
  async addStudent(studentData) {
    const rules = {
      name: { required: true, label: "Student Name" },
      firstName: { required: true, label: "First Name" },
      rollNumber: { required: true, label: "Roll Number" },
      registrationNumber: { required: true, label: "Registration Number" },
      department: { required: true, label: "Department" },
      enrollmentYear: { required: true, label: "Enrollment Year" }
    };

    const valResult = Validation.validateForm(studentData, rules);
    if (!valResult.isValid) {
      throw new Error(Object.values(valResult.errors)[0]);
    }

    const officialEmail = this.generateOfficialEmail(
      studentData.firstName,
      studentData.enrollmentYear,
      studentData.department,
      studentData.registrationNumber
    );

    if (!officialEmail) {
      throw new Error("Could not generate an official email. Please verify inputs.");
    }

    const payload = {
      rollNumber: studentData.rollNumber.trim().toUpperCase(),
      rollNo: studentData.rollNumber.trim().toUpperCase(),
      registrationNumber: studentData.registrationNumber.trim(),
      name: studentData.name.trim(),
      firstName: studentData.firstName.trim(),
      email: officialEmail,
      phone: studentData.phone ? studentData.phone.trim() : "",
      department: studentData.department,
      enrollmentYear: studentData.enrollmentYear,
      semester: Number(studentData.semester) || 1,
      section: studentData.section || "A",
      batch: studentData.batch || "2026-2030",
      branch: studentData.department === 'Computer Science & Engineering' ? 'CS' : 'IT',
      status: studentData.status || "ACTIVE"
    };

    // Provision Firebase Auth + Firestore document using Secure Cloud Function
    try {
      const provisionUserFn = window.firebase.functions().httpsCallable('provisionUser');
      await provisionUserFn({ role: 'STUDENT', email: officialEmail, profileData: payload });
      
      return payload;
    } catch (err) {
      console.error("PROVISIONING DIAGNOSIS");
      console.error("Provisioning failed");
      console.error("Role: STUDENT");
      console.error("Stage: Backend Cloud Function");
      console.error("Cloud Function: provisionUser");
      console.error("Error code: ", err.code || 'UNKNOWN');
      console.error("Error message: ", err.message || 'UNKNOWN');
      
      let uiMessage = "Unable to create student account. Please try again.";
      if (err.code === 'already-exists') {
        uiMessage = "Student account already exists.";
      }
      
      throw new Error(uiMessage);
    }
  },

  // --------------------------------------------------------------------------
  // UPDATE — Writes directly to Firestore document
  // --------------------------------------------------------------------------
  async updateStudent(docId, updatedFields) {
    const db = await this._ensureDb();

    // Normalize roll number if being updated
    if (updatedFields.rollNumber) {
      updatedFields.rollNumber = updatedFields.rollNumber.trim().toUpperCase();
      updatedFields.rollNo = updatedFields.rollNumber;
    }

    // Add timestamp
    updatedFields.updatedAt = window.firebase.firestore.FieldValue.serverTimestamp();

    try {
      await db.collection(this._collection()).doc(docId).update(updatedFields);
    } catch (err) {
      console.error("Failed to update student in Firestore", err);
      if (err.code === 'not-found') throw new Error("Student record not found in the database.");
      if (err.code === 'permission-denied') throw new Error("You do not have permission to update this record.");
      throw new Error("Unable to save student information. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // DELETE — Removes document from Firestore
  // --------------------------------------------------------------------------
  async deleteStudent(docId) {
    const db = await this._ensureDb();
    try {
      await db.collection(this._collection()).doc(docId).delete();
    } catch (err) {
      console.error("Failed to delete student from Firestore", err);
      if (err.code === 'permission-denied') throw new Error("You do not have permission to delete this record.");
      throw new Error("Unable to delete student record. Please try again.");
    }
  },

  // --------------------------------------------------------------------------
  // SEARCH (client-side filter on fetched data — used by search box)
  // --------------------------------------------------------------------------
  searchStudentsInList(students, query) {
    if (!query || !query.trim()) return students;
    const q = query.trim().toLowerCase();
    return students.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || s.rollNo || '').toLowerCase().includes(q) ||
      (s.registrationNumber || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  },

  // --------------------------------------------------------------------------
  // Legacy stubs — kept for backward compatibility with bulk import
  // --------------------------------------------------------------------------
  getStudents() {
    return window.MOCK_DATA ? [...MOCK_DATA.students] : [];
  },

  bulkImportStudents(validRecords) {
    if (!validRecords || validRecords.length === 0) return 0;
    let importedCount = 0;
    for (const record of validRecords) {
      const newStudent = {
        id: "STU" + String(MOCK_DATA.students.length + 1).padStart(3, '0'),
        rollNumber: String(record['Roll No']).trim().toUpperCase(),
        rollNo: String(record['Roll No']).trim().toUpperCase(),
        registrationNumber: String(record['Registration No']).trim(),
        name: String(record['Name']).trim(),
        firstName: String(record['First Name']).trim(),
        email: record['Generated Email'] || String(record['Email']).trim(),
        phone: record['Phone'] ? String(record['Phone']).trim() : "",
        department: String(record['Department']).trim(),
        enrollmentYear: String(record['Enrollment Year']).trim(),
        semester: Number(record['Semester']) || 1,
        section: record['Section'] ? String(record['Section']).trim() : "A",
        batch: record['Batch'] ? String(record['Batch']).trim() : "",
        status: record['Status'] ? String(record['Status']).trim().toUpperCase() : "ACTIVE"
      };
      MOCK_DATA.students.unshift(newStudent);
      importedCount++;
    }
    return importedCount;
  }
};

window.studentService = studentService;
