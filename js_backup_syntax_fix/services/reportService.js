/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAMS) - REPORT SERVICE
   Lazy-load, filter-first architecture.
   Authorization enforced at service layer via AuthorizationService.
   No method loads the full student/attendance dataset without filters.
   ========================================================================== */

const ReportService = {

  /* -----------------------------------------------------------------------
     FILTER OPTIONS — scalar metadata only, no student/attendance records
  ----------------------------------------------------------------------- */

  getAcademicYears(user) {
    if (!user) return [];
    const students = DataStore.get('STUDENTS') || MOCK_DATA.students || [];
    let scoped = students;
    if (AuthorizationService.isAcademicStaff(user)) {
      const authorizedClassIds = AuthorizationService.getAuthorizedClassIds(user);
      scoped = students.filter(s => authorizedClassIds.includes(s.classId));
    }
    const years = [...new Set(scoped.map(s => s.academicYear || s.academicSession).filter(Boolean))];
    return years.sort().reverse();
  },

  getDepartments(user) {
    if (!user) return [];
    const allDepts = DataStore.get('DEPARTMENTS') || MOCK_DATA.departments || [];
    if (user.role === 'ADMIN') return allDepts;
    if (AuthorizationService.isAcademicStaff(user)) {
      const assignments = AuthorizationService.getFacultyAssignments(user);
      const subjects = DataStore.get('SUBJECTS') || MOCK_DATA.subjects || [];
      const assignedSubjectIds = [...new Set(assignments.map(a => a.subjectId))];
      const deptNames = [...new Set(
        assignedSubjectIds
          .map(sid => subjects.find(s => s.id === sid))
          .filter(Boolean)
          .map(s => s.department)
      )];
      return allDepts.filter(d => deptNames.includes(d.name));
    }
    return [];
  },

  getSemesters(user, department) {
    if (!user || !department) return [];
    const classes = DataStore.get('CLASSES') || MOCK_DATA.classes || [];
    let scoped = classes.filter(c => c.department === department);
    if (AuthorizationService.isAcademicStaff(user)) {
      const authorizedClassIds = AuthorizationService.getAuthorizedClassIds(user);
      scoped = scoped.filter(c => authorizedClassIds.includes(c.id));
    }
    const semesters = [...new Set(scoped.map(c => c.semester).filter(Boolean))];
    return semesters.sort((a, b) => a - b);
  },

  getSections(user, department, semester) {
    if (!user || !department || !semester) return [];
    const classes = DataStore.get('CLASSES') || MOCK_DATA.classes || [];
    let scoped = classes.filter(c =>
      c.department === department && Number(c.semester) === Number(semester)
    );
    if (AuthorizationService.isAcademicStaff(user)) {
      const authorizedClassIds = AuthorizationService.getAuthorizedClassIds(user);
      scoped = scoped.filter(c => authorizedClassIds.includes(c.id));
    }
    return scoped.map(c => ({ id: c.id, section: c.section, name: c.name }));
  },

  getSubjectsForClass(user, classId) {
    if (!user || !classId) return [];
    const assignments = DataStore.get('ASSIGNMENTS') || MOCK_DATA.assignments || [];
    const subjects = DataStore.get('SUBJECTS') || MOCK_DATA.subjects || [];
    let relevantAssignments = assignments.filter(a => a.classId === classId && a.status !== 'INACTIVE');
    if (AuthorizationService.isAcademicStaff(user)) {
      const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
      relevantAssignments = relevantAssignments.filter(a => authorizedSubjectIds.includes(a.subjectId));
    }
    const subjectIds = [...new Set(relevantAssignments.map(a => a.subjectId))];
    return subjectIds.map(sid => subjects.find(s => s.id === sid)).filter(Boolean);
  },

  /* -----------------------------------------------------------------------
     REGISTRATION NUMBER SEARCH — loads exactly one student
  ----------------------------------------------------------------------- */

  searchStudentByRegNo(regNo, user) {
    if (!user || !regNo) return { error: 'Invalid search.' };
    const students = DataStore.get('STUDENTS') || MOCK_DATA.students || [];
    const student = students.find(s =>
      (s.registrationNumber || '').toLowerCase() === regNo.trim().toLowerCase() ||
      (s.rollNumber || '').toLowerCase() === regNo.trim().toLowerCase()
    );
    if (!student) return { error: `No student found with registration number "${regNo.trim()}".` };
    if (AuthorizationService.isAcademicStaff(user) && !AuthorizationService.canAccessStudent(user, student.id)) {
      return { error: 'Access Denied: This student is not in your assigned class/subject.' };
    }
    return { student };
  },

  generateStudentReport(studentId, user) {
    if (!user) return { error: 'Not authenticated.' };
    if (user.role === 'STUDENT') return { error: 'Access Denied: Students are not authorized to access Reports & Analytics.' };
    if (!AuthorizationService.canAccessStudent(user, studentId)) return { error: 'Access Denied.' };

    const students = DataStore.get('STUDENTS') || MOCK_DATA.students || [];
    const student = students.find(s => s.id === studentId);
    if (!student) return { error: 'Student not found.' };

    const subjects = DataStore.get('SUBJECTS') || MOCK_DATA.subjects || [];
    const allAttendance = DataStore.get('ATTENDANCE') || MOCK_DATA.attendance || [];
    const assignments = DataStore.get('ASSIGNMENTS') || MOCK_DATA.assignments || [];

    let relevantAssignments = assignments.filter(a => a.classId === student.classId);
    if (AuthorizationService.isAcademicStaff(user)) {
      const authorizedSubjectIds = AuthorizationService.getAuthorizedSubjectIds(user);
      relevantAssignments = relevantAssignments.filter(a => authorizedSubjectIds.includes(a.subjectId));
    }

    const subjectIds = [...new Set(relevantAssignments.map(a => a.subjectId))];
    const rows = subjectIds.map(sid => {
      const subject = subjects.find(s => s.id === sid);
      const records = allAttendance.filter(a => a.studentId === studentId && a.subjectId === sid);
      const total = records.length;
      const present = records.filter(a => a.status === 'PRESENT').length;
      const absent = total - present;
      const calc = AttendanceCalculator.calculateAttendance(present, total);
      return {
        subjectCode: subject?.code || sid,
        subjectName: subject?.name || sid,
        total, present, absent,
        percentage: calc.percentage,
        status: calc.status
      };
    });

    const totalPresent = rows.reduce((s, r) => s + r.present, 0);
    const totalClasses = rows.reduce((s, r) => s + r.total, 0);
    const overallCalc = AttendanceCalculator.calculateAttendance(totalPresent, totalClasses);
    return { student, rows, overall: overallCalc };
  },

  /* -----------------------------------------------------------------------
     FILTERED SECTION / SUBJECT ATTENDANCE REPORT
  ----------------------------------------------------------------------- */

  generateAttendanceReport(filters, user) {
    if (!user) return { error: 'Not authenticated.' };
    if (user.role === 'STUDENT') return { error: 'Access Denied: Students are not authorized to access Reports & Analytics.' };
    const { academicYear, classId, subjectId, dateFrom, dateTo } = filters;
    if (!classId) return { error: 'Please select at least a Section to generate a report.' };

    if (AuthorizationService.isAcademicStaff(user)) {
      if (classId && !AuthorizationService.canAccessClass(user, classId))
        return { error: 'Access Denied: You are not authorized to view this section.' };
      if (subjectId && !AuthorizationService.canAccessSubject(user, subjectId))
        return { error: 'Access Denied: You are not authorized to view this subject.' };
    }

    const students = DataStore.get('STUDENTS') || MOCK_DATA.students || [];
    const subjects = DataStore.get('SUBJECTS') || MOCK_DATA.subjects || [];
    const allAttendance = DataStore.get('ATTENDANCE') || MOCK_DATA.attendance || [];

    let classStudents = students.filter(s => s.classId === classId && s.status !== 'INACTIVE');
    if (academicYear) classStudents = classStudents.filter(s =>
      s.academicYear === academicYear || s.academicSession === academicYear
    );
    if (classStudents.length === 0) return { error: 'No students found for the selected filters.' };

    let attendanceRecords = allAttendance.filter(a => a.classId === classId);
    if (subjectId) attendanceRecords = attendanceRecords.filter(a => a.subjectId === subjectId);
    if (dateFrom) attendanceRecords = attendanceRecords.filter(a => a.date >= dateFrom);
    if (dateTo) attendanceRecords = attendanceRecords.filter(a => a.date <= dateTo);

    const rows = classStudents.map(student => {
      const stuRecords = attendanceRecords.filter(a => a.studentId === student.id);
      const total = stuRecords.length;
      const present = stuRecords.filter(a => a.status === 'PRESENT').length;
      const absent = total - present;
      const calc = AttendanceCalculator.calculateAttendance(present, total);
      return {
        studentId: student.id,
        name: student.name,
        regNo: student.registrationNumber || student.rollNumber,
        department: student.department,
        section: student.section,
        semester: student.semester,
        total, present, absent,
        percentage: calc.percentage,
        status: calc.status
      };
    });

    const totalStudents = rows.length;
    const totalClasses = subjectId
      ? [...new Set(attendanceRecords.map(a => a.date))].length
      : [...new Set(attendanceRecords.map(a => `${a.subjectId}_${a.date}`))].length;
    const totalPresent = rows.reduce((s, r) => s + r.present, 0);
    const totalAbsent = rows.reduce((s, r) => s + r.absent, 0);
    const avgPercentage = rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.percentage, 0) / rows.length)
      : 0;
    const lowCount = rows.filter(r => r.percentage < 75).length;

    const distribution = {
      excellent: rows.filter(r => r.percentage >= 90).length,
      good: rows.filter(r => r.percentage >= 75 && r.percentage < 90).length,
      warning: rows.filter(r => r.percentage >= 60 && r.percentage < 75).length,
      critical: rows.filter(r => r.percentage < 60).length
    };

    const chartRows = [...rows].sort((a, b) => b.percentage - a.percentage).slice(0, 12);
    const subjectObj = subjectId ? subjects.find(s => s.id === subjectId) : null;

    return {
      rows,
      summary: { totalStudents, totalClasses, totalPresent, totalAbsent, avgPercentage, lowCount },
      distribution,
      chart: {
        labels: chartRows.map(r => r.name.split(' ')[0]),
        data: chartRows.map(r => r.percentage)
      },
      meta: {
        subjectName: subjectObj ? `${subjectObj.code} — ${subjectObj.name}` : 'All Subjects',
        classId, dateFrom, dateTo
      }
    };
  },

  generateLowAttendanceReport(filters, threshold, user) {
    const result = this.generateAttendanceReport(filters, user);
    if (result.error) return result;
    const pct = Number(threshold) || 75;
    const lowRows = result.rows.filter(r => r.percentage < pct);
    if (lowRows.length === 0)
      return { error: `No students found below ${pct}% attendance for the selected filters.` };
    return {
      ...result,
      rows: lowRows,
      summary: { ...result.summary, totalStudents: lowRows.length },
      isLowAttendance: true,
      threshold: pct
    };
  },

  /* -----------------------------------------------------------------------
     CSV EXPORT
  ----------------------------------------------------------------------- */

  exportReportCSV(reportData, meta) {
    if (!reportData || !reportData.rows) return;
    const { rows, summary } = reportData;
    let csv = `PAMS Attendance Report\n`;
    if (meta) {
      if (meta.subjectName) csv += `Subject: ${meta.subjectName}\n`;
      if (meta.dateFrom || meta.dateTo) csv += `Period: ${meta.dateFrom || 'Start'} to ${meta.dateTo || 'Today'}\n`;
    }
    csv += `Generated: ${new Date().toLocaleString('en-IN')}\n\n`;
    csv += `Registration No.,Student Name,Department,Section,Semester,Present,Absent,Total Classes,Attendance %,Status\n`;
    rows.forEach(r => {
      csv += `"${r.regNo || ''}","${r.name || ''}","${r.department || ''}","${r.section || ''}",${r.semester || ''},${r.present},${r.absent},${r.total},${r.percentage}%,${r.status}\n`;
    });
    if (summary) {
      csv += `\nSummary,,,,,,,,\n`;
      csv += `Total Students,${summary.totalStudents}\n`;
      csv += `Average Attendance,${summary.avgPercentage}%\n`;
      csv += `Low Attendance (<75%),${summary.lowCount}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAMS_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UIService.showToast('Report exported as CSV.', 'success');
  }
};

window.ReportService = ReportService;
