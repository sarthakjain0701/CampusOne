/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - LEARNING RESOURCE SERVICE
   ========================================================================== */

const LearningResourceService = {
  getAllResources() {
    return DataStore.get('LEARNING_RESOURCES');
  },

  getResourceById(id) {
    return this.getAllResources().find(r => r.id === id) || null;
  },

  getSubjectsForStudent(studentId) {
    const subjects = DataStore.get('SUBJECTS');
    const student = DataStore.get('STUDENTS').find(s => s.id === studentId || s.userId === studentId);
    if (student) {
      return subjects.filter(sub => sub.semester === Number(student.semester) || sub.department === student.department || sub.departmentId === student.departmentId);
    }
    return subjects;
  },

  getResourcesBySubject(subjectId) {
    return this.getAllResources().filter(r => r.subjectId === subjectId && r.status === 'ACTIVE');
  },

  getResourcesByType(subjectId, type) {
    const list = subjectId ? this.getResourcesBySubject(subjectId) : this.getAllResources();
    if (!type || type === 'ALL') return list;
    return list.filter(r => r.resourceType === type);
  },

  getFacultyResources(facultyId) {
    return this.getAllResources().filter(r => r.facultyId === facultyId);
  },

  createResource(resourceData) {
    if (!Validation.isRequired(resourceData.title)) throw new Error("Title is required.");
    if (!Validation.isRequired(resourceData.subjectId)) throw new Error("Subject selection is required.");
    if (!Validation.isRequired(resourceData.resourceType)) throw new Error("Resource type is required.");

    const newResource = {
      id: "RES" + String(Date.now()).slice(-6),
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
      uploadedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    DataStore.addItem('LEARNING_RESOURCES', newResource);
    return newResource;
  },

  updateResource(id, updatedFields) {
    const existing = this.getResourceById(id);
    if (!existing) throw new Error("Learning resource not found.");

    if (updatedFields.status && updatedFields.status !== existing.status) {
      const user = typeof authService !== 'undefined' ? authService.getCurrentUser() : null;
      if (!user || user.role !== 'ADMIN') {
        throw new Error("Access Denied: Only Admin users can modify the Active/Inactive status of Digital Learning resources.");
      }
    }

    return DataStore.updateItem('LEARNING_RESOURCES', id, updatedFields);
  },

  deleteResource(id) {
    DataStore.deleteItem('LEARNING_RESOURCES', id);
  },

  searchResources({ query, subjectId, resourceType, semester }) {
    let list = this.getAllResources();

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
