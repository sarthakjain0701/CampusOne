/* ==========================================================================
   POORNIMA ATTENDANCE MANAGEMENT SYSTEM (PAMS) - DATA STORE
   Central Data Store with Firebase Sync + Seed Data Store
   College: POORNIMA GROUP OF EDUCATION
   ========================================================================== */

const DataStore = {
  // Key names in LocalStorage
  STORAGE_KEYS: {
    USERS: 'pams_users',
    STUDENTS: 'pams_students',
    FACULTY: 'pams_faculty',
    DEPARTMENTS: 'pams_departments',
    SUBJECTS: 'pams_subjects',
    CLASSES: 'pams_classes',
    ASSIGNMENTS: 'pams_assignments',
    ATTENDANCE: 'pams_attendance',
    NOTIFICATIONS: 'pams_notifications',
    CURRENT_USER: 'pams_current_user',
    LEARNING_RESOURCES: 'pams_learning_resources',
    TIMETABLES: 'pams_timetables',
    EXAM_RESULTS: 'pams_exam_results',
    HOLIDAYS: 'pams_holidays',
    LIBRARY_RECORDS: 'pams_library_records',
    EXAM_PERIODS: 'pams_exam_periods',
    EXAM_FORMS: 'pams_exam_forms',
    HALL_TICKETS: 'pams_hall_tickets',
    MID_TERM_MARKS: 'pams_mid_term_marks'
  },

  // Initialize Data Store with Poornima Group of Education default seed data if empty
  init() {
    if (!localStorage.getItem(this.STORAGE_KEYS.DEPARTMENTS)) {
      this.seedData();
    }
    this.seedBatch1Data();
    this.seedBatch3Data();
    this.seedBatch4Data();
    this.syncMockData();
  },

  syncMockData() {
    if (window.MOCK_DATA) {
      if (window.MOCK_DATA.students && window.MOCK_DATA.students.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(window.MOCK_DATA.students));
      }
      if (window.MOCK_DATA.faculty && window.MOCK_DATA.faculty.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.FACULTY, JSON.stringify(window.MOCK_DATA.faculty));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS) && window.MOCK_DATA.notifications) {
        localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(window.MOCK_DATA.notifications));
      }
      const storedTT = localStorage.getItem(this.STORAGE_KEYS.TIMETABLES);
      if (window.MOCK_DATA.timetables && (!storedTT || !JSON.parse(storedTT).some(t => t.date))) {
        localStorage.setItem(this.STORAGE_KEYS.TIMETABLES, JSON.stringify(window.MOCK_DATA.timetables));
      }
    }
  },

  seedBatch1Data() {
    if (window.MOCK_DATA) {
      if (!localStorage.getItem(this.STORAGE_KEYS.LEARNING_RESOURCES)) {
        localStorage.setItem(this.STORAGE_KEYS.LEARNING_RESOURCES, JSON.stringify(window.MOCK_DATA.learningResources || []));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.TIMETABLES)) {
        localStorage.setItem(this.STORAGE_KEYS.TIMETABLES, JSON.stringify(window.MOCK_DATA.timetables || []));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.EXAM_RESULTS)) {
        localStorage.setItem(this.STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(window.MOCK_DATA.examResults || []));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.HOLIDAYS)) {
        localStorage.setItem(this.STORAGE_KEYS.HOLIDAYS, JSON.stringify(window.MOCK_DATA.holidays || []));
      }
    }
  },

  seedBatch3Data() {
    if (window.MOCK_DATA) {
      if (!localStorage.getItem(this.STORAGE_KEYS.LIBRARY_RECORDS)) {
        localStorage.setItem(this.STORAGE_KEYS.LIBRARY_RECORDS, JSON.stringify(window.MOCK_DATA.libraryRecords || []));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.EXAM_PERIODS)) {
        localStorage.setItem(this.STORAGE_KEYS.EXAM_PERIODS, JSON.stringify(window.MOCK_DATA.examPeriods || []));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.EXAM_FORMS)) {
        localStorage.setItem(this.STORAGE_KEYS.EXAM_FORMS, JSON.stringify(window.MOCK_DATA.examForms || []));
      }
    }
  },

  seedBatch4Data() {
    if (window.MOCK_DATA) {
      if (!localStorage.getItem(this.STORAGE_KEYS.HALL_TICKETS)) {
        localStorage.setItem(this.STORAGE_KEYS.HALL_TICKETS, JSON.stringify(window.MOCK_DATA.hallTickets || []));
      }
      if (!localStorage.getItem(this.STORAGE_KEYS.MID_TERM_MARKS)) {
        localStorage.setItem(this.STORAGE_KEYS.MID_TERM_MARKS, JSON.stringify(window.MOCK_DATA.midTermMarks || []));
      }
    }
  },

  seedData() {
    // 1. Departments
    const departments = [
      { id: "dept_cse", name: "Computer Science & Engineering", code: "CSE", description: "Department of Computer Science & Engineering", active: true },
      { id: "dept_ece", name: "Electronics & Communication", code: "ECE", description: "Department of Electronics & Communication", active: true },
      { id: "dept_me", name: "Mechanical Engineering", code: "ME", description: "Department of Mechanical Engineering", active: true },
      { id: "dept_ai", name: "Artificial Intelligence & Data Science", code: "AI&DS", description: "Department of AI & Data Science", active: true }
    ];

    // 2. Classes
    const classes = [
      { id: "cls_cse_3a", name: "CSE-3A", departmentId: "dept_cse", semester: 5, section: "A", academicYear: "2025–26", active: true },
      { id: "cls_cse_3b", name: "CSE-3B", departmentId: "dept_cse", semester: 5, section: "B", academicYear: "2025–26", active: true },
      { id: "cls_ece_2a", name: "ECE-2A", departmentId: "dept_ece", semester: 3, section: "A", academicYear: "2025–26", active: true },
      { id: "cls_ai_3a", name: "AI-3A", departmentId: "dept_ai", semester: 5, section: "A", academicYear: "2025–26", active: true }
    ];

    // 3. Subjects
    const subjects = [
      { id: "sub_ds", code: "CS501", name: "Data Structures & Algorithms", departmentId: "dept_cse", semester: 5, credits: 4, active: true },
      { id: "sub_dbms", code: "CS502", name: "Database Management Systems", departmentId: "dept_cse", semester: 5, credits: 4, active: true },
      { id: "sub_cn", code: "CS503", name: "Computer Networks", departmentId: "dept_cse", semester: 5, credits: 3, active: true },
      { id: "sub_os", code: "CS504", name: "Operating Systems", departmentId: "dept_cse", semester: 5, credits: 3, active: true },
      { id: "sub_ai", code: "AI501", name: "Machine Learning Fundamentals", departmentId: "dept_ai", semester: 5, credits: 4, active: true }
    ];

    // 4. Users (Admin, Faculty, Students)
    const users = [
      { uid: "usr_admin", email: "admin@poornima.edu.in", role: "ADMIN", name: "Rajesh Sharma", phone: "+91 98290 11223", active: true },
      { uid: "usr_fac_1", email: "faculty@poornima.edu.in", role: "FACULTY", name: "Dr. Anjali Mehta", phone: "+91 98290 44556", active: true },
      { uid: "usr_fac_2", email: "vikram@poornima.edu.in", role: "FACULTY", name: "Prof. Vikram Singh", phone: "+91 98290 77889", active: true },
      { uid: "usr_stu_1", email: "student@poornima.edu.in", role: "STUDENT", name: "Aarav Sharma", phone: "+91 98291 00112", active: true },
      { uid: "usr_stu_2", email: "priya@poornima.edu.in", role: "STUDENT", name: "Priya Verma", phone: "+91 98291 33445", active: true },
      { uid: "usr_stu_3", email: "rohan@poornima.edu.in", role: "STUDENT", name: "Rohan Gupta", phone: "+91 98291 66778", active: true }
    ];

    // 5. Faculty Profiles
    const faculty = [
      { id: "fac_1", userId: "usr_fac_1", employeeId: "PGE-FAC-101", name: "Dr. Anjali Mehta", email: "faculty@poornima.edu.in", phone: "+91 98290 44556", departmentId: "dept_cse", active: true },
      { id: "fac_2", userId: "usr_fac_2", employeeId: "PGE-FAC-102", name: "Prof. Vikram Singh", email: "vikram@poornima.edu.in", phone: "+91 98290 77889", departmentId: "dept_cse", active: true }
    ];

    // 6. Student Profiles
    const students = [
      { id: "stu_1", userId: "usr_stu_1", rollNo: "PGE/2023/CSE/001", name: "Aarav Sharma", email: "student@poornima.edu.in", phone: "+91 98291 00112", departmentId: "dept_cse", classId: "cls_cse_3a", semester: 5, section: "A", active: true },
      { id: "stu_2", userId: "usr_stu_2", rollNo: "PGE/2023/CSE/002", name: "Priya Verma", email: "priya@poornima.edu.in", phone: "+91 98291 33445", departmentId: "dept_cse", classId: "cls_cse_3a", semester: 5, section: "A", active: true },
      { id: "stu_3", userId: "usr_stu_3", rollNo: "PGE/2023/CSE/003", name: "Rohan Gupta", email: "rohan@poornima.edu.in", phone: "+91 98291 66778", departmentId: "dept_cse", classId: "cls_cse_3a", semester: 5, section: "A", active: true },
      { id: "stu_4", userId: "usr_stu_4", rollNo: "PGE/2023/CSE/004", name: "Kavya Singhania", email: "kavya@poornima.edu.in", phone: "+91 98291 88990", departmentId: "dept_cse", classId: "cls_cse_3a", semester: 5, section: "A", active: true },
      { id: "stu_5", userId: "usr_stu_5", rollNo: "PGE/2023/CSE/005", name: "Aditya Joshi", email: "aditya@poornima.edu.in", phone: "+91 98291 22334", departmentId: "dept_cse", classId: "cls_cse_3a", semester: 5, section: "A", active: true }
    ];

    // 7. Faculty Assignments
    const assignments = [
      { id: "asgn_1", facultyId: "fac_1", subjectId: "sub_ds", classId: "cls_cse_3a", departmentId: "dept_cse", semester: 5, academicYear: "2025–26", active: true },
      { id: "asgn_2", facultyId: "fac_1", subjectId: "sub_dbms", classId: "cls_cse_3a", departmentId: "dept_cse", semester: 5, academicYear: "2025–26", active: true },
      { id: "asgn_3", facultyId: "fac_2", subjectId: "sub_cn", classId: "cls_cse_3a", departmentId: "dept_cse", semester: 5, academicYear: "2025–26", active: true }
    ];

    // 8. Attendance Records (Sample for Aarav Sharma & Class CSE-3A)
    const todayStr = new Date().toISOString().split('T')[0];
    const attendance = [
      { id: "cls_cse_3a_sub_ds_2026-08-10_stu_1", studentId: "stu_1", facultyId: "fac_1", subjectId: "sub_ds", classId: "cls_cse_3a", date: "2026-08-10", status: "PRESENT", createdAt: new Date().toISOString() },
      { id: "cls_cse_3a_sub_ds_2026-08-10_stu_2", studentId: "stu_2", facultyId: "fac_1", subjectId: "sub_ds", classId: "cls_cse_3a", date: "2026-08-10", status: "PRESENT", createdAt: new Date().toISOString() },
      { id: "cls_cse_3a_sub_ds_2026-08-10_stu_3", studentId: "stu_3", facultyId: "fac_1", subjectId: "sub_ds", classId: "cls_cse_3a", date: "2026-08-10", status: "ABSENT", createdAt: new Date().toISOString() },
      { id: "cls_cse_3a_sub_dbms_2026-08-11_stu_1", studentId: "stu_1", facultyId: "fac_1", subjectId: "sub_dbms", classId: "cls_cse_3a", date: "2026-08-11", status: "PRESENT", createdAt: new Date().toISOString() },
      { id: "cls_cse_3a_sub_cn_2026-08-12_stu_1", studentId: "stu_1", facultyId: "fac_2", subjectId: "sub_cn", classId: "cls_cse_3a", date: "2026-08-12", status: "PRESENT", createdAt: new Date().toISOString() },
      { id: "cls_cse_3a_sub_os_2026-08-13_stu_1", studentId: "stu_1", facultyId: "fac_1", subjectId: "sub_os", classId: "cls_cse_3a", date: "2026-08-13", status: "ABSENT", createdAt: new Date().toISOString() }
    ];

    // 9. Notifications
    const notifications = [
      { id: "notif_1", userId: "usr_stu_1", title: "Attendance Marked", message: "Your attendance for Data Structures on 12-Aug was marked PRESENT.", timestamp: "12 Aug, 10:30 AM", read: false, type: "INFO", createdAt: "12 Aug, 10:30 AM" },
      { id: "notif_2", userId: "usr_stu_1", title: "Low Attendance Warning", message: "Your attendance in Computer Networks is 71%, which is below the 75% requirement.", timestamp: "11 Aug, 04:15 PM", read: false, type: "WARNING", createdAt: "11 Aug, 04:15 PM" },
      { id: "notif_3", userId: "usr_admin", title: "New Faculty Registered", message: "Dr. Anjali Mehta signed into the system.", timestamp: "10 Aug, 09:00 AM", read: true, type: "SUCCESS", createdAt: "10 Aug, 09:00 AM" }
    ];

    localStorage.setItem(this.STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    localStorage.setItem(this.STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    localStorage.setItem(this.STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(this.STORAGE_KEYS.FACULTY, JSON.stringify(faculty));
    localStorage.setItem(this.STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(this.STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    localStorage.setItem(this.STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // Storage Getters
  get(key) {
    this.init();
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS[key.toUpperCase()]) || '[]');
  },

  // Storage Setters
  set(key, data) {
    localStorage.setItem(this.STORAGE_KEYS[key.toUpperCase()], JSON.stringify(data));
  },

  // Current User Session
  getCurrentUser() {
    const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    }
  },

  // CRUD Utilities
  addItem(collectionKey, item) {
    const list = this.get(collectionKey);
    list.unshift(item);
    this.set(collectionKey, list);
    return item;
  },

  updateItem(collectionKey, id, updatedProps) {
    const list = this.get(collectionKey);
    const index = list.findIndex(i => i.id === id || i.uid === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedProps, updatedAt: new Date().toISOString() };
      this.set(collectionKey, list);
      return list[index];
    }
    return null;
  },

  deleteItem(collectionKey, id) {
    const list = this.get(collectionKey);
    const filtered = list.filter(i => i.id !== id && i.uid !== id);
    this.set(collectionKey, filtered);
  },

  // Save Bulk Attendance Record with Deterministic Duplicate Check
  saveAttendanceBatch(classId, subjectId, date, facultyId, records) {
    const existing = this.get('ATTENDANCE');
    const newRecords = [];

    records.forEach(r => {
      const docId = `${classId}_${subjectId}_${date}_${r.studentId}`;
      const newRec = {
        id: docId,
        studentId: r.studentId,
        facultyId: facultyId,
        subjectId: subjectId,
        classId: classId,
        date: date,
        status: r.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingIndex = existing.findIndex(e => e.id === docId);
      if (existingIndex !== -1) {
        existing[existingIndex] = newRec;
      } else {
        existing.push(newRec);
      }
      newRecords.push(newRec);
    });

    this.set('ATTENDANCE', existing);
    return newRecords;
  },

  // Calculate Student Attendance Percentages
  calculateStudentAttendance(studentId) {
    const records = this.get('ATTENDANCE').filter(r => r.studentId === studentId);
    const total = records.length;
    if (total === 0) return { percentage: 100, present: 0, absent: 0, total: 0, status: 'Good' };

    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = total - present;
    const percentage = Math.round((present / total) * 100);

    let status = 'Good';
    if (percentage < 65) status = 'Low Attendance';
    else if (percentage < 75) status = 'Warning';

    return { percentage, present, absent, total, status };
  }
};

DataStore.init();
window.DataStore = DataStore;
