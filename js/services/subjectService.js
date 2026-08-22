/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - SUBJECT SERVICE (MOCK)
   ========================================================================== */

const subjectService = {
  getSubjects() {
    return [...MOCK_DATA.subjects];
  },

  getSubjectById(id) {
    return MOCK_DATA.subjects.find(s => s.id === id) || null;
  },

  addSubject(subData) {
    if (!Validation.isRequired(subData.code) || !Validation.isRequired(subData.name)) {
      throw new Error("Subject Code and Name are required.");
    }

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
