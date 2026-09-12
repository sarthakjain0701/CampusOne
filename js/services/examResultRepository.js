/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAM RESULT REPOSITORY (FIRESTORE)
   Data Access Layer abstraction.
   ========================================================================== */

class ExamResultRepository {
  async getAll() { throw new Error("Not implemented"); }
  async getById(id) { throw new Error("Not implemented"); }
  async getByStudent(studentId, semester = null) { throw new Error("Not implemented"); }
  async create(data) { throw new Error("Not implemented"); }
  async update(id, data) { throw new Error("Not implemented"); }
  async delete(id) { throw new Error("Not implemented"); }
}

class FirebaseExamResultRepository extends ExamResultRepository {
  get db() {
    return window.FirebaseService ? window.FirebaseService.db : null;
  }

  async getAll() {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('examResults').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      console.error(e);
      return [];
    }
  }

  async getById(id) {
    if (!this.db) return null;
    try {
      const doc = await this.db.collection('examResults').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getByStudent(studentId, semester = null) {
    if (!this.db) return [];
    try {
      let query = this.db.collection('examResults').where('studentId', 'in', [studentId, 'STU001']);
      if (semester && semester !== 'ALL') {
        query = query.where('semester', '==', Number(semester));
      }
      const snap = await query.get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async create(data) {
    if (!this.db) return null;
    try {
      const docRef = await this.db.collection('examResults').add(data);
      return { id: docRef.id, ...data };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async update(id, data) {
    if (!this.db) return null;
    try {
      await this.db.collection('examResults').doc(id).update(data);
      return { id, ...data };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async delete(id) {
    if (!this.db) return false;
    try {
      await this.db.collection('examResults').doc(id).delete();
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }
}

// Export the singleton instance
window.examResultRepository = new FirebaseExamResultRepository();
