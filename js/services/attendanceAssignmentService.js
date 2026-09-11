/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - FACULTY ATTENDANCE ASSIGNMENT SERVICE
   ========================================================================== */

const AttendanceAssignmentService = {
  _getDb() {
    if (window.FirebaseService && window.FirebaseService.db) {
      return window.FirebaseService.db;
    }
    throw new Error("Firestore database is not initialized.");
  },

  async getAssignments() {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendanceAssignments').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Failed to fetch attendance assignments:", err);
      return [];
    }
  },

  async getFacultyAssignments(facultyId) {
    try {
      const db = this._getDb();
      const snapshot = await db.collection('attendanceAssignments')
        .where('facultyId', '==', facultyId)
        .where('status', '==', 'ACTIVE')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Failed to fetch faculty assignments:", err);
      return [];
    }
  },

  async createAssignment(data) {
    const { academicYear, departmentId, semester, classId, subjectId, facultyId, timetableId } = data;
    
    if (!timetableId || !facultyId || !classId || !subjectId || !departmentId || !semester || !academicYear) {
      throw new Error("Missing required fields for attendance assignment.");
    }

    const targetClass = typeof classService !== 'undefined' ? classService.getClassById(classId) : null;
    if (!targetClass) {
      throw new Error("The selected Section / Class does not exist.");
    }
    
    if (targetClass.departmentId !== departmentId && targetClass.department !== departmentId) {
      throw new Error("Validation Error: Section / Class does not belong to the selected Department.");
    }
    
    if (String(targetClass.semester) !== String(semester)) {
      throw new Error("Validation Error: Section / Class does not belong to the selected Semester.");
    }

    const targetSubject = typeof subjectService !== 'undefined' ? subjectService.getSubjectById(subjectId) : null;
    if (!targetSubject) {
      throw new Error("The selected Subject does not exist.");
    }

    if (String(targetSubject.semester) !== String(semester)) {
      throw new Error("Validation Error: Subject does not belong to the selected Semester.");
    }

    const assignments = await this.getAssignments();
    
    const duplicate = assignments.find(a => 
      a.timetableId === timetableId && 
      a.facultyId === facultyId && 
      a.status === 'ACTIVE'
    );
    if (duplicate) {
      throw new Error("This attendance assignment already exists.");
    }

    const sectionConflict = assignments.find(a => 
      a.timetableId === timetableId && 
      a.status === 'ACTIVE'
    );
    if (sectionConflict && sectionConflict.facultyId !== facultyId) {
       throw new Error("Another faculty is already assigned to take attendance for this specific timetable session.");
    }

    const timetable = typeof TimetableService !== 'undefined' ? await TimetableService.getTimetableById(timetableId) : null;
    if (timetable) {
      const allTimetables = typeof TimetableService !== 'undefined' ? await TimetableService.getAllTimetables() : [];
      const facultyOtherAssignments = assignments.filter(a => a.facultyId === facultyId && a.status === 'ACTIVE');
      
      for (const assign of facultyOtherAssignments) {
        const otherTT = allTimetables.find(t => t.id === assign.timetableId);
        if (otherTT && otherTT.day === timetable.day) {
          if (timetable.startTime < otherTT.endTime && timetable.endTime > otherTT.startTime) {
            throw new Error(`Faculty conflict detected. This faculty is already assigned to another class during this time slot (${otherTT.startTime} - ${otherTT.endTime}).`);
          }
        }
      }
    }

    const db = this._getDb();
    const docRef = db.collection('attendanceAssignments').doc();
    const newAssignment = {
      academicYear,
      departmentId,
      semester,
      classId,
      subjectId,
      facultyId,
      timetableId,
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    await docRef.set(newAssignment);
    return { id: docRef.id, ...newAssignment };
  },

  async updateAssignmentStatus(id, status) {
    if (!id) throw new Error("Assignment ID is required.");
    const db = this._getDb();
    const docRef = db.collection('attendanceAssignments').doc(id);
    
    await docRef.update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },
  
  async canMarkAttendance(facultyId, classId, subjectId, date) {
    const assignments = await this.getFacultyAssignments(facultyId);
    const relevantAssignments = assignments.filter(a => a.classId === classId && a.subjectId === subjectId);
    if (relevantAssignments.length === 0) return false;
    
    if (typeof AcademicCalendarService !== 'undefined' && typeof TimetableService !== 'undefined') {
      const dayName = AcademicCalendarService.getDayName(date);
      for (const assign of relevantAssignments) {
        const tt = await TimetableService.getTimetableById(assign.timetableId);
        if (tt && tt.day === dayName) {
           return true;
        }
      }
    } else {
      return true;
    }
    
    return false;
  }
};

window.AttendanceAssignmentService = AttendanceAssignmentService;
