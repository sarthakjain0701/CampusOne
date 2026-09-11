/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - TIMETABLE & SCHEDULED SLOTS SERVICE
   ========================================================================== */

const TimetableService = {

  async getAllTimetables() {
    if (!window.FirebaseService || !window.FirebaseService.db) return [];
    const db = window.FirebaseService.db;
    const snapshot = await db.collection('timetables').get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  },

  async getTimetableById(id) {
    if (!window.FirebaseService || !window.FirebaseService.db) return null;
    const db = window.FirebaseService.db;
    const doc = await db.collection('timetables').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async createTimetableEntry(data) {
    const db = window.FirebaseService.db;
    const newEntry = {
      ...data,
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const docRef = await db.collection('timetables').add(newEntry);
    return { id: docRef.id, ...newEntry };
  },

  async updateTimetableEntry(id, data) {
    const db = window.FirebaseService.db;
    data.updatedAt = new Date().toISOString().split('T')[0];
    await db.collection('timetables').doc(id).update(data);
    return true;
  },

  async deleteTimetableEntry(id) {
    const db = window.FirebaseService.db;
    await db.collection('timetables').doc(id).delete();
    return true;
  },

  async getScheduledSlots(options = {}) {
    let list = await this.getAllTimetables();

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

    let subjects = [];
    if (typeof subjectService !== 'undefined' && subjectService.getSubjectsFromFirestore) {
      try { subjects = await subjectService.getSubjectsFromFirestore(); }
      catch(e) { console.warn('Failed to fetch subjects from Firestore', e); subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : []; }
    } else {
      subjects = typeof subjectService !== 'undefined' ? subjectService.getSubjects() : [];
    }
    
    let facultyList = [];
    if (typeof facultyService !== 'undefined' && facultyService.getFacultyFromFirestore) {
      try {
        facultyList = await facultyService.getFacultyFromFirestore();
      } catch (e) {
        console.warn("Failed to fetch faculty from Firestore, falling back to mock", e);
        facultyList = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : [];
      }
    } else {
      facultyList = typeof facultyService !== 'undefined' ? facultyService.getFaculty() : [];
    }

    let classes = [];
    if (typeof classService !== 'undefined' && classService.getClassesFromFirestore) {
      try { classes = await classService.getClassesFromFirestore(); }
      catch(e) { console.warn('Failed to fetch classes from Firestore', e); classes = typeof classService !== 'undefined' ? classService.getClasses() : []; }
    } else {
      classes = typeof classService !== 'undefined' ? classService.getClasses() : [];
    }
    let departments = [];
    if (typeof departmentService !== 'undefined' && departmentService.getDepartmentsFromFirestore) {
      try { departments = await departmentService.getDepartmentsFromFirestore(); }
      catch(e) { console.warn('Failed to fetch departments from Firestore', e); departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : []; }
    } else {
      departments = typeof departmentService !== 'undefined' ? departmentService.getDepartments() : [];
    }

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
  async getSummaryStats() {
    const list = await this.getAllTimetables();
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
