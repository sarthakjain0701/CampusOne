/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - CENTRALIZED AUTHORIZATION SERVICE
   Global Role-Based Access Control (RBAC) & Academic Privacy Engine
   Least-Privilege Model: Deny by Default

   Supported Roles: STUDENT, FACULTY, LAB_ASSISTANT, LIBRARIAN, ADMIN
   ========================================================================== */

const AuthorizationService = {
  // ==========================================================================
  // CENTRALIZED ROLE CHECK HELPERS
  // ==========================================================================
  isStudent(user) { return user?.role === 'STUDENT'; },
  isFaculty(user) { return user?.role === 'FACULTY'; },
  isLabAssistant(user) { return user?.role === 'LAB_ASSISTANT'; },
  isLibrarian(user) { return user?.role === 'LIBRARIAN'; },
  isAdmin(user) { return user?.role === 'ADMIN'; },

  /**
   * Conceptual grouping: Faculty + Lab Assistant share the Staff Portal.
   * Their actual role values remain distinct for auditing and future permissions.
   */
  isAcademicStaff(user) {
    return user?.role === 'FACULTY' || user?.role === 'LAB_ASSISTANT';
  },

  /**
   * Returns user-friendly display name for a role string.
   */
  getRoleDisplayName(role) {
    const map = {
      'STUDENT': 'Student',
      'FACULTY': 'Faculty',
      'LAB_ASSISTANT': 'Lab Assistant',
      'LIBRARIAN': 'Librarian',
      'ADMIN': 'Admin'
    };
    return map[role] || role;
  },

  /**
   * Get Faculty Assignments
   */
  async getFacultyAssignments(user) {
    if (!user) return [];
    let assignments = [];
    if (typeof assignmentService !== 'undefined') {
      assignments = await assignmentService.getAssignments();
    } else {
      assignments = typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.assignments : [];
    }

    if (user.role === 'ADMIN') {
      return assignments;
    }

    if (this.isAcademicStaff(user)) {
      return assignments.filter(a => a.facultyId === user.id || a.facultyId === user.uid || a.facultyId === user.employeeId);
    }

    return [];
  },

  /**
   * Get Authorized Subject IDs for User
   */
  async getAuthorizedSubjectIds(user) {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];
      return subjects.map(s => s.id);
    }

    if (this.isAcademicStaff(user)) {
      const assignments = await this.getFacultyAssignments(user);
      return [...new Set(assignments.map(a => a.subjectId))];
    }

    return [];
  },

  /**
   * Get Authorized Class / Section IDs for User
   */
  async getAuthorizedClassIds(user) {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      const classes = typeof classService !== 'undefined' ? classService.getClasses() : [];
      return classes.map(c => c.id);
    }

    if (this.isAcademicStaff(user)) {
      const assignments = await this.getFacultyAssignments(user);
      return [...new Set(assignments.map(a => a.classId))];
    }

    return [];
  },

  /**
   * Get Authorized Student IDs for User
   */
  async getAuthorizedStudentIds(user) {
    if (!user) return [];
    const students = typeof studentService !== 'undefined' ? studentService.getStudents() : [];

    if (user.role === 'STUDENT') {
      const student = students.find(s => s.id === user.id || s.email === user.email || s.userId === user.uid);
      return student ? [student.id] : [user.id];
    }

    if (this.isAcademicStaff(user)) {
      const authorizedClassIds = await this.getAuthorizedClassIds(user);
      const authorizedStudents = students.filter(s => authorizedClassIds.includes(s.classId) || authorizedClassIds.includes(s.section));
      return authorizedStudents.map(s => s.id);
    }

    if (user.role === 'ADMIN') {
      return students.map(s => s.id);
    }

    return [];
  },

  /**
   * Validate Access to a Student Record
   */
  async canAccessStudent(user, studentId) {
    if (!user || !studentId) return false;
    if (user.role === 'ADMIN') return true;

    const authorizedStudentIds = await this.getAuthorizedStudentIds(user);
    return authorizedStudentIds.includes(studentId);
  },

  /**
   * Validate Access to a Subject
   */
  async canAccessSubject(user, subjectId) {
    if (!user || !subjectId) return false;
    if (user.role === 'ADMIN') return true;

    if (this.isAcademicStaff(user)) {
      const authorizedSubjectIds = await this.getAuthorizedSubjectIds(user);
      return authorizedSubjectIds.includes(subjectId);
    }

    return false;
  },

  /**
   * Validate Access to a Class / Section
   */
  async canAccessClass(user, classId) {
    if (!user || !classId) return false;
    if (user.role === 'ADMIN') return true;

    if (this.isAcademicStaff(user)) {
      const authorizedClassIds = await this.getAuthorizedClassIds(user);
      return authorizedClassIds.includes(classId);
    }

    return false;
  },

  /**
   * Can View Exam Result
   */
  async canViewResult(user, studentId, subjectId) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (user.role === 'STUDENT') {
      return await this.canAccessStudent(user, studentId);
    }

    if (this.isAcademicStaff(user)) {
      const canStudent = await this.canAccessStudent(user, studentId);
      const canSubject = await this.canAccessSubject(user, subjectId);
      return canStudent && canSubject;
    }

    return false;
  },

  /**
   * Can Edit Exam Result
   */
  async canEditResult(user, subjectId, classId) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (this.isAcademicStaff(user)) {
      const canSubject = await this.canAccessSubject(user, subjectId);
      const canClass = classId ? await this.canAccessClass(user, classId) : true;
      return canSubject && canClass;
    }

    return false;
  },

  /**
   * Can View Attendance
   */
  async canViewAttendance(user, studentId, subjectId, classId) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (user.role === 'STUDENT') {
      return await this.canAccessStudent(user, studentId);
    }

    if (this.isAcademicStaff(user)) {
      if (subjectId) return await this.canAccessSubject(user, subjectId);
      if (classId) return await this.canAccessClass(user, classId);
      if (studentId) return await this.canAccessStudent(user, studentId);
      return true;
    }

    return false;
  },

  /**
   * Can Mark or Correct Attendance
   */
  async canEditAttendance(user, subjectId, classId) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (this.isAcademicStaff(user)) {
      const canSubject = await this.canAccessSubject(user, subjectId);
      const canClass = classId ? await this.canAccessClass(user, classId) : true;
      return canSubject && canClass;
    }

    return false;
  },

  /**
   * Can View Mid-Term Marks
   */
  async canViewMidterm(user, studentId, subjectId) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (user.role === 'STUDENT') {
      return await this.canAccessStudent(user, studentId);
    }

    if (this.isAcademicStaff(user)) {
      if (subjectId) return await this.canAccessSubject(user, subjectId);
      if (studentId) return await this.canAccessStudent(user, studentId);
      return true;
    }

    return false;
  },

  /**
   * Can Edit Mid-Term Marks
   */
  async canEditMidterm(user, subjectId, classId) {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    if (this.isAcademicStaff(user)) {
      const canSubject = await this.canAccessSubject(user, subjectId);
      const canClass = classId ? await this.canAccessClass(user, classId) : true;
      return canSubject && canClass;
    }

    return false;
  },

  /**
   * PRIVACY CORE: Filter Student Exam Results for Role
   * Faculty must NOT see: complete student result, other subjects' marks, overall CGPA, or overall result.
   */
  async filterStudentResultForRole(user, studentResultList) {
    if (!user || !Array.isArray(studentResultList)) return [];
    if (user.role === 'ADMIN' || user.role === 'STUDENT') {
      return studentResultList;
    }

    if (this.isAcademicStaff(user)) {
      const authorizedSubjectIds = await this.getAuthorizedSubjectIds(user);
      // Filter list to include ONLY assigned subject results
      return studentResultList.filter(res => authorizedSubjectIds.includes(res.subjectId));
    }

    return [];
  },

  /**
   * Validate Access to Library Portal & Management
   * Student: ALLOW (Access own library portal)
   * Admin: ALLOW (Access library management)
   * Librarian: ALLOW (Access library management)
   * Faculty/Lab Assistant: DENY (No library portal access)
   */
  canAccessLibrary(user) {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'STUDENT' || user.role === 'LIBRARIAN') return true;
    return false;
  },

  /**
   * Render Standard Access Denied Alert UI
   */
  renderAccessDeniedBanner(message = "You are not authorized to access this academic record.") {
    return `
      <div class="card" style="padding:3.5rem 2rem; text-align:center; background:#FFFFFF; border:1px solid #FECACA; box-shadow:0 4px 6px -1px rgba(239,68,68,0.1); margin:1.5rem 0;">
        <div style="width:60px; height:60px; border-radius:50%; background:#FEE2E2; color:#DC2626; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem auto;">
          <i data-lucide="shield-alert" style="width:32px; height:32px;"></i>
        </div>
        <h2 style="font-size:1.4rem; font-weight:800; color:#991B1B; margin:0 0 0.5rem 0;">Access Denied</h2>
        <p style="color:#475569; font-size:0.95rem; max-width:480px; margin:0 auto 1.5rem auto;">
          ${message}
        </p>
        <button class="btn-secondary" onclick="window.history.back(); App.renderCurrentView();" style="font-weight:700;">
          <i data-lucide="arrow-left" style="width:16px; height:16px; display:inline;"></i> Go Back
        </button>
      </div>
    `;
  }
};

window.AuthorizationService = AuthorizationService;
