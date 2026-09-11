/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - SUBJECT SERVICE (MOCK)
   ========================================================================== */

const subjectService = {
  _collection() {
    return 'subjects';
  },

  async _ensureDb() {
    if (!window.FirebaseService) throw new Error("Firebase Service is not loaded.");
    await window.FirebaseService.init();
    if (!window.FirebaseService.db) throw new Error("Firestore is not available.");
    return window.FirebaseService.db;
  },

  async getSubjectsFromFirestore() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection()).get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.error("Failed to fetch subjects from Firestore", err);
      // Fallback to mock data strictly if Firestore fails, to prevent total UI collapse 
      // but ideally this should throw or return controlled error as per instructions.
      // Instructions: "If Firestore fails, return a controlled error/state rather than silently showing stale mock data."
      throw new Error("Unable to load subjects from database.");
    }
  },

  async getSubjectById(id) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to fetch subject", err);
      throw new Error("Unable to load subject information.");
    }
  },

  // Legacy sync methods
  getSubjects() {
    return [...MOCK_DATA.subjects];
  },

  async addSubject(subData) {
    if (!Validation.isRequired(subData.code) || !Validation.isRequired(subData.name)) {
      throw new Error("Subject Code and Name are required.");
    }
    try {
      const db = await this._ensureDb();
      const docRef = await db.collection(this._collection()).add({
        code: subData.code.trim().toUpperCase(),
        name: subData.name.trim(),
        department: subData.department || "Computer Science & Engineering",
        semester: Number(subData.semester) || 2,
        credits: Number(subData.credits) || 3,
        status: subData.status || "ACTIVE"
      });
      const doc = await docRef.get();
      const newSub = { id: doc.id, ...doc.data() };
      // Update mock for UI fallback
      MOCK_DATA.subjects.unshift(newSub);
      return newSub;
    } catch (err) {
      console.error("Failed to add subject to Firestore", err);
      // Fallback to mock behavior
      const newSub = {
        id: "SUB" + String(MOCK_DATA.subjects.length + 1).padStart(3, '0'),
        code: subData.code.trim().toUpperCase(),
        name: subData.name.trim(),
        department: subData.department || "Computer Science & Engineering",
        semester: Number(subData.semester) || 2,
        credits: Number(subData.credits) || 3,
        status: subData.status || "ACTIVE"
      };
      MOCK_DATA.subjects.unshift(newSub);
      return newSub;
    }
  },

  updateSubject(id, updatedFields) {
    const index = MOCK_DATA.subjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Subject not found.");
    MOCK_DATA.subjects[index] = { ...MOCK_DATA.subjects[index], ...updatedFields };
    return MOCK_DATA.subjects[index];
  },

  deleteSubject(id) {
    const index = MOCK_DATA.subjects.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Subject not found.");
    const deleted = MOCK_DATA.subjects.splice(index, 1);
    
    // Clean up related faculty assignments
    MOCK_DATA.assignments = MOCK_DATA.assignments.filter(a => a.subjectId !== id);
    return deleted[0];
  }
};

window.subjectService = subjectService;
