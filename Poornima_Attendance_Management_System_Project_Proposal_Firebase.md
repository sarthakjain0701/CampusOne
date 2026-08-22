# Project Proposal — Poornima Attendance Management System (PAMS)

**Project Type:** B.Tech CSE Project  
**Institute:** Poornima Institute of Engineering and Technology, Jaipur  
**Academic Year:** 2025–26  
**Backend:** Firebase  
**Document Version:** 1.0

## 1. Introduction

The Poornima Attendance Management System (PAMS) is a digital attendance management application designed to replace manual attendance registers and spreadsheets. The system will centralize student, faculty, academic, and attendance information and provide role-based access for Admin, Faculty, and Student users.

Firebase will be used as the backend platform, primarily through **Firebase Authentication** for authentication and **Cloud Firestore** for application data. Firebase Storage, Cloud Messaging, Cloud Functions, and other Firebase services may be added when required.

## 2. Problem Statement

Manual attendance management can be time-consuming and may result in calculation errors, duplicate records, difficult historical searches, and additional work when preparing reports. Students may also lack convenient access to current attendance information.

PAMS will provide a centralized digital solution to make attendance management faster, more accurate, secure, and transparent.

## 3. Proposed Solution

The system will provide:

### Admin
- Manage students
- Manage faculty
- Manage departments
- Manage subjects
- Manage classes/sections
- Assign faculty to subjects/classes
- Monitor attendance
- Generate reports

### Faculty
- Secure login
- View assigned classes and subjects
- Mark attendance
- Edit authorized attendance
- View attendance history
- Generate reports

### Student
- Secure login
- View profile
- View overall attendance
- View subject-wise attendance
- View attendance history
- View reports
- Receive low-attendance warnings

## 4. Objectives

1. Digitize attendance management.
2. Reduce manual errors.
3. Provide secure role-based access.
4. Allow faculty to mark attendance efficiently.
5. Allow students to monitor attendance.
6. Automatically calculate attendance percentages.
7. Maintain organized attendance history.
8. Prevent duplicate attendance records.
9. Generate attendance reports.
10. Provide a scalable Firebase backend.

## 5. Scope

### In Scope

- Firebase Authentication
- Role-based access
- Student management
- Faculty management
- Department management
- Subject management
- Class/section management
- Faculty assignments
- Attendance marking
- Attendance editing
- Attendance history
- Attendance percentage
- Reports
- Low-attendance warnings
- Firebase Security Rules

### Out of Scope for Initial Version

- Face recognition
- Fingerprint/biometric attendance
- GPS attendance
- AI attendance prediction
- Parent portal
- Advanced AI analytics
- Automatic classroom detection

These may be added in future versions.

## 6. Target Users

| User | Responsibilities |
|---|---|
| Admin | Manage users, academic data, assignments, attendance and reports |
| Faculty | Manage attendance for assigned classes and subjects |
| Student | View personal attendance and reports |

## 7. Major Modules

### Authentication
- Login
- Logout
- Password reset where required
- User identity
- Role identification

### Admin
- Student CRUD
- Faculty CRUD
- Department management
- Subject management
- Class management
- Faculty assignment
- Attendance monitoring
- Reports

### Faculty
- Dashboard
- Assigned classes
- Assigned subjects
- Attendance marking
- Attendance editing
- Attendance history
- Reports

### Student
- Dashboard
- Profile
- Overall attendance
- Subject-wise attendance
- Attendance history
- Reports
- Warnings

### Attendance
- Class selection
- Subject selection
- Date/session selection
- Present/Absent marking
- Validation
- Duplicate prevention
- Firestore storage
- Percentage calculation

### Reports
- Student report
- Subject report
- Class report
- Department report
- Date-wise report
- Low-attendance report

## 8. Firebase Technology Stack

