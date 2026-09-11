/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - ATTENDANCE SERVICE
   With Global Role-Based Privacy Controls & Authorization Guards
   ========================================================================== */

const attendanceService = {
  _getDb() {
    if (window.FirebaseService && window.FirebaseService.db) {
      return window.FirebaseService.db;
    }
    throw new Error("Firestore database is not initialized.");
  },

  async getAttendance(actorUser = null) {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendance').limit(100).get();
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
      if (user && typeof AuthorizationService !== 'undefined' && AuthorizationService.isAcademicStaff(user)) {
        const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
        return records.filter(a => authorizedSubjectIds.includes(a.subjectId));
      }
      return records;
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      return [];
    }
  },

  async getStudentAttendance(studentId) {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendance').where('studentId', '==', studentId).get();
      const records = snapshot.docs.map(doc => doc.data());
      
      const total = records.length;
      const present = records.filter(a => a.status === 'PRESENT').length;
      return typeof AttendanceCalculator !== 'undefined' ? AttendanceCalculator.calculateAttendance(present, total) : { total, present, percentage: total ? Math.round((present/total)*100) : 0 };
    } catch (err) {
      console.error("Failed to fetch student attendance:", err);
      return { total: 0, present: 0, percentage: 0 };
    }
  },

  async getStudentSubjectAttendance(studentId, subjectId) {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendance')
        .where('studentId', '==', studentId)
        .where('subjectId', '==', subjectId)
        .get();
      const records = snapshot.docs.map(doc => doc.data());
      
      const total = records.length;
      const present = records.filter(a => a.status === 'PRESENT').length;
      return typeof AttendanceCalculator !== 'undefined' ? AttendanceCalculator.calculateAttendance(present, total) : { total, present, percentage: total ? Math.round((present/total)*100) : 0 };
    } catch (err) {
      console.error("Failed to fetch student subject attendance:", err);
      return { total: 0, present: 0, percentage: 0 };
    }
  },

  async checkDuplicateAttendance(classId, subjectId, date) {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendance')
        .where('classId', '==', classId)
        .where('subjectId', '==', subjectId)
        .where('date', '==', date)
        .limit(1)
        .get();
      return !snapshot.empty;
    } catch (err) {
      console.error("Failed to check duplicate attendance:", err);
      return false;
    }
  },

  async getSessionAttendance(classId, subjectId, date) {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendance')
        .where('classId', '==', classId)
        .where('subjectId', '==', subjectId)
        .where('date', '==', date)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Failed to fetch session attendance:", err);
      return [];
    }
  },

  async saveAttendance(classId, subjectId, date, facultyId, records, actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);

    if (user && typeof AuthorizationService !== 'undefined') {
      if (!AuthorizationService.canEditAttendance(user, subjectId, classId)) {
        throw new Error("Access Denied: You are not authorized to mark or update attendance for this subject/class.");
      }
      if (AuthorizationService.isAcademicStaff(user) && typeof AttendanceAssignmentService !== 'undefined') {
        const canMark = await AttendanceAssignmentService.canMarkAttendance(user.id, classId, subjectId, date);
        if (!canMark) {
          throw new Error("Access Denied: You do not have an active attendance assignment for this class, subject, and date.");
        }
      }
    }

    if (!classId || !subjectId || !date) {
      throw new Error("Class, Subject, and Date are required.");
    }
    if (!records || records.length === 0) {
      throw new Error("No student attendance records to save.");
    }

    for (let r of records) {
      if (r.status !== 'PRESENT' && r.status !== 'ABSENT') {
        throw new Error(`Invalid status '${r.status}' provided for student. Only PRESENT or ABSENT allowed.`);
      }
      if (!r.studentId) {
        throw new Error(`Missing student ID in attendance payload.`);
      }
    }

    const db = this._getDb();
    const batch = db.batch();
    const savedRecords = [];

    // Check existing records for updates
    const existingSnapshot = await db.collection('attendance')
      .where('classId', '==', classId)
      .where('subjectId', '==', subjectId)
      .where('date', '==', date)
      .get();
    
    const existingRecords = new Map();
    existingSnapshot.docs.forEach(doc => {
      existingRecords.set(doc.data().studentId, { id: doc.id, ...doc.data() });
    });

    for (const r of records) {
      const existing = existingRecords.get(r.studentId);
      let docRef;

      if (existing) {
        if (user && AuthorizationService.isAcademicStaff(user) && existing.facultyId && existing.facultyId !== user.id) {
          throw new Error("Access Denied: You cannot modify attendance records submitted by another faculty member.");
        }
        docRef = db.collection('attendance').doc(existing.id);
      } else {
        docRef = db.collection('attendance').doc();
      }

      const rec = {
        studentId: r.studentId,
        facultyId: facultyId || (user ? user.id : "FAC001"),
        subjectId: subjectId,
        classId: classId,
        date: date,
        status: r.status,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      batch.set(docRef, rec);
      savedRecords.push({ id: docRef.id, ...rec });
    }

    await batch.commit();
    return savedRecords;
  }
};

window.attendanceService = attendanceService;
