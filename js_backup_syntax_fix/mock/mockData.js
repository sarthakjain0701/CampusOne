/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - PURE MOCK DATASET
   ========================================================================== */

const MOCK_DATA = {
  // Demo Users
  users: [
    {
      id: "USR_ADMIN_01",
      email: "admin@pas.demo",
      role: "ADMIN",
      name: "System Administrator",
      phone: "+91 98290 11223",
      status: "ACTIVE"
    },
    {
      id: "USR_FAC_01",
      email: "faculty@pas.demo",
      role: "FACULTY",
      name: "Dr. Rajesh Kumar",
      phone: "+91 98290 44556",
      department: "Computer Science & Engineering",
      status: "ACTIVE"
    },
    {
      id: "USR_FAC_02",
      email: "vikram@pas.demo",
      role: "FACULTY",
      name: "Prof. Vikram Singh",
      phone: "+91 98290 77889",
      department: "Computer Science & Engineering",
      status: "ACTIVE"
    },
    {
      id: "USR_STU_01",
      email: "2025pietcssiddhant001@poornima.org",
      role: "STUDENT",
      name: "Siddhant Jain",
      phone: "+91 98291 00112",
      rollNumber: "25eptcs001",
      registrationNumber: "PIET25CS001",
      department: "Computer Science & Engineering",
      semester: 2,
      section: "A",
      academicYear: "2026-27",
      status: "ACTIVE"
    },
    {
      id: "USR_STU_02",
      email: "2025pietcsaman002@poornima.org",
      role: "STUDENT",
      name: "Aman Sharma",
      phone: "+91 98291 33445",
      rollNumber: "25eptcs002",
      registrationNumber: "PIET25CS002",
      department: "Computer Science & Engineering",
      semester: 2,
      section: "A",
      academicYear: "2026-27",
      status: "ACTIVE"
    }
  ],

  // Departments
  departments: [
    { id: "DEP001", code: "CSE", name: "Computer Science & Engineering", hod: "Dr. Anjali Mehta", status: "ACTIVE" },
    { id: "DEP002", code: "IT", name: "Information Technology", hod: "Dr. Suresh Patel", status: "ACTIVE" },
    { id: "DEP003", code: "ECE", name: "Electronics & Communication", hod: "Prof. R. K. Vyas", status: "ACTIVE" },
    { id: "DEP004", code: "ME", name: "Mechanical Engineering", hod: "Dr. Ramesh Chandra", status: "ACTIVE" },
    { id: "DEP005", code: "CE", name: "Civil Engineering", hod: "Prof. S. K. Jain", status: "ACTIVE" }
  ],

  // Classes
  classes: [
    { id: "CLS001", name: "CSE-A", department: "Computer Science & Engineering", semester: 2, section: "A", academicYear: "2026-27", status: "ACTIVE" },
    { id: "CLS002", name: "CSE-B", department: "Computer Science & Engineering", semester: 2, section: "B", academicYear: "2026-27", status: "ACTIVE" },
    { id: "CLS003", name: "IT-A", department: "Information Technology", semester: 2, section: "A", academicYear: "2026-27", status: "ACTIVE" },
    { id: "CLS004", name: "ECE-A", department: "Electronics & Communication", semester: 2, section: "A", academicYear: "2026-27", status: "ACTIVE" }
  ],

  // Subjects
  subjects: [
    { id: "SUB001", code: "CS201", name: "Data Structures", department: "Computer Science & Engineering", semester: 2, credits: 4, status: "ACTIVE" },
    { id: "SUB002", code: "CS202", name: "Java Programming", department: "Computer Science & Engineering", semester: 2, credits: 4, status: "ACTIVE" },
    { id: "SUB003", code: "CS203", name: "Database Management Systems", department: "Computer Science & Engineering", semester: 2, credits: 3, status: "ACTIVE" },
    { id: "SUB004", code: "CS204", name: "Computer Networks", department: "Computer Science & Engineering", semester: 2, credits: 3, status: "ACTIVE" },
    { id: "SUB005", code: "MA201", name: "Engineering Mathematics", department: "Computer Science & Engineering", semester: 2, credits: 4, status: "ACTIVE" }
  ],

  // Faculty Records
  faculty: [
    { id: "FAC001", employeeId: "EMP-FAC-101", employeeNumber: "EMP-FAC-101", name: "Dr. Rajesh Kumar", email: "faculty@pas.demo", phone: "+91 98290 44556", department: "Computer Science & Engineering", designation: "Associate Professor", qrIdentifier: "PAMS|FACULTY|EMP-FAC-101", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "FAC002", employeeId: "EMP-FAC-102", employeeNumber: "EMP-FAC-102", name: "Prof. Vikram Singh", email: "vikram@pas.demo", phone: "+91 98290 77889", department: "Computer Science & Engineering", designation: "Assistant Professor", qrIdentifier: "PAMS|FACULTY|EMP-FAC-102", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "FAC003", employeeId: "EMP-FAC-103", employeeNumber: "EMP-FAC-103", name: "Dr. Anjali Mehta", email: "anjali@pas.demo", phone: "+91 98290 99001", department: "Computer Science & Engineering", designation: "Professor & HOD", qrIdentifier: "PAMS|FACULTY|EMP-FAC-103", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "FAC004", employeeId: "EMP-FAC-104", employeeNumber: "EMP-FAC-104", name: "Prof. Inactive User", email: "inactive_fac@pas.demo", phone: "+91 98290 00000", department: "Information Technology", designation: "Lecturer", qrIdentifier: "PAMS|FACULTY|EMP-FAC-104", qrStatus: "INACTIVE", status: "INACTIVE" }
  ],

  // Student Records
  students: [
    { id: "STU001", studentId: "STU001", rollNumber: "25EPTCS001", rollNo: "25EPTCS001", registrationNumber: "PIET25CS001", name: "Siddhant Jain", firstName: "Siddhant", email: "2025pietcssiddhant001@poornima.org", phone: "+91 98291 00112", department: "Computer Science & Engineering", departmentId: "DEP001", course: "B.Tech CSE", section: "A", batch: "2025–2029", enrollmentYear: "2025", semester: 2, classId: "CLS001", academicSession: "2026-27", academicYear: "2026-27", qrIdentifier: "PAMS|STUDENT|PIET25CS001", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "STU002", studentId: "STU002", rollNumber: "25EPTCS002", rollNo: "25EPTCS002", registrationNumber: "PIET25CS002", name: "Aman Sharma", firstName: "Aman", email: "2025pietcsaman002@poornima.org", phone: "+91 98291 33445", department: "Computer Science & Engineering", departmentId: "DEP001", course: "B.Tech CSE", section: "A", batch: "2025–2029", enrollmentYear: "2025", semester: 2, classId: "CLS001", academicSession: "2026-27", academicYear: "2026-27", qrIdentifier: "PAMS|STUDENT|PIET25CS002", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "STU003", studentId: "STU003", rollNumber: "25EPTCS003", rollNo: "25EPTCS003", registrationNumber: "PIET25CS003", name: "Rahul Verma", firstName: "Rahul", email: "2025pietcsrahul003@poornima.org", phone: "+91 98291 66778", department: "Computer Science & Engineering", departmentId: "DEP001", course: "B.Tech CSE", section: "A", batch: "2025–2029", enrollmentYear: "2025", semester: 2, classId: "CLS001", academicSession: "2026-27", academicYear: "2026-27", qrIdentifier: "PAMS|STUDENT|PIET25CS003", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "STU004", studentId: "STU004", rollNumber: "25EPTCS004", rollNo: "25EPTCS004", registrationNumber: "PIET25CS004", name: "Kavya Singhania", firstName: "Kavya", email: "2025pietcskavya004@poornima.org", phone: "+91 98291 88990", department: "Computer Science & Engineering", departmentId: "DEP001", course: "B.Tech CSE", section: "A", batch: "2025–2029", enrollmentYear: "2025", semester: 2, classId: "CLS001", academicSession: "2026-27", academicYear: "2026-27", qrIdentifier: "PAMS|STUDENT|PIET25CS004", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "STU005", studentId: "STU005", rollNumber: "26EPTCS005", rollNo: "26EPTCS005", registrationNumber: "PIET26CS005", name: "Aditya Joshi", firstName: "Aditya", email: "2026pietcsaditya005@poornima.org", phone: "+91 98291 22334", department: "Computer Science & Engineering", departmentId: "DEP001", course: "B.Tech CSE", section: "A", batch: "2026–2030", enrollmentYear: "2026", semester: 2, classId: "CLS001", academicSession: "2026-27", academicYear: "2026-27", qrIdentifier: "PAMS|STUDENT|PIET26CS005", qrStatus: "ACTIVE", status: "ACTIVE" },
    { id: "STU006", studentId: "STU006", rollNumber: "25EPTCS006", rollNo: "25EPTCS006", registrationNumber: "PIET25CS006", name: "Amit Inactive", firstName: "Amit", email: "2025pietcsamit006@poornima.org", phone: "+91 98291 00000", department: "Computer Science & Engineering", departmentId: "DEP001", course: "B.Tech CSE", section: "B", batch: "2025–2029", enrollmentYear: "2025", semester: 2, classId: "CLS002", academicSession: "2026-27", academicYear: "2026-27", qrIdentifier: "PAMS|STUDENT|PIET25CS006", qrStatus: "INACTIVE", status: "INACTIVE" }
  ],

  // Faculty Assignments
  assignments: [
    { id: "ASG001", facultyId: "FAC001", subjectId: "SUB001", classId: "CLS001", academicYear: "2026-27", status: "ACTIVE" },
    { id: "ASG002", facultyId: "FAC001", subjectId: "SUB002", classId: "CLS001", academicYear: "2026-27", status: "ACTIVE" },
    { id: "ASG003", facultyId: "FAC002", subjectId: "SUB004", classId: "CLS001", academicYear: "2026-27", status: "ACTIVE" }
  ],

  // Attendance Records
  attendance: [
    { id: "CLS001_SUB001_2026-08-10_STU001", studentId: "STU001", facultyId: "FAC001", subjectId: "SUB001", classId: "CLS001", date: "2026-08-10", status: "PRESENT" },
    { id: "CLS001_SUB001_2026-08-10_STU002", studentId: "STU002", facultyId: "FAC001", subjectId: "SUB001", classId: "CLS001", date: "2026-08-10", status: "PRESENT" },
    { id: "CLS001_SUB001_2026-08-10_STU003", studentId: "STU003", facultyId: "FAC001", subjectId: "SUB001", classId: "CLS001", date: "2026-08-10", status: "ABSENT" },
    { id: "CLS001_SUB002_2026-08-11_STU001", studentId: "STU001", facultyId: "FAC001", subjectId: "SUB002", classId: "CLS001", date: "2026-08-11", status: "PRESENT" },
    { id: "CLS001_SUB004_2026-08-12_STU001", studentId: "STU001", facultyId: "FAC002", subjectId: "SUB004", classId: "CLS001", date: "2026-08-12", status: "PRESENT" },
    { id: "CLS001_SUB003_2026-08-13_STU001", studentId: "STU001", facultyId: "FAC001", subjectId: "SUB003", classId: "CLS001", date: "2026-08-13", status: "ABSENT" }
  ],

  // Role-Isolated Notifications Matrix Dataset
  notifications: [
    // STUDENT NOTIFICATIONS (USR_STU_01 / STU001)
    { id: "NOT_STU_01", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "Attendance Marked", message: "Attendance for Java Programming has been recorded.", category: "ATTENDANCE", type: "INFO", priority: "LOW", isRead: false, createdAt: "15 Aug, 08:10 AM", relatedModule: "attendance-history" },
    { id: "NOT_STU_02", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "Low Attendance Warning", message: "Your attendance in Java Programming has fallen below 75%.", category: "ATTENDANCE", type: "WARNING", priority: "HIGH", isRead: false, createdAt: "14 Aug, 04:30 PM", relatedModule: "attendance-history" },
    { id: "NOT_STU_03", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "New Assignment Uploaded", message: "A new Java Programming assignment has been uploaded.", category: "DIGITAL_LEARNING", type: "INFO", priority: "MEDIUM", isRead: false, createdAt: "14 Aug, 02:15 PM", relatedModule: "digital-learning" },
    { id: "NOT_STU_04", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "Exam Form Rejected", message: "Your examination form has been rejected.", rejectionReason: "Registration document unreadable. Re-upload clear PDF copy.", category: "EXAM_FORM", type: "WARNING", priority: "HIGH", isRead: false, createdAt: "13 Aug, 11:45 AM", relatedModule: "exam-form" },
    { id: "NOT_STU_05", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "Library Overdue Alert", message: "Your issued book Data Structures is overdue.", category: "LIBRARY", type: "WARNING", priority: "HIGH", isRead: false, createdAt: "12 Aug, 09:00 AM", relatedModule: "library" },
    { id: "NOT_STU_06", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "Exam Result Published", message: "Your examination result is now available.", category: "RESULT", type: "SUCCESS", priority: "HIGH", isRead: true, createdAt: "10 Aug, 03:00 PM", relatedModule: "exam-results" },
    { id: "NOT_STU_07", recipientId: "USR_STU_01", recipientRole: "STUDENT", title: "Digital ID Card Available", message: "Your digital ID card is now available.", category: "DIGITAL_ID", type: "INFO", priority: "MEDIUM", isRead: true, createdAt: "08 Aug, 10:00 AM", relatedModule: "digital-id" },

    // FACULTY NOTIFICATIONS (USR_FAC_01 / FAC001)
    { id: "NOT_FAC_01", recipientId: "USR_FAC_01", recipientRole: "FACULTY", title: "Attendance Pending", message: "Attendance for Data Structures is pending.", category: "ATTENDANCE", type: "WARNING", priority: "MEDIUM", isRead: false, createdAt: "15 Aug, 08:20 AM", relatedModule: "mark-attendance" },
    { id: "NOT_FAC_02", recipientId: "USR_FAC_01", recipientRole: "FACULTY", title: "Exam Form Pending Review", message: "There are examination forms waiting for review.", category: "EXAM_FORM", type: "INFO", priority: "MEDIUM", isRead: false, createdAt: "14 Aug, 05:00 PM", relatedModule: "exam-form-management" },
    { id: "NOT_FAC_03", recipientId: "USR_FAC_01", recipientRole: "FACULTY", title: "Low Attendance Students Identified", message: "Students with attendance below the required percentage have been identified.", category: "ATTENDANCE", type: "WARNING", priority: "HIGH", isRead: false, createdAt: "13 Aug, 03:30 PM", relatedModule: "reports" },
    { id: "NOT_FAC_04", recipientId: "USR_FAC_01", recipientRole: "FACULTY", title: "Teaching Timetable Updated", message: "Your teaching timetable has been updated.", category: "TIMETABLE", type: "INFO", priority: "MEDIUM", isRead: true, createdAt: "11 Aug, 01:10 PM", relatedModule: "timetable" },

    // ADMIN NOTIFICATIONS (USR_ADMIN_01)
    { id: "NOT_ADM_01", recipientId: "USR_ADMIN_01", recipientRole: "ADMIN", title: "Attendance Pending Alert", message: "Some faculty members have not submitted today's attendance.", category: "ATTENDANCE", type: "WARNING", priority: "HIGH", isRead: false, createdAt: "15 Aug, 08:30 AM", relatedModule: "mark-attendance" },
    { id: "NOT_ADM_02", recipientId: "USR_ADMIN_01", recipientRole: "ADMIN", title: "New Exam Form Submitted", message: "A new examination form has been submitted.", category: "EXAM_FORM", type: "INFO", priority: "MEDIUM", isRead: false, createdAt: "14 Aug, 06:15 PM", relatedModule: "exam-form-management" },
    { id: "NOT_ADM_03", recipientId: "USR_ADMIN_01", recipientRole: "ADMIN", title: "Outstanding Library Fines", message: "There are outstanding library fines.", category: "LIBRARY", type: "WARNING", priority: "HIGH", isRead: false, createdAt: "13 Aug, 10:00 AM", relatedModule: "library" }
  ],

  // Digital Learning Resources
  learningResources: [
    { id: "RES001", title: "Unit 1: Fundamentals of Data Structures & Arrays", description: "Comprehensive notes covering Memory Allocation, Arrays, and Linked Lists.", subjectId: "SUB001", facultyId: "FAC001", resourceType: "NOTES", fileName: "DS_Unit1_Notes.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "RES002", title: "Data Structures Stack & Queue Practice Assignment", description: "Solve problem set 1 to 10 covering Stacks, Queues and Deques.", subjectId: "SUB001", facultyId: "FAC001", resourceType: "ASSIGNMENT", fileName: "DS_Assignment_1.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-05", updatedAt: "2026-08-05" },
    { id: "RES003", title: "Trees & Graphs Tutorial Sheet", description: "Tutorial sheet covering BST, AVL Trees, and Graph Traversal algorithms.", subjectId: "SUB001", facultyId: "FAC001", resourceType: "TUTE", fileName: "DS_Tute_2.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-08", updatedAt: "2026-08-08" },
    { id: "RES004", title: "Recommended Reference: Data Structures by Seymour Lipschutz", description: "Schaum's Outlines series for Data Structures.", subjectId: "SUB001", facultyId: "FAC001", resourceType: "BOOK", fileName: "Lipschutz_DS_Reference.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-02", updatedAt: "2026-08-02" },

    { id: "RES005", title: "Java OOPs Concepts & Inheritance Notes", description: "Class notes on Polymorphism, Encapsulation, and Interfaces in Java.", subjectId: "SUB002", facultyId: "FAC001", resourceType: "NOTES", fileName: "Java_OOPs_Unit2.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-03", updatedAt: "2026-08-03" },
    { id: "RES006", title: "Java Multithreading & Exception Handling Assignment", description: "Lab assignment on custom exceptions and thread pools.", subjectId: "SUB002", facultyId: "FAC001", resourceType: "ASSIGNMENT", fileName: "Java_Lab_Assignment_2.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-07", updatedAt: "2026-08-07" },

    { id: "RES007", title: "DBMS Relational Algebra & SQL Cheat Sheet", description: "Reference guide for DDL, DML, joins, and indexing syntax.", subjectId: "SUB003", facultyId: "FAC001", resourceType: "NOTES", fileName: "DBMS_SQL_Guide.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-04", updatedAt: "2026-08-04" },
    { id: "RES008", title: "Computer Networks OSI vs TCP/IP Layer Study Material", description: "Detailed notes on network topology and protocol architectures.", subjectId: "SUB004", facultyId: "FAC002", resourceType: "NOTES", fileName: "CN_OSI_Layers.pdf", fileUrl: "#", semester: 2, academicYear: "2026-27", status: "ACTIVE", uploadedAt: "2026-08-06", updatedAt: "2026-08-06" }
  ],

  // Semester Timetables & Scheduled Slots
  timetables: [
    { id: "TT001", date: "2026-08-18", day: "Tuesday", startTime: "09:00", endTime: "10:00", subjectId: "SUB002", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT002", date: "2026-08-18", day: "Tuesday", startTime: "10:00", endTime: "11:00", subjectId: "SUB003", facultyId: "FAC003", departmentId: "DEP001", sectionId: "CLS001", room: "302", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT003", date: "2026-08-18", day: "Tuesday", startTime: "11:00", endTime: "12:00", subjectId: "SUB001", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT004", date: "2026-08-18", day: "Tuesday", startTime: "09:00", endTime: "10:00", subjectId: "SUB004", facultyId: "FAC002", departmentId: "DEP001", sectionId: "CLS002", room: "201", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },

    { id: "TT005", date: "2026-08-19", day: "Wednesday", startTime: "09:00", endTime: "10:00", subjectId: "SUB001", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT006", date: "2026-08-19", day: "Wednesday", startTime: "10:00", endTime: "11:00", subjectId: "SUB004", facultyId: "FAC002", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT007", date: "2026-08-19", day: "Wednesday", startTime: "11:00", endTime: "12:00", subjectId: "SUB005", facultyId: "FAC002", departmentId: "DEP001", sectionId: "CLS002", room: "201", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },

    { id: "TT008", date: "2026-08-20", day: "Thursday", startTime: "09:00", endTime: "10:00", subjectId: "SUB002", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT009", date: "2026-08-20", day: "Thursday", startTime: "10:00", endTime: "11:00", subjectId: "SUB003", facultyId: "FAC003", departmentId: "DEP001", sectionId: "CLS001", room: "302", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },

    { id: "TT010", date: "2026-08-21", day: "Friday", startTime: "09:00", endTime: "10:00", subjectId: "SUB005", facultyId: "FAC002", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT011", date: "2026-08-21", day: "Friday", startTime: "10:00", endTime: "11:00", subjectId: "SUB001", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT012", date: "2026-08-21", day: "Friday", startTime: "11:00", endTime: "12:00", subjectId: "SUB002", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS002", room: "201", status: "INACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },

    { id: "TT013", date: "2026-08-16", day: "Sunday", startTime: "09:00", endTime: "10:00", subjectId: "SUB002", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT014", date: "2026-08-16", day: "Sunday", startTime: "10:00", endTime: "11:00", subjectId: "SUB003", facultyId: "FAC003", departmentId: "DEP001", sectionId: "CLS001", room: "302", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },

    { id: "TT015", date: "2026-08-17", day: "Monday", startTime: "09:00", endTime: "10:00", subjectId: "SUB002", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
    { id: "TT016", date: "2026-08-17", day: "Monday", startTime: "10:00", endTime: "11:00", subjectId: "SUB001", facultyId: "FAC001", departmentId: "DEP001", sectionId: "CLS001", room: "301", status: "ACTIVE", academicYear: "2026-27", semester: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" }
  ],

  // Examination Results
  examResults: [
    // Semester 1 Results for STU001 (Rahul Sharma) - Published
    { id: "RES_S1_01", studentId: "STU001", semester: 1, academicYear: "2025-26", subjectId: "SUB001", marks: 85, maxMarks: 100, grade: "A", credits: 4, status: "PUBLISHED", publishedAt: "2026-01-15", createdAt: "2026-01-10", updatedAt: "2026-01-15" },
    { id: "RES_S1_02", studentId: "STU001", semester: 1, academicYear: "2025-26", subjectId: "SUB002", marks: 88, maxMarks: 100, grade: "A+", credits: 4, status: "PUBLISHED", publishedAt: "2026-01-15", createdAt: "2026-01-10", updatedAt: "2026-01-15" },
    { id: "RES_S1_03", studentId: "STU001", semester: 1, academicYear: "2025-26", subjectId: "SUB003", marks: 82, maxMarks: 100, grade: "A", credits: 3, status: "PUBLISHED", publishedAt: "2026-01-15", createdAt: "2026-01-10", updatedAt: "2026-01-15" },
    { id: "RES_S1_04", studentId: "STU001", semester: 1, academicYear: "2025-26", subjectId: "SUB005", marks: 74, maxMarks: 100, grade: "B+", credits: 4, status: "PUBLISHED", publishedAt: "2026-01-15", createdAt: "2026-01-10", updatedAt: "2026-01-15" },

    // Semester 2 Mid-Term Results for STU001 - Published
    { id: "RES_S2_01", studentId: "STU001", semester: 2, academicYear: "2026-27", subjectId: "SUB001", marks: 82, maxMarks: 100, grade: "A", credits: 4, status: "PUBLISHED", publishedAt: "2026-07-20", createdAt: "2026-07-15", updatedAt: "2026-07-20" },
    { id: "RES_S2_02", studentId: "STU001", semester: 2, academicYear: "2026-27", subjectId: "SUB002", marks: 90, maxMarks: 100, grade: "O", credits: 4, status: "PUBLISHED", publishedAt: "2026-07-20", createdAt: "2026-07-15", updatedAt: "2026-07-20" },
    { id: "RES_S2_03", studentId: "STU001", semester: 2, academicYear: "2026-27", subjectId: "SUB003", marks: 78, maxMarks: 100, grade: "B+", credits: 3, status: "PUBLISHED", publishedAt: "2026-07-20", createdAt: "2026-07-15", updatedAt: "2026-07-20" },
    { id: "RES_S2_04", studentId: "STU001", semester: 2, academicYear: "2026-27", subjectId: "SUB004", marks: 76, maxMarks: 100, grade: "B+", credits: 3, status: "PUBLISHED", publishedAt: "2026-07-20", createdAt: "2026-07-15", updatedAt: "2026-07-20" },

    { id: "RES_S2_05", studentId: "STU002", semester: 2, academicYear: "2026-27", subjectId: "SUB001", marks: 92, maxMarks: 100, grade: "O", credits: 4, status: "UNPUBLISHED", publishedAt: null, createdAt: "2026-08-01", updatedAt: "2026-08-01" }
  ],

  // Holiday Calendar
  holidays: [
    { id: "HOL001", name: "Independence Day", date: "2026-08-15", type: "NATIONAL", description: "79th Independence Day Celebration of India.", academicYear: "2026-27", status: "ACTIVE", createdAt: "2026-07-01", updatedAt: "2026-07-01" },
    { id: "HOL002", name: "Raksha Bandhan", date: "2026-08-28", type: "FESTIVAL", description: "Holiday on account of Raksha Bandhan festival.", academicYear: "2026-27", status: "ACTIVE", createdAt: "2026-07-01", updatedAt: "2026-07-01" },
    { id: "HOL003", name: "Janmashtami", date: "2026-09-04", type: "FESTIVAL", description: "Shri Krishna Janmashtami celebration.", academicYear: "2026-27", status: "ACTIVE", createdAt: "2026-07-01", updatedAt: "2026-07-01" },
    { id: "HOL004", name: "Poornima Foundation Day", date: "2026-09-18", type: "COLLEGE", description: "Annual College Foundation Day Event & Holiday.", academicYear: "2026-27", status: "ACTIVE", createdAt: "2026-07-01", updatedAt: "2026-07-01" },
    { id: "HOL005", name: "Gandhi Jayanti", date: "2026-10-02", type: "NATIONAL", description: "Mahatma Gandhi Jayanti National Holiday.", academicYear: "2026-27", status: "ACTIVE", createdAt: "2026-07-01", updatedAt: "2026-07-01" },
    { id: "HOL006", name: "Diwali Vacation", date: "2026-11-08", type: "FESTIVAL", description: "Diwali Holidays for Students and Faculty.", academicYear: "2026-27", status: "ACTIVE", createdAt: "2026-07-01", updatedAt: "2026-07-01" }
  ],


  // Library Records (Batch 3)
  libraryRecords: [
    { id: "LIB-001", studentId: "STU001", bookName: "Java Programming", author: "Herbert Schildt", issueDate: "2026-08-10", dueDate: "2026-08-24", returnDate: null, returnStatus: "ISSUED", fineAmount: 0, fineStatus: "UNPAID" },
    { id: "LIB-002", studentId: "STU001", bookName: "Data Structures", author: "Mark Allen", issueDate: "2026-08-05", dueDate: "2026-08-10", returnDate: null, returnStatus: "OVERDUE", fineAmount: 20, fineStatus: "UNPAID" },
    { id: "LIB-003", studentId: "STU001", bookName: "Database Management Systems", author: "Raghu Ramakrishnan", issueDate: "2026-07-20", dueDate: "2026-08-03", returnDate: "2026-08-02", returnStatus: "RETURNED", fineAmount: 0, fineStatus: "PAID" },
    { id: "LIB-004", studentId: "STU002", bookName: "Computer Networks", author: "Andrew S. Tanenbaum", issueDate: "2026-08-01", dueDate: "2026-08-15", returnDate: null, returnStatus: "ISSUED", fineAmount: 0, fineStatus: "UNPAID" }
  ],

  // Exam Periods (Batch 3)
  examPeriods: [
    { id: "EXP001", name: "End Semester Examination", academicYear: "2026-27", semester: 2, startDate: "2026-08-10", endDate: "2026-08-28", status: "OPEN", createdAt: "2026-08-10", updatedAt: "2026-08-10" },
    { id: "EXP002", name: "Back Paper Examination", academicYear: "2026-27", semester: 1, startDate: "2026-07-01", endDate: "2026-07-15", status: "CLOSED", createdAt: "2026-07-01", updatedAt: "2026-07-01" }
  ],

  // Exam Forms (Batch 3)
  examForms: [
    {
      id: "EXF001",
      applicationNumber: "EXF-2025-0001",
      studentId: "STU001",
      examId: "EXP002",
      semester: 1,
      academicYear: "2025-26",
      selectedSubjectIds: ["SUB001", "SUB003", "SUB005"],
      status: "APPROVED",
      submittedAt: "2026-07-05",
      reviewedAt: "2026-07-08",
      reviewedBy: "USR_ADMIN_01",
      adminComment: "All criteria met. Hall ticket issued.",
      createdAt: "2026-07-05",
      updatedAt: "2026-07-08"
    }
  ],

  // Academic Features (Batch 4)
  hallTickets: [
    {
      id: "HT001",
      studentId: "STU001",
      examName: "Semester 2 End Examination",
      academicYear: "2026-27",
      semester: 2,
      examCenter: "Block A, PIET Campus",
      roomNumber: "Room 101",
      instructions: "1. Carry your physical ID card.\n2. Reach the examination center 30 minutes before time.\n3. Electronic devices are strictly prohibited.",
      subjects: [
        { code: "CS201", name: "Data Structures", date: "2026-08-20", time: "10:00 AM - 01:00 PM" },
        { code: "CS202", name: "Java Programming", date: "2026-08-22", time: "10:00 AM - 01:00 PM" },
        { code: "CS203", name: "Database Management Systems", date: "2026-08-24", time: "10:00 AM - 01:00 PM" }
      ],
      status: "AVAILABLE",
      publishedAt: "2026-08-05",
      updatedAt: "2026-08-05"
    },
    {
      id: "HT002",
      studentId: "STU002",
      examName: "Semester 2 End Examination",
      academicYear: "2026-27",
      semester: 2,
      examCenter: "Block A, PIET Campus",
      roomNumber: "Room 102",
      instructions: "1. Carry your physical ID card.\n2. Reach the examination center 30 minutes before time.\n3. Electronic devices are strictly prohibited.",
      subjects: [
        { code: "CS201", name: "Data Structures", date: "2026-08-20", time: "10:00 AM - 01:00 PM" },
        { code: "CS202", name: "Java Programming", date: "2026-08-22", time: "10:00 AM - 01:00 PM" }
      ],
      status: "NOT_AVAILABLE",
      publishedAt: null,
      updatedAt: null
    }
  ],

  midTermMarks: [
    { id: "MTM001", studentId: "STU001", facultyId: "FAC001", subjectId: "SUB002", examName: "Mid-Term 1", semester: 2, maxMarks: 20, obtainedMarks: 18, academicSession: "2026-27", status: "PUBLISHED", publishedAt: "2026-08-10", createdAt: "2026-08-10", updatedAt: "2026-08-10", auditHistory: [{ oldMarks: 17, newMarks: 18, changedBy: "Dr. Rajesh Kumar", changedAt: "10 Aug 2026, 09:30 AM" }] },
    { id: "MTM002", studentId: "STU001", facultyId: "FAC001", subjectId: "SUB003", examName: "Mid-Term 1", semester: 2, maxMarks: 20, obtainedMarks: 16, academicSession: "2026-27", status: "PUBLISHED", publishedAt: "2026-08-10", createdAt: "2026-08-10", updatedAt: "2026-08-10", auditHistory: [] },
    { id: "MTM003", studentId: "STU001", facultyId: "FAC001", subjectId: "SUB001", examName: "Mid-Term 1", semester: 2, maxMarks: 20, obtainedMarks: 17, academicSession: "2026-27", status: "PUBLISHED", publishedAt: "2026-08-11", createdAt: "2026-08-11", updatedAt: "2026-08-11", auditHistory: [] },
    { id: "MTM004", studentId: "STU002", facultyId: "FAC001", subjectId: "SUB002", examName: "Mid-Term 1", semester: 2, maxMarks: 20, obtainedMarks: 18, academicSession: "2026-27", status: "PUBLISHED", publishedAt: "2026-08-12", createdAt: "2026-08-12", updatedAt: "2026-08-12", auditHistory: [] },
    { id: "MTM005", studentId: "STU003", facultyId: "FAC001", subjectId: "SUB002", examName: "Mid-Term 1", semester: 2, maxMarks: 20, obtainedMarks: 15, academicSession: "2026-27", status: "PUBLISHED", publishedAt: "2026-08-12", createdAt: "2026-08-12", updatedAt: "2026-08-12", auditHistory: [] },
    { id: "MTM006", studentId: "STU004", facultyId: "FAC001", subjectId: "SUB002", examName: "Mid-Term 1", semester: 2, maxMarks: 20, obtainedMarks: 19, academicSession: "2026-27", status: "PUBLISHED", publishedAt: "2026-08-12", createdAt: "2026-08-12", updatedAt: "2026-08-12", auditHistory: [] }
  ]
};

window.MOCK_DATA = MOCK_DATA;