| Component | Technology |
|---|---|
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| File Storage | Firebase Storage, if required |
| Notifications | Firebase Cloud Messaging, if required |
| Automation | Cloud Functions, if required |
| Security | Firebase Authentication + Firestore Security Rules |
| Version Control | Git / GitHub |
| Documentation | Markdown / PDF |

## 9. Firebase Architecture

```text
                    PAMS APPLICATION
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
     Firebase Auth   Cloud Firestore   Storage
            |              |              |
            |              +-- users
            |              +-- students
            |              +-- faculty
            |              +-- departments
            |              +-- subjects
            |              +-- classes
            |              +-- assignments
            |              +-- attendance
            |              +-- notifications
            |
            +-- Authentication / Identity
```

## 10. Firestore Collections

```text
users
students
faculty
departments
subjects
classes
assignments
attendance
notifications
```

### Example Attendance Document

```json
{
  "studentId": "STU001",
  "facultyId": "FAC001",
  "subjectId": "SUB001",
  "classId": "CSE-A-2026",
  "assignmentId": "ASSIGN001",
  "date": "2026-08-13",
  "status": "PRESENT",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 11. Attendance Calculation

```text
Attendance Percentage =
(Present Classes / Total Classes) × 100
```

Example:

```text
Present = 28
Total = 30

Attendance = 93.33%
```

A configurable threshold can identify low attendance, for example:

```text
>= 75% → Normal
< 75%  → Warning
```

## 12. Attendance Workflow

```text
Faculty Login
      ↓
Firebase Authentication
      ↓
Faculty Dashboard
      ↓
Select Assigned Class
      ↓
Select Assigned Subject
      ↓
Select Date/Session
      ↓
Load Students
      ↓
Mark Present / Absent
      ↓
Validate
      ↓
Prevent Duplicate
      ↓
Save to Firestore
      ↓
Calculate Attendance
      ↓
