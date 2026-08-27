/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - DEPARTMENT SERVICE (MOCK)
   ========================================================================== */

const departmentService = {
  getDepartments() {
    return [...MOCK_DATA.departments];
  },

  getDepartmentById(id) {
    return MOCK_DATA.departments.find(d => d.id === id) || null;
  },

  addDepartment(deptData) {
    if (!Validation.isRequired(deptData.name) || !Validation.isRequired(deptData.code)) {
      throw new Error("Department Name and Code are required.");
    }

    const newDept = {
      id: "DEP" + String(MOCK_DATA.departments.length + 1).padStart(3, '0'),
      code: deptData.code.trim().toUpperCase(),
      name: deptData.name.trim(),
      hod: deptData.hod ? deptData.hod.trim() : "TBD",
      status: deptData.status || "ACTIVE"
    };

    MOCK_DATA.departments.unshift(newDept);
    return newDept;
  },

  updateDepartment(id, updatedFields) {
    const index = MOCK_DATA.departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Department not found.");
    MOCK_DATA.departments[index] = { ...MOCK_DATA.departments[index], ...updatedFields };
    return MOCK_DATA.departments[index];
  },

  deleteDepartment(id) {
    const index = MOCK_DATA.departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Department not found.");
    return MOCK_DATA.departments.splice(index, 1)[0];
  }
};

window.departmentService = departmentService;
