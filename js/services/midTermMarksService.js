/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HYBRID MID-TERM MARKS SERVICE
   With Global Role-Based Privacy Controls & Least-Privilege Authorization
   ========================================================================== */

const midTermMarksService = {
  // Search Result Cache
  _searchCache: new Map(),

  /**
   * Option A: Registration / Roll Number Student Lookup (With Faculty Authorization Guard)
   */
  findStudentByRegistration(regNo, actorUser = null) {
    if (!regNo || typeof regNo !== 'string') return null;
    const cleanReg = regNo.trim().toUpperCase();
    if (!cleanReg) return null;

    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);

    // Check cache
    const cacheKey = `${cleanReg}_${user ? user.id : 'anon'}`;
    if (this._searchCache.has(cacheKey)) {
      return this._searchCache.get(cacheKey);
    }

    const students = DataStore.get('STUDENTS') || [];
    const match = students.find(s => {
      const sReg = (s.registrationNumber || '').trim().toUpperCase();
      const sRoll = (s.rollNumber || s.rollNo || '').trim().toUpperCase();
      const sId = (s.studentId || s.id || '').trim().toUpperCase();

      return sReg === cleanReg || sRoll === cleanReg || sId === cleanReg;
    });

    if (!match) return null;

    // AUTHORIZATION GUARD: Faculty can ONLY search students belonging to their assigned classes/sections!
    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canAccessStudent(user, match.id)) {
        return { isUnauthorized: true, message: `Access Denied: Student '${cleanReg}' does not belong to your assigned subjects/classes.` };
      }
    }

    this._searchCache.set(cacheKey, match);
    return match;
  },

  /**
   * Option B: Class-Wise Student Filter Engine (With Faculty Class Authorization)
   */
  filterStudentsByClass(options = {}, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const {
      enrollmentYear = 'ALL',
      department = 'ALL',
      semester = 'ALL',
      section = 'ALL',
      page = 1,
      pageSize = 20
    } = options;

    let students = DataStore.get('STUDENTS') || [];

    // Filter by Faculty Assignment Scope
    if (user && typeof AuthorizationService !== 'undefined' && user.role === 'FACULTY') {
      const authorizedStudentIds = AuthorizationService.getAuthorizedStudentIds(user);
      students = students.filter(s => authorizedStudentIds.includes(s.id));
    }

    // Filter by Enrollment Year / Batch
    if (enrollmentYear && enrollmentYear !== 'ALL') {
      students = students.filter(s => 
        (s.enrollmentYear && String(s.enrollmentYear) === String(enrollmentYear)) ||
        (s.batch && s.batch.includes(String(enrollmentYear)))
      );
    }

    // Filter by Department
    if (department && department !== 'ALL') {
      const departments = DataStore.get('DEPARTMENTS') || [];
      const deptObj = departments.find(d => d.id === department || d.code === department);

      students = students.filter(s => {
        if (s.departmentId === department) return true;
        if (deptObj && (s.department === deptObj.name || s.department === deptObj.code)) return true;
        if (s.department && s.department.toLowerCase().includes(department.toLowerCase())) return true;
        return false;
      });
    }

    // Filter by Semester
    if (semester && semester !== 'ALL') {
      students = students.filter(s => Number(s.semester) === Number(semester));
    }

    // Filter by Section
    if (section && section !== 'ALL') {
      students = students.filter(s => {
        if (s.section && s.section.toUpperCase() === section.toUpperCase()) return true;
        if (s.classId === section) return true;
        return false;
      });
    }

    // Paginate
    const totalRecords = students.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = students.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalRecords,
      totalPages,
      currentPage,
      pageSize,
      startIndex: totalRecords > 0 ? startIndex + 1 : 0,
      endIndex: Math.min(startIndex + pageSize, totalRecords)
    };
  },

  /**
   * Fetch Mid-Term Marks Specifically for ONE Student (Filtered by Faculty Subject Assignment)
   */
  getMarksForStudent(studentId, actorUser = null) {
    if (!studentId) return [];

    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const marksData = DataStore.get('MID_TERM_MARKS') || [];
    const subjects = DataStore.get('SUBJECTS') || [];

    let studentMarks = marksData.filter(m => m.studentId === studentId && m.status !== 'DELETED');

    // Faculty Privacy Guard: Filter marks to ONLY assigned subjects!
    if (user && typeof AuthorizationService !== 'undefined' && user.role === 'FACULTY') {
      const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
      studentMarks = studentMarks.filter(m => authorizedSubjectIds.includes(m.subjectId));
    }

    return studentMarks.map(m => {
      const sub = subjects.find(s => s.id === m.subjectId);
      return {
        ...m,
        subjectName: sub ? sub.name : m.subjectId,
        subjectCode: sub ? sub.code : 'CS',
        examName: m.examName || 'Mid-Term 1',
        academicSession: m.academicSession || '2026-27'
      };
    });
  },

  /**
   * ADD MARK RECORD (With Authorization Check & Duplicate Protection)
   */
  addMarkRecord(data, actorUser = {}) {
    const user = actorUser.role ? actorUser : (typeof authService !== 'undefined' ? authService.getCurrentUser() : actorUser);
    const { studentId, subjectId, examName, maxMarks, obtainedMarks, semester, academicSession } = data;

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditMidterm(user, subjectId)) {
        throw new Error("Access Denied: You are not authorized to add mid-term marks for this subject.");
      }
    }

    if (!studentId) throw new Error("Student ID is required.");
    if (!subjectId) throw new Error("Subject selection is required.");
    if (!examName) throw new Error("Exam selection is required.");

    const parsedMax = parseInt(maxMarks, 10);
    const parsedObt = parseInt(obtainedMarks, 10);

    if (isNaN(parsedMax) || parsedMax <= 0) {
      throw new Error("Maximum marks must be a positive number.");
    }
    if (isNaN(parsedObt) || parsedObt < 0) {
      throw new Error("Obtained marks cannot be negative.");
    }
    if (parsedObt > parsedMax) {
      throw new Error(`Obtained marks (${parsedObt}) cannot exceed maximum marks (${parsedMax}).`);
    }

    const marksData = DataStore.get('MID_TERM_MARKS') || [];
    const sessionStr = academicSession || '2026-27';

    // Duplicate Check
    const existingIndex = marksData.findIndex(m =>
      m.studentId === studentId &&
      m.subjectId === subjectId &&
      (m.examName || 'Mid-Term 1').toLowerCase() === examName.toLowerCase() &&
      (m.academicSession || '2026-27') === sessionStr &&
      m.status !== 'DELETED'
    );

    const now = new Date().toISOString().split('T')[0];
    const actorName = user.name || user.email || 'Faculty/Admin';

    if (existingIndex !== -1) {
      // Duplicate protection: update existing record
      const existing = marksData[existingIndex];
      const oldObt = existing.obtainedMarks;

      const auditTrail = existing.auditHistory || [];
      if (oldObt !== parsedObt) {
        auditTrail.push({
          oldMarks: oldObt,
          newMarks: parsedObt,
          changedBy: actorName,
          changedAt: new Date().toLocaleString()
        });
      }

      marksData[existingIndex] = {
        ...existing,
        maxMarks: parsedMax,
        obtainedMarks: parsedObt,
        facultyId: user.id || existing.facultyId,
        updatedAt: now,
        auditHistory: auditTrail
      };

      DataStore.set('MID_TERM_MARKS', marksData);
      return marksData[existingIndex];
    } else {
      const newRecord = {
        id: "MTM" + String(Date.now()).slice(-6) + Math.floor(Math.random() * 100),
        studentId,
        facultyId: user.id || "FAC001",
        subjectId,
        semester: parseInt(semester, 10) || 2,
        examName,
        maxMarks: parsedMax,
        obtainedMarks: parsedObt,
        academicSession: sessionStr,
        status: "PUBLISHED",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        auditHistory: []
      };

      marksData.push(newRecord);
      DataStore.set('MID_TERM_MARKS', marksData);
      return newRecord;
    }
  },

  /**
   * EDIT MARK RECORD (With Authorization Check & Correction Audit Logging)
   */
  updateMarkRecord(markId, newObtainedMarks, actorUser = {}) {
    const user = actorUser.role ? actorUser : (typeof authService !== 'undefined' ? authService.getCurrentUser() : actorUser);
    const marksData = DataStore.get('MID_TERM_MARKS') || [];
    const index = marksData.findIndex(m => m.id === markId && m.status !== 'DELETED');

    if (index === -1) {
      throw new Error("Mid-Term mark record not found.");
    }

    const existing = marksData[index];

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditMidterm(user, existing.subjectId)) {
        throw new Error("Access Denied: You are not authorized to edit mid-term marks for this subject.");
      }
    }

    const parsedObt = parseInt(newObtainedMarks, 10);

    if (isNaN(parsedObt) || parsedObt < 0) {
      throw new Error("Obtained marks cannot be negative.");
    }
    if (parsedObt > existing.maxMarks) {
      throw new Error(`Obtained marks (${parsedObt}) cannot exceed maximum marks (${existing.maxMarks}).`);
    }

    const actorName = user.name || user.email || 'Faculty/Admin';
    const auditTrail = existing.auditHistory || [];

    if (existing.obtainedMarks !== parsedObt) {
      auditTrail.push({
        oldMarks: existing.obtainedMarks,
        newMarks: parsedObt,
        changedBy: actorName,
        changedAt: new Date().toLocaleString()
      });
    }

    marksData[index] = {
      ...existing,
      obtainedMarks: parsedObt,
      updatedAt: new Date().toISOString().split('T')[0],
      auditHistory: auditTrail
    };

    DataStore.set('MID_TERM_MARKS', marksData);
    return marksData[index];
  },

  /**
   * REMOVE MARK RECORD (With Authorization Check)
   */
  deleteMarkRecord(markId, actorUser = {}) {
    const user = actorUser.role ? actorUser : (typeof authService !== 'undefined' ? authService.getCurrentUser() : actorUser);
    const marksData = DataStore.get('MID_TERM_MARKS') || [];
    const index = marksData.findIndex(m => m.id === markId);

    if (index === -1) {
      throw new Error("Mid-Term mark record not found.");
    }

    const existing = marksData[index];

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditMidterm(user, existing.subjectId)) {
        throw new Error("Access Denied: You are not authorized to remove mid-term marks for this subject.");
      }
    }

    const actorName = user.name || user.email || 'Admin';

    existing.status = 'DELETED';
    existing.updatedAt = new Date().toISOString().split('T')[0];
    existing.auditHistory = existing.auditHistory || [];
    existing.auditHistory.push({
      oldMarks: existing.obtainedMarks,
      newMarks: 'REMOVED',
      changedBy: actorName,
      changedAt: new Date().toLocaleString()
    });

    DataStore.set('MID_TERM_MARKS', marksData);
  },

  getAuditHistory(markId) {
    const marksData = DataStore.get('MID_TERM_MARKS') || [];
    const rec = marksData.find(m => m.id === markId);
    return rec ? (rec.auditHistory || []) : [];
  },

  isFacultyAuthorized(facultyUser, subjectId, classId) {
    if (!facultyUser || facultyUser.role === 'ADMIN') return true;
    if (typeof AuthorizationService !== 'undefined') {
      return AuthorizationService.canAccessSubject(facultyUser, subjectId);
    }
    return false;
  },

  invalidateCache() {
    this._searchCache.clear();
  }
};

window.midTermMarksService = midTermMarksService;
