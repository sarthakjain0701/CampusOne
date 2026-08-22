/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - CLASS SERVICE (MOCK)
   ========================================================================== */

const classService = {
  getClasses() {
    return [...MOCK_DATA.classes];
  },

  getClassById(id) {
    return MOCK_DATA.classes.find(c => c.id === id) || null;
  },

  addClass(clsData) {
    if (!Validation.isRequired(clsData.name)) {
      throw new Error("Class Name is required.");
    }

    const newCls = {
      id: "CLS" + String(MOCK_DATA.classes.length + 1).padStart(3, '0'),
      name: clsData.name.trim().toUpperCase(),
      department: clsData.department || "Computer Science & Engineering",
      semester: Number(clsData.semester) || 2,
      section: clsData.section || "A",
      academicYear: clsData.academicYear || "2026-27",
      status: clsData.status || "ACTIVE"
    };

    MOCK_DATA.classes.unshift(newCls);
    return newCls;
  },

  updateClass(id, updatedFields) {
    const index = MOCK_DATA.classes.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Class not found.");
    MOCK_DATA.classes[index] = { ...MOCK_DATA.classes[index], ...updatedFields };
    return MOCK_DATA.classes[index];
  },

  deleteClass(id) {
    const index = MOCK_DATA.classes.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Class not found.");
    return MOCK_DATA.classes.splice(index, 1)[0];
  }
};

window.classService = classService;
