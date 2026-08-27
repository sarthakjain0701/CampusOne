/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - EXAMINATION RESULT SERVICE
   With Global Role-Based Access Control & Faculty Subject Privacy
   ========================================================================== */

const ExamResultService = {
  // Inject the Data Access Layer (Repository)
  // This allows swapping between Local Database and Firebase without changing business logic
  repository: window.examResultRepository,

  getAllResults() {
    return this.repository.getAll();
  },

  getResultById(id) {
    return this.repository.getById(id);
  },

  getStudentResults(studentId, semester = null, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    
    // Abstracted data fetch via repository
    let list = this.repository.getByStudent(studentId, semester);

    if (user && typeof AuthorizationService !== 'undefined') {
      list = AuthorizationService.filterStudentResultForRole(user, list);
    }

    return list;
  },

  getPublishedResults(studentId, semester = null, actorUser = null) {
    const list = this.getStudentResults(studentId, semester, actorUser);
    return list.filter(r => r.status === 'PUBLISHED');
  },

  calculateStudentSummary(studentId, semester = null, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const results = this.getPublishedResults(studentId, semester, user);

    if (results.length === 0 || (user && AuthorizationService.isAcademicStaff(user))) {
      // Faculty is NOT allowed to view overall student CGPA or overall PASS/FAIL across all subjects!
      return { totalMarks: 0, maxMarks: 0, percentage: 0, sgpa: 0.0, status: 'N/A', isFacultyRestricted: AuthorizationService.isAcademicStaff(user) };
    }

    let totalEarned = 0;
    let totalMax = 0;
    let totalGradePointsCredits = 0;
    let totalCredits = 0;
    let hasFail = false;

    // Grade to Grade Point Mapping (Poornima/RTU Standard)
    const gradePointMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0 };

    results.forEach(r => {
      totalEarned += Number(r.marks || 0);
      totalMax += Number(r.maxMarks || 100);

      const credits = Number(r.credits || 4);
      const points = gradePointMap[r.grade] !== undefined ? gradePointMap[r.grade] : 7;
      totalGradePointsCredits += points * credits;
      totalCredits += credits;

      if (r.grade === 'F' || (r.marks / r.maxMarks) < 0.4) {
        hasFail = true;
      }
    });

    const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    const sgpa = totalCredits > 0 ? Number((totalGradePointsCredits / totalCredits).toFixed(2)) : 0;

    return {
      totalMarks: totalEarned,
      maxMarks: totalMax,
      percentage: percentage,
      sgpa: sgpa,
      status: hasFail ? 'FAIL' : 'PASS',
      isFacultyRestricted: false
    };
  },

  createResult(data, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    
    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditResult(user, data.subjectId, data.sectionId)) {
        throw new Error("Access Denied: You are not authorized to create result records for this subject.");
      }
    }

    if (!Validation.isRequired(data.studentId)) throw new Error("Student selection is required.");
    if (!Validation.isRequired(data.subjectId)) throw new Error("Subject selection is required.");
    if (!Validation.isRequired(data.semester)) throw new Error("Semester is required.");

    const marks = Number(data.marks);
    const maxMarks = Number(data.maxMarks || 100);

    if (isNaN(marks) || marks < 0) throw new Error("Marks cannot be negative.");
    if (marks > maxMarks) throw new Error(`Marks cannot exceed maximum marks (${maxMarks}).`);

    // Duplicate check
    const existing = this.getAllResults().find(r => 
      r.studentId === data.studentId && 
      r.subjectId === data.subjectId && 
      Number(r.semester) === Number(data.semester) &&
      r.academicYear === (data.academicYear || "2026-27")
    );

    if (existing) {
      throw new Error("Duplicate Result Entry: A result record already exists for this student, subject, and semester.");
    }

    const newResult = {
      id: "RES_" + String(Date.now()).slice(-6),
      studentId: data.studentId,
      semester: Number(data.semester),
      academicYear: data.academicYear || "2026-27",
      subjectId: data.subjectId,
      marks: marks,
      maxMarks: maxMarks,
      grade: data.grade || this.calculateGrade(marks, maxMarks),
      credits: Number(data.credits || 4),
      status: data.status || "UNPUBLISHED",
      publishedAt: data.status === "PUBLISHED" ? new Date().toISOString().split('T')[0] : null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    return this.repository.create(newResult);
  },

  calculateGrade(marks, maxMarks = 100) {
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return 'O';
    if (pct >= 85) return 'A+';
    if (pct >= 75) return 'A';
    if (pct >= 65) return 'B+';
    if (pct >= 55) return 'B';
    if (pct >= 45) return 'C';
    if (pct >= 40) return 'P';
    return 'F';
  },

  updateResult(id, data, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const existing = this.getResultById(id);
    if (!existing) throw new Error("Result record not found.");

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditResult(user, existing.subjectId, existing.sectionId)) {
        throw new Error("Access Denied: You are not authorized to update results for this subject.");
      }
    }

    if (data.marks !== undefined) {
      const marks = Number(data.marks);
      const maxMarks = Number(data.maxMarks || 100);
      if (isNaN(marks) || marks < 0) throw new Error("Marks cannot be negative.");
      if (marks > maxMarks) throw new Error(`Marks cannot exceed maximum marks (${maxMarks}).`);
      data.grade = data.grade || this.calculateGrade(marks, maxMarks);
    }
    return this.repository.update(id, data);
  },

  publishResult(id, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const existing = this.getResultById(id);
    if (!existing) throw new Error("Result record not found.");

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditResult(user, existing.subjectId, existing.sectionId)) {
        throw new Error("Access Denied: You are not authorized to publish results for this subject.");
      }
    }

    return this.repository.update(id, {
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString().split('T')[0]
    });
  },

  unpublishResult(id, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const existing = this.getResultById(id);
    if (!existing) throw new Error("Result record not found.");

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditResult(user, existing.subjectId, existing.sectionId)) {
        throw new Error("Access Denied: You are not authorized to unpublish results for this subject.");
      }
    }

    return this.repository.update(id, {
      status: 'UNPUBLISHED',
      publishedAt: null
    });
  },

  deleteResult(id, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const existing = this.getResultById(id);
    if (!existing) throw new Error("Result record not found.");

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditResult(user, existing.subjectId, existing.sectionId)) {
        throw new Error("Access Denied: You are not authorized to delete results for this subject.");
      }
    }

    this.repository.delete(id);
  },

  searchResults({ studentId, semester, subjectId, status }, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    let list = this.getAllResults();

    if (user && typeof AuthorizationService !== 'undefined') {
      list = AuthorizationService.filterStudentResultForRole(user, list);
    }

    if (studentId && studentId !== 'ALL') {
      list = list.filter(r => r.studentId === studentId);
    }
    if (semester && semester !== 'ALL') {
      list = list.filter(r => Number(r.semester) === Number(semester));
    }
    if (subjectId && subjectId !== 'ALL') {
      list = list.filter(r => r.subjectId === subjectId);
    }
    if (status && status !== 'ALL') {
      list = list.filter(r => r.status === status);
    }

    return list;
  }
};

window.ExamResultService = ExamResultService;
