/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - LEARNING RESOURCE SERVICE (FIRESTORE)
   ========================================================================== */

const LearningResourceService = {
  get db() {
    return window.FirebaseService ? window.FirebaseService.db : null;
  },

  async getAllResources() {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('learningResources').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      console.error(e);
      return [];
    }
  },

  async getResourceById(id) {
    if (!this.db) return null;
    try {
      const doc = await this.db.collection('learningResources').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async getSubjectsForStudent(studentId) {
    if (typeof subjectService === 'undefined') return [];
    
    let subjects = [];
    if (subjectService.getSubjectsFromFirestore) {
      subjects = await subjectService.getSubjectsFromFirestore();
    } else {
      subjects = subjectService.getSubjects();
    }
    
    let student = null;
    if (this.db) {
      try {
        const doc = await this.db.collection('students').doc(studentId).get();
        if (doc.exists) student = { id: doc.id, ...doc.data() };
      } catch(e) {}
    }

    if (student) {
      return subjects.filter(sub => sub.semester === Number(student.semester) || sub.department === student.department || sub.departmentId === student.departmentId);
    }
    return subjects;
  },

  async getResourcesBySubject(subjectId) {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('learningResources')
        .where('subjectId', '==', subjectId)
        .where('status', '==', 'ACTIVE')
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) {
      console.error(e);
      return [];
    }
  },

  async getResourcesByType(subjectId, type) {
    const list = subjectId ? await this.getResourcesBySubject(subjectId) : await this.getAllResources();
    if (!type || type === 'ALL') return list;
    return list.filter(r => r.resourceType === type);
  },

  async getFacultyResources(facultyId) {
    if (!this.db) return [];
    try {
      const snap = await this.db.collection('learningResources').where('facultyId', '==', facultyId).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async createResource(resourceData) {
    if (!Validation.isRequired(resourceData.title)) throw new Error("Title is required.");
    if (!Validation.isRequired(resourceData.subjectId)) throw new Error("Subject selection is required.");
    if (!Validation.isRequired(resourceData.resourceType)) throw new Error("Resource type is required.");

    if (!this.db) return null;

    const newResource = {
      title: resourceData.title.trim(),
      description: resourceData.description ? resourceData.description.trim() : "",
      subjectId: resourceData.subjectId,
      facultyId: resourceData.facultyId || "FAC001",
      resourceType: resourceData.resourceType,
      fileName: resourceData.fileName || `${resourceData.title.replace(/\s+/g, '_')}.pdf`,
      fileUrl: resourceData.fileUrl || "#",
      semester: Number(resourceData.semester) || 2,
      academicYear: resourceData.academicYear || "2026-27",
      status: resourceData.status || "ACTIVE",
      laboratoryName: resourceData.laboratoryName || "",
      department: resourceData.department || "",
      uploadedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    try {
      const docRef = await this.db.collection('learningResources').add(newResource);
      return { id: docRef.id, ...newResource };
    } catch(e) {
      console.error(e);
      return null;
    }
  },

  async updateResource(id, updatedFields) {
    const existing = await this.getResourceById(id);
    if (!existing) throw new Error("Learning resource not found.");

    if (updatedFields.status && updatedFields.status !== existing.status) {
      const user = typeof authService !== 'undefined' ? authService.getCurrentUser() : null;
      if (!user || user.role !== 'ADMIN') {
        throw new Error("Access Denied: Only Admin users can modify the Active/Inactive status of Digital Learning resources.");
      }
    }

    if (!this.db) return null;
    try {
      await this.db.collection('learningResources').doc(id).update(updatedFields);
      return { id, ...existing, ...updatedFields };
    } catch(e) {
      console.error(e);
      return null;
    }
  },

  async deleteResource(id) {
    if (!this.db) return false;
    try {
      await this.db.collection('learningResources').doc(id).delete();
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  },

  async searchResources({ query, subjectId, resourceType, semester }) {
    let list = await this.getAllResources();

    if (subjectId && subjectId !== 'ALL') {
      list = list.filter(r => r.subjectId === subjectId);
    }
    if (resourceType && resourceType !== 'ALL') {
      list = list.filter(r => r.resourceType === resourceType);
    }
    if (semester && semester !== 'ALL') {
      list = list.filter(r => Number(r.semester) === Number(semester));
    }
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) ||
        r.fileName.toLowerCase().includes(q)
      );
    }
    return list;
  }
};

window.LearningResourceService = LearningResourceService;