Student Dashboard Updated
```

## 13. Security

The system will use:

- Firebase Authentication
- Firestore Security Rules
- Role-based authorization
- Protected student records
- Protected faculty records
- Faculty assignment validation
- Student data isolation
- Input validation
- Restricted attendance modification

Security will be enforced at the Firebase data layer and not only through the user interface.

## 14. Development Methodology

### Phase 1 — Requirements
Proposal, SRS, scope, objectives and requirements.

### Phase 2 — System Design
ER, Use Case, DFD, Activity, Class, Sequence and Architecture diagrams.

### Phase 3 — Firebase Architecture
Firestore collections, document structures, relationships, queries, indexes and security design.

### Phase 4 — Firebase Setup
Create Firebase project, enable Authentication, create Firestore and configure required services.

### Phase 5 — Authentication
Login, logout, profiles and role management.

### Phase 6 — Admin Module
Student, faculty, department, subject, class and assignment management.

### Phase 7 — Faculty Module
Assigned classes, subjects, attendance and reports.

### Phase 8 — Student Module
Dashboard, profile, attendance and reports.

### Phase 9 — Attendance
Marking, validation, duplicate prevention and history.

### Phase 10 — Analytics
Attendance percentages and low-attendance identification.

### Phase 11 — Reports & Notifications
Reports and required notifications.

### Phase 12 — Security
Firestore Security Rules and authorization testing.

### Phase 13 — Testing
Functional, integration, system and security testing.

### Phase 14 — UI/UX
Final interface improvements, validation, tables, charts and dashboards.

### Phase 15 — Deployment
Production configuration, security verification and deployment.

### Phase 16 — Final Documentation
Final report, README, user manual, deployment guide, presentation and viva preparation.

## 15. Proposed Timeline

| Phase | Activity | Estimated Duration |
|---|---|---:|
| 1 | Requirements & SRS | 1–2 days |
| 2 | Design & Diagrams | 1–2 days |
| 3 | Firebase Architecture | 1–2 days |
| 4 | Firebase Setup | 1 day |
| 5 | Authentication | 1 day |
| 6 | Admin Module | 2–3 days |
| 7 | Faculty Module | 2 days |
| 8 | Student Module | 1–2 days |
| 9 | Attendance | 2 days |
| 10 | Analytics | 1 day |
| 11 | Reports & Notifications | 1–2 days |
| 12 | Security | 1–2 days |
| 13 | Testing | 2 days |
| 14 | UI/UX | 1–2 days |
| 15 | Deployment | 1 day |
| 16 | Documentation | 1–2 days |

## 16. Expected Outcomes

The completed system is expected to:

- Digitize attendance management.
- Reduce manual work.
- Reduce calculation errors.
- Centralize academic and attendance data.
- Allow efficient attendance marking.
- Allow students to monitor attendance.
- Automatically calculate percentages.
- Prevent duplicate attendance.
- Generate reports.
- Improve transparency.
- Provide secure role-based access.

## 17. Advantages

- Time saving
- Improved accuracy
- Centralized cloud data
- Better transparency
- Secure access
- Scalable architecture
- Easy future expansion

## 18. Project Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect data entry | Medium | Input validation |
| Duplicate attendance | High | Deterministic attendance ID and validation |
| Unauthorized access | High | Authentication and Security Rules |
| Firebase configuration error | High | Testing and secure rules |
| Development delay | Medium | Phase-wise development |
| Network failure | Medium | Error handling |
| Requirement changes | Medium | Maintain SRS |

## 19. Future Enhancements

1. QR-code attendance.
2. Face-recognition attendance.
3. Biometric integration.
4. Mobile application.
5. Parent portal.
6. Email notifications.
7. Push notifications.
8. Advanced analytics.
9. AI-based attendance prediction.
10. ERP integration.

## 20. Deliverables

### Documentation
- Project Proposal
- SRS
- ER Diagram
- Use Case Diagram
- DFD Level 0 and Level 1
- Activity Diagrams
- Class Diagram
- Sequence Diagrams
- System Architecture
- Firebase Architecture
- Firestore Database Design
- Data Dictionary
- Security Rules Documentation
- Test Plan
- Test Cases
- Deployment Guide
- User Manual
- Final Project Report

### Software
- Complete source code
- Firebase configuration
- Firestore structure
- Security Rules
- Application build
- README

### Presentation
- Project presentation
- Demonstration
- Viva preparation

## 21. Success Criteria

The project will be successful when:

- All three user roles can authenticate.
- Correct role-based dashboards are displayed.
- Admin can manage required academic data.
- Faculty can access authorized assignments.
- Faculty can mark attendance.
- Duplicate attendance is prevented.
- Attendance is correctly stored in Firestore.
- Attendance percentage is calculated correctly.
- Students can view their own attendance.
- Reports work correctly.
- Unauthorized access is blocked.
- Firebase Security Rules work correctly.
- The application passes functional and security testing.

## 22. Conclusion

The Poornima Attendance Management System (PAMS) is proposed as a centralized Firebase-based solution for managing student attendance.

Firebase Authentication will provide user identity management, while Cloud Firestore will provide the primary application data store. Firebase Security Rules will protect data and enforce role-based access.

The project will be developed through clearly defined phases from requirements and system design through Firebase setup, application development, security, testing, deployment and final documentation.

The architecture also provides a foundation for future features such as QR attendance, biometric attendance, mobile applications, notifications and advanced analytics.

## 23. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Project Student | __________________ | __________ | __________ |
| Project Guide | __________________ | __________ | __________ |
| HOD / Coordinator | __________________ | __________ | __________ |

## 24. Student Information

```text
Student Name      : ______________________________
Roll Number       : ______________________________
Course            : B.Tech CSE
Semester          : ______________________________
Department        : Computer Science & Engineering
Institute         : Poornima Institute of Engineering
                    and Technology, Jaipur
Project Guide     : ______________________________
Academic Year     : 2025–26
Submission Date   : ______________________________
```

---

**END OF PROJECT PROPOSAL**
