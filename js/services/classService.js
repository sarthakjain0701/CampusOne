/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - CLASS SERVICE (MOCK)
   ========================================================================== */

const classService = {
  _collection() {
    return 'classes';
  },

  async _ensureDb() {
    if (!window.FirebaseService) throw new Error("Firebase Service is not loaded.");
    await window.FirebaseService.init();
    if (!window.FirebaseService.db) throw new Error("Firestore is not available.");
    return window.FirebaseService.db;
  },

  async getClassesFromFirestore() {
    const db = await this._ensureDb();
    try {
      const snapshot = await db.collection(this._collection()).get();
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (err) {
      console.error("Failed to fetch classes from Firestore", err);
      throw new Error("Unable to load classes from database.");
    }
  },

  async getClassById(id) {
    const db = await this._ensureDb();
    try {
      const doc = await db.collection(this._collection()).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      console.error("Failed to fetch class", err);
      throw new Error("Unable to load class information.");
    }
  },

  getClasses() {
    return [...MOCK_DATA.classes];
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
