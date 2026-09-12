/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - HYBRID MID-TERM MARKS SERVICE
   With Global Role-Based Privacy Controls & Least-Privilege Authorization
   (Firestore Async Migrated)
   ========================================================================== */

const midTermMarksService = {
  // Search Result Cache
  _searchCache: new Map(),

  get db() {
    return window.FirebaseService && window.FirebaseService.db ? window.FirebaseService.db : (window.db || firebase.firestore());
  },

  /**
   * Option A: Registration / Roll Number Student Lookup (With Faculty Authorization Guard)
   */
  async findStudentByRegistration(regNo, actorUser = null) {
    if (!regNo || typeof regNo !== 'string') return null;
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const cleanReg = regNo.trim().toLowerCase();
    const cacheKey = `${cleanReg}_${user ? user.role : 'GUEST'}`;

    if (this._searchCache.has(cacheKey)) {
      return this._searchCache.get(cacheKey);
    }

    let students = [];
    if (typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore) {
      students = await studentService.getStudentsFromFirestore();
    } else {
      students = DataStore.get('STUDENTS') || [];
    }

    const match = students.find(s => {
      const sReg = (s.registrationNumber || s.regNo || '').trim().toLowerCase();
      const sRoll = (s.rollNumber || s.rollNo || '').trim().toLowerCase();
      const sId = (s.studentId || s.id || '').trim().toLowerCase();

      return sReg === cleanReg || sRoll === cleanReg || sId === cleanReg;
    });

    if (!match) return null;

    // AUTHORIZATION GUARD: Faculty can ONLY search students belonging to their assigned classes/sections!
    if (user && typeof AuthorizationService !== 'undefined') {
      if (!(await AuthorizationService.canAccessStudent(user, match.id))) {
        return { isUnauthorized: true, message: `Access Denied: Student '${cleanReg}' does not belong to your assigned subjects/classes.` };
      }
    }

    this._searchCache.set(cacheKey, match);
    return match;
  },

  /**
   * Option B: Class-Wise Student Filter Engine (With Faculty Class Authorization)
   */
  async filterStudentsByClass(options = {}, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const {
      enrollmentYear = 'ALL',
      department = 'ALL',
      semester = 'ALL',
      section = 'ALL',
      page = 1,
      pageSize = 20
    } = options;

    let students = [];
    if (typeof studentService !== 'undefined' && studentService.getStudentsFromFirestore) {
      students = await studentService.getStudentsFromFirestore();
    } else {
      students = DataStore.get('STUDENTS') || [];
    }

    // Filter by Faculty Assignment Scope
    if (user && typeof AuthorizationService !== 'undefined' && AuthorizationService.isAcademicStaff(user)) {
      const authorizedStudentIds = await AuthorizationService.getAuthorizedStudentIds(user);
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
      let departments = [];
      if (typeof departmentService !== 'undefined' && departmentService.getDepartmentsFromFirestore) {
        departments = await departmentService.getDepartmentsFromFirestore();
      } else {
        departments = DataStore.get('DEPARTMENTS') || [];
      }
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
  async getStudentMarks(studentId, actorUser = null) {
    if (!studentId) return [];
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    
    let marksData = [];
    try {
      const snapshot = await this.db.collection('midTermMarks')
        .where('studentId', '==', studentId)
        .where('status', '!=', 'DELETED')
        .get();
      snapshot.forEach(doc => {
        marksData.push({ id: doc.id, ...doc.data() });
      });
    } catch(err) {
      console.error("Error fetching student marks from Firestore:", err);
      marksData = DataStore.get('MID_TERM_MARKS') || [];
      marksData = marksData.filter(m => m.studentId === studentId && m.status !== 'DELETED');
    }

    let subjects = [];
    if (typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore) {
      subjects = await subjectService.getSubjectsFromFirestore();
    } else {
      subjects = DataStore.get('SUBJECTS') || [];
    }

    let studentMarks = marksData;

    // Faculty Privacy Guard: Filter marks to ONLY assigned subjects!
    if (user && typeof AuthorizationService !== 'undefined' && AuthorizationService.isAcademicStaff(user)) {
      const authorizedSubjectIds = await AuthorizationService.getAuthorizedSubjectIds(user);
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

  async getMarksForStudent(studentId, actorUser = null) {
    return this.getStudentMarks(studentId, actorUser);
  },

  /**
   * ADD MARK RECORD (With Authorization Check & Duplicate Protection)
   */
  async addMarkRecord(data, actorUser = {}) {
    const user = actorUser.role ? actorUser : (typeof authService !== 'undefined' ? authService.getCurrentUser() : actorUser);
    const { studentId, subjectId, examName, maxMarks, obtainedMarks, semester, academicSession } = data;

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!(await AuthorizationService.canEditMidterm(user, subjectId))) {
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

    const sessionStr = academicSession || '2026-27';
    const actorName = user.name || user.email || 'Faculty/Admin';
    const now = new Date().toISOString().split('T')[0];

    // Duplicate Check
    const snapshot = await this.db.collection('midTermMarks')
      .where('studentId', '==', studentId)
      .where('subjectId', '==', subjectId)
      .get();
      
    let existingRecord = null;
    let existingRef = null;
    snapshot.forEach(doc => {
      const d = doc.data();
      if ((d.examName || 'Mid-Term 1').toLowerCase() === examName.toLowerCase() &&
          (d.academicSession || '2026-27') === sessionStr &&
          d.status !== 'DELETED') {
        existingRecord = { id: doc.id, ...d };
        existingRef = doc.ref;
      }
    });

    if (existingRecord && existingRef) {
      const oldObt = existingRecord.obtainedMarks;
      const auditTrail = existingRecord.auditHistory || [];
      if (oldObt !== parsedObt) {
        auditTrail.push({
          oldMarks: oldObt,
          newMarks: parsedObt,
          changedBy: actorName,
          changedAt: new Date().toLocaleString()
        });
      }

      const updatedData = {
        maxMarks: parsedMax,
        obtainedMarks: parsedObt,
        facultyId: user.id || existingRecord.facultyId,
        updatedAt: now,
        auditHistory: auditTrail
      };
      
      await existingRef.update(updatedData);
      return { ...existingRecord, ...updatedData };
    } else {
      const newRecord = {
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

      const docRef = await this.db.collection('midTermMarks').add(newRecord);
      return { id: docRef.id, ...newRecord };
    }
  },

  /**
   * EDIT MARK RECORD (With Authorization Check & Correction Audit Logging)
   */
  async updateMarkRecord(markId, newObtainedMarks, actorUser = {}) {
    const user = actorUser.role ? actorUser : (typeof authService !== 'undefined' ? authService.getCurrentUser() : actorUser);
    
    const docRef = this.db.collection('midTermMarks').doc(markId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      throw new Error("Mid-Term mark record not found.");
    }

    const existing = docSnap.data();

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!(await AuthorizationService.canEditMidterm(user, existing.subjectId))) {
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

    const updatedData = {
      obtainedMarks: parsedObt,
      updatedAt: new Date().toISOString().split('T')[0],
      auditHistory: auditTrail
    };

    await docRef.update(updatedData);
    return { id: markId, ...existing, ...updatedData };
  },

  /**
   * REMOVE MARK RECORD (With Authorization Check)
   */
  async deleteMarkRecord(markId, actorUser = {}) {
    const user = actorUser.role ? actorUser : (typeof authService !== 'undefined' ? authService.getCurrentUser() : actorUser);
    
    const docRef = this.db.collection('midTermMarks').doc(markId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      throw new Error("Mid-Term mark record not found.");
    }
    
    const existing = docSnap.data();

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!(await AuthorizationService.canEditMidterm(user, existing.subjectId))) {
        throw new Error("Access Denied: You are not authorized to remove mid-term marks for this subject.");
      }
    }

    const actorName = user.name || user.email || 'Admin';

    const auditTrail = existing.auditHistory || [];
    auditTrail.push({
      oldMarks: existing.obtainedMarks,
      newMarks: 'REMOVED',
      changedBy: actorName,
      changedAt: new Date().toLocaleString()
    });

    await docRef.update({
      status: 'DELETED',
      updatedAt: new Date().toISOString().split('T')[0],
      auditHistory: auditTrail
    });
  },

  async getAuditHistory(markId) {
    const docSnap = await this.db.collection('midTermMarks').doc(markId).get();
    if (docSnap.exists) {
      return docSnap.data().auditHistory || [];
    }
    return [];
  },

  async isFacultyAuthorized(facultyUser, subjectId, classId) {
    if (!facultyUser || facultyUser.role === 'ADMIN') return true;
    if (typeof AuthorizationService !== 'undefined') {
      return await AuthorizationService.canAccessSubject(facultyUser, subjectId);
    }
    return false;
  },

  invalidateCache() {
    this._searchCache.clear();
  }
};

window.midTermMarksService = midTermMarksService;
