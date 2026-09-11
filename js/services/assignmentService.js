/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - FACULTY ASSIGNMENT SERVICE (MOCK)
   ========================================================================== */

const assignmentService = {
  _getDb() {
    if (window.FirebaseService && window.FirebaseService.db) {
      return window.FirebaseService.db;
    }
    throw new Error("Firestore database is not initialized.");
  },

  async getAssignments() {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('assignments').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      throw new Error("Failed to load assignments from the database.");
    }
  },

  async addAssignment(facultyId, subjectId, classId, academicYear = "2026-27") {
    if (!facultyId || !subjectId || !classId) {
      throw new Error("Faculty, Subject, and Class must be selected.");
    }

    const db = this._getDb();

    // Check duplicate assignment
    const existingQuery = await db.collection('assignments')
      .where('facultyId', '==', facultyId)
      .where('subjectId', '==', subjectId)
      .where('classId', '==', classId)
      .where('academicYear', '==', academicYear)
      .get();

    if (!existingQuery.empty) {
      throw new Error("This faculty member is already assigned to teach this subject for the selected class.");
    }

    const newAssignmentRef = db.collection('assignments').doc();
    const newAssignment = {
      facultyId,
      subjectId,
      classId,
      academicYear,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await newAssignmentRef.set(newAssignment);
    return { id: newAssignmentRef.id, ...newAssignment };
  },

  async deleteAssignment(id) {
    if (!id) throw new Error("Assignment ID is required.");
    const db = this._getDb();
    const docRef = db.collection('assignments').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Assignment record not found.");

    await docRef.delete();
    return { id, ...doc.data() };
  }
};

window.assignmentService = assignmentService;
