/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - ATTENDANCE SERVICE
   With Global Role-Based Privacy Controls & Authorization Guards
   ========================================================================== */

const attendanceService = {
  getAttendance(actorUser = null) {
    const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);
    const records = DataStore.get('ATTENDANCE') || [...MOCK_DATA.attendance];

    if (user && typeof AuthorizationService !== 'undefined' && AuthorizationService.isAcademicStaff(user)) {
      const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
      return records.filter(a => authorizedSubjectIds.includes(a.subjectId));
    }

    return records;
  },

  getStudentAttendance(studentId) {
    const records = (DataStore.get('ATTENDANCE') || [...MOCK_DATA.attendance]).filter(a => a.studentId === studentId);
    const total = records.length;
    const present = records.filter(a => a.status === 'PRESENT').length;
    
    return AttendanceCalculator.calculateAttendance(present, total);
  },

  getStudentSubjectAttendance(studentId, subjectId) {
    const records = (DataStore.get('ATTENDANCE') || [...MOCK_DATA.attendance]).filter(a => a.studentId === studentId && a.subjectId === subjectId);
    const total = records.length;
    const present = records.filter(a => a.status === 'PRESENT').length;

    return AttendanceCalculator.calculateAttendance(present, total);
  },

  checkDuplicateAttendance(classId, subjectId, date) {
    const records = DataStore.get('ATTENDANCE') || MOCK_DATA.attendance;
    return records.some(a => 
      a.classId === classId && 
      a.subjectId === subjectId && 
      a.date === date
    );
  },

  getSessionAttendance(classId, subjectId, date) {
    const records = DataStore.get('ATTENDANCE') || MOCK_DATA.attendance;
    return records.filter(a => 
      a.classId === classId && 
      a.subjectId === subjectId && 
      a.date === date
    );
  },

  saveAttendance(classId, subjectId, date, facultyId, records, actorUser = null) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = actorUser || (typeof authService !== 'undefined' ? authService.getCurrentUser() : null);

          if (user && typeof AuthorizationService !== 'undefined') {
            if (!AuthorizationService.canEditAttendance(user, subjectId, classId)) {
              throw new Error("Access Denied: You are not authorized to mark or update attendance for this subject/class.");
            }
            if (AuthorizationService.isAcademicStaff(user) && typeof AttendanceAssignmentService !== 'undefined') {
              if (!AttendanceAssignmentService.canMarkAttendance(user.id, classId, subjectId, date)) {
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

          // Backend validation: Ensure no NOT_MARKED or invalid statuses are accepted
          for (let r of records) {
            if (r.status !== 'PRESENT' && r.status !== 'ABSENT') {
              throw new Error(`Invalid status '${r.status}' provided for student. Only PRESENT or ABSENT allowed.`);
            }
            if (!r.studentId) {
              throw new Error(`Missing student ID in attendance payload.`);
            }
          }

          const allAttendance = DataStore.get('ATTENDANCE') || [...MOCK_DATA.attendance];
          const savedRecords = [];

          records.forEach(r => {
            const docId = `${classId}_${subjectId}_${date}_${r.studentId}`;
            
            const existingIndex = allAttendance.findIndex(a => a.id === docId);
            const isUpdate = existingIndex !== -1;

            const rec = {
              id: docId,
              studentId: r.studentId,
              facultyId: facultyId || (user ? user.id : "FAC001"),
              subjectId: subjectId,
              classId: classId,
              date: date,
              status: r.status,
              createdAt: isUpdate ? allAttendance[existingIndex].createdAt : new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            if (isUpdate) {
              // Prevent modifying another faculty member's attendance records unless Admin
              if (user && AuthorizationService.isAcademicStaff(user) && allAttendance[existingIndex].facultyId && allAttendance[existingIndex].facultyId !== user.id) {
                throw new Error("Access Denied: You cannot modify attendance records submitted by another faculty member.");
              }
              allAttendance[existingIndex] = rec;
            } else {
              allAttendance.push(rec);
            }
            savedRecords.push(rec);
          });

          // Perform Database INSERT/UPDATE transaction equivalent
          DataStore.set('ATTENDANCE', allAttendance);
          if (window.MOCK_DATA) {
            window.MOCK_DATA.attendance = allAttendance;
          }

          resolve(savedRecords);
        } catch (err) {
          reject(err);
        }
      }, 500); // simulate network latency
    });
  }
};

window.attendanceService = attendanceService;
