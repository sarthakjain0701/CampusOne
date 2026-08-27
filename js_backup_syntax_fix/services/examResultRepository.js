/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAM RESULT REPOSITORY
   Data Access Layer abstraction. 
   Currently points to the local database, but architected to seamlessly 
   allow Firebase integration later by just switching the implementation.
   ========================================================================== */

/**
 * Interface definition for Exam Result Data Access.
 * Any underlying storage (Local JSON, Firebase, SQL) must implement these methods.
 */
class ExamResultRepository {
  getAll() { throw new Error("Not implemented"); }
  getById(id) { throw new Error("Not implemented"); }
  getByStudent(studentId, semester = null) { throw new Error("Not implemented"); }
  create(data) { throw new Error("Not implemented"); }
  update(id, data) { throw new Error("Not implemented"); }
  delete(id) { throw new Error("Not implemented"); }
}

/**
 * Implementation for the existing local DataStore.
 */
class LocalExamResultRepository extends ExamResultRepository {
  getAll() {
    return DataStore.get('EXAM_RESULTS') || [];
  }

  getById(id) {
    const results = this.getAll();
    return results.find(r => r.id === id) || null;
  }

  getByStudent(studentId, semester = null) {
    // Note: maintaining the original mock STU001 fallback for the prototype
    let list = this.getAll().filter(r => r.studentId === studentId || r.studentId === "STU001");
    if (semester && semester !== 'ALL') {
      list = list.filter(r => Number(r.semester) === Number(semester));
    }
    return list;
  }

  create(data) {
    const id = data.id || "RES_" + String(Date.now()).slice(-6);
    const newRecord = { ...data, id };
    DataStore.addItem('EXAM_RESULTS', newRecord);
    return newRecord;
  }

  update(id, data) {
    return DataStore.updateItem('EXAM_RESULTS', id, data);
  }

  delete(id) {
    DataStore.deleteItem('EXAM_RESULTS', id);
    return true;
  }
}

// Export the singleton instance
// When migrating to Firebase later, this export can be changed to:
// window.examResultRepository = new FirebaseExamResultRepository();
window.examResultRepository = new LocalExamResultRepository();
