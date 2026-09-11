/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - DEPARTMENT SERVICE (MOCK)
   ========================================================================== */

const departmentService = {
  _collection() {
    return 'departments';
  },

  async _ensureDb() {
    if (!window.FirebaseService) throw new Error("Firebase Service is not loaded.");
    await window.FirebaseService.init();
    if (!window.FirebaseService.db) throw new Error("Firestore is not available.");
    return window.FirebaseService.db;
  },

  async getDepartmentsFromFirestore() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection()).get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.error("Failed to fetch departments from Firestore", err);
      throw new Error("Unable to load departments from database.");
    }
  },

  async getDepartmentById(id) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to fetch department", err);
      throw new Error("Unable to load department information.");
    }
  },

  getDepartments() {
    return [...MOCK_DATA.departments];
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
