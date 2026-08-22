/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - FACULTY ATTENDANCE ASSIGNMENT SERVICE
   ========================================================================== */

const AttendanceAssignmentService = {
  getAssignments() {
    return DataStore.get('ATTENDANCE_ASSIGNMENTS') || [];
  },

  getFacultyAssignments(facultyId) {
    return this.getAssignments().filter(a => a.facultyId === facultyId && a.status === 'ACTIVE');
  },

  createAssignment(data) {
    // data: academicYear, departmentId, semester, classId, subjectId, facultyId, timetableId
    const { academicYear, departmentId, semester, classId, subjectId, facultyId, timetableId } = data;
    
    if (!timetableId || !facultyId || !classId || !subjectId || !departmentId || !semester || !academicYear) {
      throw new Error("Missing required fields for attendance assignment.");
    }

    // Validate Academic Structure Hierarchy
    const targetClass = typeof classService !== 'undefined' ? classService.getClassById(classId) : null;
    if (!targetClass) {
      throw new Error("The selected Section / Class does not exist.");
    }
    
    // Check if class belongs to department
    if (targetClass.departmentId !== departmentId && targetClass.department !== departmentId) {
      throw new Error("Validation Error: Section / Class does not belong to the selected Department.");
    }
    
    // Check if class belongs to semester
    if (String(targetClass.semester) !== String(semester)) {
      throw new Error("Validation Error: Section / Class does not belong to the selected Semester.");
    }

    const targetSubject = typeof subjectService !== 'undefined' ? subjectService.getSubjectById(subjectId) : null;
    if (!targetSubject) {
      throw new Error("The selected Subject does not exist.");
    }

    // Check if subject belongs to semester
    if (String(targetSubject.semester) !== String(semester)) {
      throw new Error("Validation Error: Subject does not belong to the selected Semester.");
    }

    const assignments = this.getAssignments();
    
    // Check for exact duplicate
    const duplicate = assignments.find(a => 
      a.timetableId === timetableId && 
      a.facultyId === facultyId && 
      a.status === 'ACTIVE'
    );
    if (duplicate) {
      throw new Error("This attendance assignment already exists.");
    }

    // Check for Section conflict: Only one active assignment per timetable slot per section allowed
    const sectionConflict = assignments.find(a => 
      a.timetableId === timetableId && 
      a.status === 'ACTIVE'
    );
    if (sectionConflict && sectionConflict.facultyId !== facultyId) {
       throw new Error("Another faculty is already assigned to take attendance for this specific timetable session.");
    }

    // Check for Faculty conflict: Is this faculty already assigned to another timetable slot at the exact same day/time?
    const timetable = typeof TimetableService !== 'undefined' ? TimetableService.getTimetableById(timetableId) : null;
    if (timetable) {
      const allTimetables = typeof TimetableService !== 'undefined' ? TimetableService.getAllTimetables() : [];
      const facultyOtherAssignments = assignments.filter(a => a.facultyId === facultyId && a.status === 'ACTIVE');
      
      for (const assign of facultyOtherAssignments) {
        const otherTT = allTimetables.find(t => t.id === assign.timetableId);
        if (otherTT && otherTT.day === timetable.day) {
          // Check overlap
          if (timetable.startTime < otherTT.endTime && timetable.endTime > otherTT.startTime) {
            throw new Error(`Faculty conflict detected. This faculty is already assigned to another class during this time slot (${otherTT.startTime} - ${otherTT.endTime}).`);
          }
        }
      }
    }

    const newAssignment = {
      id: "ATASG_" + String(Date.now()).slice(-6),
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

    const updatedAssignments = [...assignments, newAssignment];
    DataStore.set('ATTENDANCE_ASSIGNMENTS', updatedAssignments);
    return newAssignment;
  },

  updateAssignmentStatus(id, status) {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Assignment not found.");
    
    assignments[index].status = status;
    assignments[index].updatedAt = new Date().toISOString();
    DataStore.set('ATTENDANCE_ASSIGNMENTS', assignments);
    return assignments[index];
  },
  
  canMarkAttendance(facultyId, classId, subjectId, date) {
    // A faculty can mark attendance if they have an active assignment for this class/subject
    // AND the date corresponds to the day in the timetable.
    const assignments = this.getFacultyAssignments(facultyId);
    
    const relevantAssignments = assignments.filter(a => a.classId === classId && a.subjectId === subjectId);
    if (relevantAssignments.length === 0) return false;
    
    // Check if any of these assignments correspond to a timetable slot on the given date
    if (typeof AcademicCalendarService !== 'undefined' && typeof TimetableService !== 'undefined') {
      const dayName = AcademicCalendarService.getDayName(date);
      for (const assign of relevantAssignments) {
        const tt = TimetableService.getTimetableById(assign.timetableId);
        if (tt && tt.day === dayName) {
           return true;
        }
      }
    } else {
      return true; // Fallback if services not available
    }
    
    return false;
  }
};

window.AttendanceAssignmentService = AttendanceAssignmentService;
