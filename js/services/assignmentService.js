/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - FACULTY ASSIGNMENT SERVICE (MOCK)
   ========================================================================== */

const assignmentService = {
  getAssignments() {
    return DataStore.get('ASSIGNMENTS') || [...MOCK_DATA.assignments];
  },

  addAssignment(facultyId, subjectId, classId, academicYear = "2026-27") {
    if (!facultyId || !subjectId || !classId) {
      throw new Error("Faculty, Subject, and Class must be selected.");
    }

    // Check duplicate assignment
    const existing = MOCK_DATA.assignments.find(a => 
      a.facultyId === facultyId && 
      a.subjectId === subjectId && 
      a.classId === classId &&
      a.academicYear === academicYear
    );

    if (existing) {
      throw new Error("This faculty member is already assigned to teach this subject for the selected class.");
    }

    const newAssignment = {
      id: "ASG" + String(MOCK_DATA.assignments.length + 1).padStart(3, '0'),
      facultyId,
      subjectId,
      classId,
      academicYear,
      status: "ACTIVE"
    };

    MOCK_DATA.assignments.unshift(newAssignment);
    return newAssignment;
  },

  deleteAssignment(id) {
    const index = MOCK_DATA.assignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Assignment record not found.");
    return MOCK_DATA.assignments.splice(index, 1)[0];
  }
};

window.assignmentService = assignmentService;
