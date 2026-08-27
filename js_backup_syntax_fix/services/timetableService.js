/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - TIMETABLE & SCHEDULED SLOTS SERVICE
   ========================================================================== */

const TimetableService = {
  getAllTimetables() {
    const list = DataStore.get('TIMETABLES') || [];
    const dayToDateMap = {
      'Sunday': '2026-08-16',
      'Monday': '2026-08-17',
      'Tuesday': '2026-08-18',
      'Wednesday': '2026-08-19',
      'Thursday': '2026-08-20',
      'Friday': '2026-08-21',
      'Saturday': '2026-08-22'
    };

    return list.map(t => {
      if (!t.date && t.day && dayToDateMap[t.day]) {
        t.date = dayToDateMap[t.day];
      } else if (!t.date) {
        t.date = '2026-08-18';
      }
      if (t.date && typeof AcademicCalendarService !== 'undefined') {
        const calculatedDay = AcademicCalendarService.getDayName(t.date);
        if (calculatedDay) {
          t.day = calculatedDay;
        }
      }
      return t;
    });
  },

  getTimetableById(id) {
    return this.getAllTimetables().find(t => t.id === id) || null;
  },

  getStudentTimetable(studentId) {
    const students = DataStore.get('STUDENTS') || [];
    const student = students.find(s => s.id === studentId || s.userId === studentId);
    const classId = student ? (student.classId || "CLS001") : "CLS001";
    return this.getClassTimetable(classId);
  },

  getFacultyTimetable(facultyId) {
    const list = this.getAllTimetables();
    return list.filter(t => t.facultyId === facultyId && t.status === 'ACTIVE');
  },

  getClassTimetable(sectionId) {
    const list = this.getAllTimetables();
    return list.filter(t => (t.sectionId === sectionId || t.classId === sectionId) && t.status === 'ACTIVE');
  },

  /**
   * Comprehensive Conflict & Validation Engine
   */
  validateTimeOverlap(entry, excludeId = null) {
    if (!entry.date) {
      throw new Error("Date is required for scheduled slot.");
    }
    if (!entry.startTime || !entry.endTime) {
      throw new Error("Start and End times are required.");
    }
    if (entry.startTime >= entry.endTime) {
      throw new Error("End time must be later than start time.");
    }
    if (!entry.subjectId) throw new Error("Subject is required.");
    if (!entry.sectionId) throw new Error("Section / Class is required.");

    // Automatically calculate Day from Date
    const calculatedDay = typeof AcademicCalendarService !== 'undefined'
      ? AcademicCalendarService.getDayName(entry.date)
      : entry.day;
    entry.day = calculatedDay || entry.day;

    const list = this.getAllTimetables().filter(t => t.id !== excludeId && t.status === 'ACTIVE');

    // Helper: Check time overlap between two slots
    const isOverlapping = (s1, e1, s2, e2) => {
      return (s1 < e2 && e1 > s2);
    };

    // Helper: Match Date or Day (if legacy)
    const isSameDateOrDay = (t, e) => {
      if (t.date && e.date) {
        return t.date === e.date;
      }
      return t.day && e.day && t.day.toLowerCase() === e.day.toLowerCase();
    };

    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : DataStore.get('SUBJECTS') || [];
    const facultyList = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : DataStore.get('FACULTY') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];

    // 1. DUPLICATE SLOT CHECK
    const duplicate = list.find(t =>
      isSameDateOrDay(t, entry) &&
      t.startTime === entry.startTime &&
      t.endTime === entry.endTime &&
      t.subjectId === entry.subjectId &&
      t.facultyId === entry.facultyId &&
      (t.sectionId === entry.sectionId || t.classId === entry.sectionId) &&
      t.room === entry.room
    );

    if (duplicate) {
      throw new Error("An identical scheduled slot already exists.");
    }

    // 2. FACULTY CONFLICT CHECK
    const facultyConflict = list.find(t =>
      t.facultyId === entry.facultyId &&
      isSameDateOrDay(t, entry) &&
      isOverlapping(entry.startTime, entry.endTime, t.startTime, t.endTime)
    );

    if (facultyConflict) {
      const fac = facultyList.find(f => f.id === entry.facultyId);
      const facName = fac ? fac.name : "Faculty";
      const sub = subjects.find(s => s.id === facultyConflict.subjectId);
      const subName = sub ? sub.name : facultyConflict.subjectId;
      throw new Error(`TIMETABLE CONFLICT\n\n${facName} already has a scheduled class during this time.\n\nExisting:\n${subName}\n${facultyConflict.startTime}–${facultyConflict.endTime}\nRoom ${facultyConflict.room}\n\nRequested:\n${entry.startTime}–${entry.endTime}\n\nPlease select another time.`);
    }

    // 3. SECTION CONFLICT CHECK
    const sectionConflict = list.find(t =>
      (t.sectionId === entry.sectionId || t.classId === entry.sectionId) &&
      isSameDateOrDay(t, entry) &&
      isOverlapping(entry.startTime, entry.endTime, t.startTime, t.endTime)
    );

    if (sectionConflict) {
      const cls = classes.find(c => c.id === entry.sectionId);
      const clsName = cls ? cls.name : entry.sectionId;
      throw new Error(`${clsName} already has a scheduled class during this time.`);
    }

    // 4. ROOM CONFLICT CHECK
    const roomConflict = list.find(t =>
      t.room && entry.room &&
      t.room.toLowerCase().trim() === entry.room.toLowerCase().trim() &&
      isSameDateOrDay(t, entry) &&
      isOverlapping(entry.startTime, entry.endTime, t.startTime, t.endTime)
    );

    if (roomConflict) {
      throw new Error(`Room ${entry.room} is already assigned during this time.`);
    }
  },

  createTimetableEntry(data) {
    this.validateTimeOverlap(data);

    const calculatedDay = typeof AcademicCalendarService !== 'undefined'
      ? AcademicCalendarService.getDayName(data.date)
      : data.day;

    const newEntry = {
      id: "TT" + String(Date.now()).slice(-6),
      academicYear: data.academicYear || "2026-27",
      semester: Number(data.semester) || 2,
      date: data.date,
      day: calculatedDay,
      startTime: data.startTime,
      endTime: data.endTime,
      subjectId: data.subjectId,
      facultyId: data.facultyId || "FAC001",
      departmentId: data.departmentId || "DEP001",
      sectionId: data.sectionId,
      room: data.room || "301",
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    DataStore.addItem('TIMETABLES', newEntry);
    return newEntry;
  },

  updateTimetableEntry(id, data) {
    const existing = this.getTimetableById(id);
    if (!existing) throw new Error("Scheduled slot not found.");

    const merged = { ...existing, ...data };
    
    // Automatically recalculate day if date changed
    if (data.date && typeof AcademicCalendarService !== 'undefined') {
      merged.day = AcademicCalendarService.getDayName(data.date);
      data.day = merged.day;
    }

    this.validateTimeOverlap(merged, id);

    data.updatedAt = new Date().toISOString().split('T')[0];
    return DataStore.updateItem('TIMETABLES', id, data);
  },

  deleteTimetableEntry(id) {
    DataStore.deleteItem('TIMETABLES', id);
  },

  /**
   * Advanced Query, Multi-Filter, Search, Sort & Paginate Engine
   */
  getScheduledSlots(options = {}) {
    let list = this.getAllTimetables();

    const {
      search = '',
      dateFilter = 'ALL', // 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'SPECIFIC' | 'RANGE'
      specificDate = '',
      startDate = '',
      endDate = '',
      day = 'ALL',
      department = 'ALL',
      section = 'ALL',
      facultyId = 'ALL',
      subjectId = 'ALL',
      status = 'ALL',
      sortBy = 'date', // 'date' | 'time' | 'subject' | 'faculty' | 'department' | 'section' | 'room' | 'status'
      sortOrder = 'asc',
      page = 1,
      pageSize = 10
    } = options;

    const subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : DataStore.get('SUBJECTS') || [];
    const facultyList = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : DataStore.get('FACULTY') || [];
    const classes = typeof classService !== 'undefined' ? classService.getClasses() : DataStore.get('CLASSES') || [];
    const departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : DataStore.get('DEPARTMENTS') || [];

    // Helper date comparison
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. DATE FILTER
    if (dateFilter === 'TODAY') {
      list = list.filter(t => t.date === todayStr);
    } else if (dateFilter === 'THIS_WEEK') {
      // Calculate current week start (Monday) and end (Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + distanceToMon);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const monStr = monday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];

      list = list.filter(t => t.date && t.date >= monStr && t.date <= sunStr);
    } else if (dateFilter === 'THIS_MONTH') {
      const yearMonth = todayStr.substring(0, 7); // e.g. "2026-08"
      list = list.filter(t => t.date && t.date.startsWith(yearMonth));
    } else if (dateFilter === 'SPECIFIC' && specificDate) {
      list = list.filter(t => t.date === specificDate);
    } else if (dateFilter === 'RANGE') {
      if (startDate) list = list.filter(t => t.date && t.date >= startDate);
      if (endDate) list = list.filter(t => t.date && t.date <= endDate);
    }

    // 2. DAY FILTER
    if (day && day !== 'ALL') {
      list = list.filter(t => t.day && t.day.toLowerCase() === day.toLowerCase());
    }

    // 3. DEPARTMENT FILTER
    if (department && department !== 'ALL') {
      list = list.filter(t => {
        if (t.departmentId === department) return true;
        const cls = classes.find(c => c.id === t.sectionId || c.id === t.classId);
        if (cls && (cls.departmentId === department || cls.department === department)) return true;
        const sub = subjects.find(s => s.id === t.subjectId);
        if (sub && (sub.departmentId === department || sub.department === department)) return true;
        const deptObj = departments.find(d => d.id === department || d.code === department);
        if (deptObj && (t.departmentId === deptObj.id || t.departmentId === deptObj.code)) return true;
        return false;
      });
    }

    // 4. SECTION FILTER
    if (section && section !== 'ALL') {
      list = list.filter(t => t.sectionId === section || t.classId === section);
    }

    // 5. FACULTY FILTER
    if (facultyId && facultyId !== 'ALL') {
      list = list.filter(t => t.facultyId === facultyId);
    }

    // 6. SUBJECT FILTER
    if (subjectId && subjectId !== 'ALL') {
      list = list.filter(t => t.subjectId === subjectId);
    }

    // 7. STATUS FILTER
    if (status && status !== 'ALL') {
      list = list.filter(t => t.status === status);
    }

    // 8. SEARCH FILTER (Date, Day, Subject, Faculty, Department, Section, Room)
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(t => {
        const sub = subjects.find(s => s.id === t.subjectId);
        const fac = facultyList.find(f => f.id === t.facultyId);
        const cls = classes.find(c => c.id === t.sectionId);
        const dept = departments.find(d => d.id === t.departmentId || d.code === t.departmentId);

        const dateFormatted = typeof AcademicCalendarService !== 'undefined' ? AcademicCalendarService.formatDate(t.date) : t.date;

        const matchDate = t.date && t.date.toLowerCase().includes(q);
        const matchFormattedDate = dateFormatted && dateFormatted.toLowerCase().includes(q);
        const matchDay = t.day && t.day.toLowerCase().includes(q);
        const matchSubject = sub && (sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q));
        const matchFaculty = fac && fac.name.toLowerCase().includes(q);
        const matchSection = cls && cls.name.toLowerCase().includes(q);
        const matchDept = dept && (dept.name.toLowerCase().includes(q) || dept.code.toLowerCase().includes(q));
        const matchRoom = t.room && t.room.toLowerCase().includes(q);

        return matchDate || matchFormattedDate || matchDay || matchSubject || matchFaculty || matchSection || matchDept || matchRoom;
      });
    }

    // 9. SORTING
    list.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case 'time':
          valA = a.startTime || '';
          valB = b.startTime || '';
          break;
        case 'subject':
          const subA = subjects.find(s => s.id === a.subjectId);
          const subB = subjects.find(s => s.id === b.subjectId);
          valA = subA ? subA.name : a.subjectId;
          valB = subB ? subB.name : b.subjectId;
          break;
        case 'faculty':
          const facA = facultyList.find(f => f.id === a.facultyId);
          const facB = facultyList.find(f => f.id === b.facultyId);
          valA = facA ? facA.name : a.facultyId;
          valB = facB ? facB.name : b.facultyId;
          break;
        case 'department':
          valA = a.departmentId || '';
          valB = b.departmentId || '';
          break;
        case 'section':
          valA = a.sectionId || '';
          valB = b.sectionId || '';
          break;
        case 'room':
          valA = a.room || '';
          valB = b.room || '';
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'date':
        default:
          valA = (a.date || '') + ' ' + (a.startTime || '');
          valB = (b.date || '') + ' ' + (b.startTime || '');
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;

      // Secondary sort by Start Time
      if (a.startTime < b.startTime) return -1;
      if (a.startTime > b.startTime) return 1;

      return 0;
    });

    // 10. PAGINATION
    const totalRecords = list.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = list.slice(startIndex, startIndex + pageSize);

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
   * Lightweight Summary KPI Cards Metrics
   */
  getSummaryStats() {
    const list = this.getAllTimetables();
    const todayStr = new Date().toISOString().split('T')[0];

    // This week calculate
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];

    const totalSlots = list.length;
    const activeSlots = list.filter(t => t.status === 'ACTIVE').length;
    const todaySlots = list.filter(t => t.date === todayStr && t.status === 'ACTIVE').length;
    const thisWeekSlots = list.filter(t => t.date && t.date >= monStr && t.date <= sunStr && t.status === 'ACTIVE').length;

    return {
      totalSlots,
      activeSlots,
      todaySlots,
      thisWeekSlots
    };
  }
};

window.TimetableService = TimetableService;
