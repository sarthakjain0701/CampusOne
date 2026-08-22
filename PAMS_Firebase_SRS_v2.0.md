# Software Requirements Specification (SRS)

# Poornima Attendance Management System (PAMS)

**Version:** 2.0  
**Architecture:** Firebase-based  
**Database:** Cloud Firestore  
**Authentication:** Firebase Authentication  
**Primary Users:** Admin, Faculty, Student  
**Institute:** Poornima Institute of Engineering and Technology, Jaipur  
**Course:** B.Tech Computer Science & Engineering  
**Academic Year:** 2025–26

---

## 1. Introduction

### 1.1 Purpose

The purpose of the **Poornima Attendance Management System (PAMS)** is to provide a centralized digital system for managing student attendance.

The system will replace manual attendance registers and spreadsheet-based processes with a secure Firebase-based application.

The system will allow:

- Administrators to manage academic information.
- Faculty members to mark and manage attendance.
- Students to view their attendance.
- The system to calculate attendance percentages automatically.
- Authorized users to generate attendance reports.
- Firebase Authentication and Firestore Security Rules to protect application data.

### 1.2 Project Scope

PAMS will manage the complete attendance lifecycle:

```text
User Account
    ↓
Authentication
    ↓
Role Identification
    ↓
Dashboard
    ↓
Academic Data
    ↓
Faculty Assignment
    ↓
Attendance Marking
    ↓
Attendance Storage
    ↓
Attendance Calculation
    ↓
Reports
    ↓
Notifications / Warnings
```

---

# 2. Overall Description

## 2.1 Product Perspective

PAMS will be a cloud-connected application using Firebase as its backend.

```text
                    PAMS APPLICATION
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
 Firebase Auth      Cloud Firestore    Firebase Storage
          |                |                |
          |                +-- users
          |                +-- students
          |                +-- faculty
          |                +-- departments
          |                +-- subjects
          |                +-- classes
          |                +-- assignments
          |                +-- attendance
          |                +-- notifications
          |
          +-- User Authentication
```

## 2.2 Product Functions

The system shall provide:

1. User authentication.
2. Role-based access.
3. Admin dashboard.
4. Faculty dashboard.
5. Student dashboard.
6. Student management.
7. Faculty management.
8. Department management.
9. Subject management.
10. Class management.
11. Faculty-subject-class assignment.
12. Attendance marking.
13. Attendance editing.
14. Attendance history.
15. Attendance calculation.
16. Attendance reports.
17. Low-attendance identification.
18. Notifications where enabled.
19. Firebase-based security.
20. Data validation.
21. Duplicate attendance prevention.

---

# 3. User Roles

## 3.1 Admin

Admin has the highest application-level privileges.

Admin can:

- Manage students.
- Manage faculty.
- Manage departments.
- Manage subjects.
- Manage classes.
- Assign faculty.
- View attendance.
- Generate reports.
- Manage user status.

## 3.2 Faculty

Faculty can:

- Login.
- View assigned subjects.
- View assigned classes.
- View students in assigned classes.
- Mark attendance.
- Edit authorized attendance.
- View attendance history.
- Generate permitted reports.

Faculty must not access unrelated classes or subjects.

## 3.3 Student

Students can:

- Login.
- View their profile.
- View their attendance.
- View subject-wise attendance.
- View attendance history.
- View attendance percentage.
- View permitted reports.
- Receive attendance warnings.

Students must not modify attendance.

---

# 4. Functional Requirements

## FR-01 Authentication

The system shall provide secure authentication using Firebase Authentication.

Requirements:

- User shall be able to login.
- User shall be able to logout.
- Invalid credentials shall be rejected.
- Authenticated users shall receive a Firebase UID.
- The application shall identify the user's role.
- Unauthorized users shall not access protected application functionality.

## FR-02 User Profile

The system shall maintain application profile information for authenticated users.

Example:

```text
users/{uid}
```

Fields:

```text
name
email
role
phone
active
createdAt
updatedAt
```

## FR-03 Admin Dashboard

The Admin Dashboard shall provide access to authorized management functions.

It may display:

```text
Total Students
Total Faculty
Total Departments
Total Subjects
Total Classes
Today's Attendance
Low Attendance Students
```

## FR-04 Student Management

Admin shall be able to:

- Add students.
- View students.
- Search students.
- Update students.
- Activate/deactivate students.
- Assign students to classes.
- Assign department.
- Assign semester.
- Assign section.

Student information:

```text
studentId
userId
rollNo
name
email
phone
departmentId
classId
semester
section
active
createdAt
updatedAt
```

## FR-05 Faculty Management

Admin shall be able to:

- Add faculty.
- View faculty.
- Search faculty.
- Update faculty.
- Activate/deactivate faculty.
- Assign faculty to departments.

Faculty information:

```text
facultyId
userId
employeeId
name
email
phone
departmentId
active
createdAt
updatedAt
```

## FR-06 Department Management

Admin shall be able to:

- Add department.
- Update department.
- View department.
- Activate/deactivate department.

Example:

```text
departmentId
name
code
description
active
createdAt
updatedAt
```

## FR-07 Subject Management

Admin shall be able to:

- Add subject.
- Update subject.
- View subject.
- Assign department.
- Assign semester.
- Set credits.
- Activate/deactivate subject.

Example:

```text
subjectId
code
name
departmentId
semester
credits
active
createdAt
updatedAt
```

## FR-08 Class Management

Admin shall be able to manage:

- Class.
- Section.
- Semester.
- Department.
- Academic year.

Example:

```text
classId
name
departmentId
semester
section
academicYear
active
createdAt
updatedAt
```

## FR-09 Faculty Assignment

Admin shall be able to assign:

```text
Faculty
   +
Subject
   +
Class
```

Example:

```text
assignmentId
facultyId
subjectId
classId
departmentId
semester
academicYear
active
createdAt
updatedAt
```

This determines which subjects/classes a faculty member is authorized to manage.

## FR-10 Attendance Marking

Authorized faculty shall be able to:

1. Select class.
2. Select subject.
3. Select date/session.
4. Load students.
5. Mark Present/Absent.
6. Validate attendance.
7. Save attendance.

Status values:

```text
PRESENT
ABSENT
```

## FR-11 Attendance Storage

Attendance shall be stored in Cloud Firestore.

Example:

```text
attendance/{attendanceId}
```

Fields:

```text
studentId
facultyId
subjectId
classId
assignmentId
date
status
createdAt
updatedAt
```

## FR-12 Duplicate Attendance Prevention

The application shall prevent duplicate attendance for the same:

```text
Student
+
Class
+
Subject
+
Date/Session
```

A deterministic document ID can be used:

```text
{classId}_{subjectId}_{date}_{studentId}
```

If multiple periods/sessions per day are introduced, the uniqueness key shall also include a session/period identifier.

## FR-13 Attendance Editing

Authorized faculty shall be able to modify attendance only for records they are permitted to manage.

Modified records shall update:

```text
updatedAt
```

Where audit requirements are introduced, an attendance audit collection may be added.

## FR-14 Attendance History

The system shall provide attendance history based on authorized access.

### Faculty

Can view attendance for assigned classes/subjects.

### Student

Can view their own attendance.

### Admin

Can view authorized institutional attendance information.

## FR-15 Attendance Calculation

The system shall calculate:

```text
Attendance Percentage =
(Present Classes / Total Classes) × 100
```

Example:

```text
Present = 28
Total = 30

Percentage = 93.33%
```

The system shall support subject-wise and overall attendance calculations.

## FR-16 Low Attendance Detection

The system shall identify students whose attendance is below the configured threshold.

Example:

```text
Threshold = 75%

Student Attendance = 71%

Status = LOW ATTENDANCE
```

The threshold should be configurable.

## FR-17 Student Dashboard

The Student Dashboard shall display:

```text
Student Profile
Overall Attendance
Subject Attendance
Attendance History
Attendance Reports
Low Attendance Warning
Notifications
```

## FR-18 Faculty Dashboard

The Faculty Dashboard shall display:

```text
Faculty Profile
Assigned Classes
Assigned Subjects
Today's Attendance
Attendance History
Reports
```

## FR-19 Reports

The system shall support:

### Student Report

```text
Student
Subject
Total Classes
Present
Absent
Percentage
```

### Subject Report

```text
Subject
Class
Total Classes
Attendance Statistics
```

### Class Report

```text
Class
Students
Attendance Percentage
```

### Date-wise Report

```text
Date
Class
Subject
Student
Status
```

### Low Attendance Report

```text
Student
Roll Number
Subject
Attendance %
```

## FR-20 Notifications

If notification functionality is enabled, the system may notify users about:

- Low attendance.
- Attendance updates.
- Administrative announcements.
- Important attendance information.

Firebase Cloud Messaging may be used for push notifications.

## FR-21 Search

Authorized users shall be able to search relevant records.

Examples:

```text
Student:
Roll Number
Name
Email

Faculty:
Employee ID
Name

Subject:
Subject Code
Name
```

## FR-22 Filtering

The application shall support appropriate filters:

```text
Department
Semester
Section
Class
Subject
Date
Faculty
Attendance Status
```

## FR-23 Data Validation

The application shall validate:

- Required fields.
- Email format.
- Phone format.
- Roll number.
- Employee ID.
- Subject code.
- Attendance status.
- Valid references.
- Duplicate records.

---

# 5. Non-Functional Requirements

## NFR-01 Security

The system shall use:

- Firebase Authentication.
- Firestore Security Rules.
- Role-based authorization.
- Data validation.
- Protected user data.

## NFR-02 Authorization

Users shall only access resources allowed for their role.

```text
ADMIN
 ↓
Management Access

FACULTY
 ↓
Assigned Academic/Attendance Access

STUDENT
 ↓
Own Attendance Access
```

## NFR-03 Database Security

Firestore rules shall deny unauthorized access.

Production shall not use unrestricted rules such as:

```text
allow read, write: if true;
```

## NFR-04 Performance

The application should:

- Load dashboards efficiently.
- Use appropriate Firestore queries.
- Avoid unnecessary reads.
- Use pagination where appropriate.
- Avoid loading entire collections unnecessarily.
- Use indexes for required compound queries.

## NFR-05 Scalability

The system should support expansion in:

```text
Students
Faculty
Departments
Subjects
Classes
Attendance Records
```

## NFR-06 Availability

The application should remain usable whenever Firebase services and the network are available.

Appropriate error handling shall be provided for:

- Network failure.
- Firebase service errors.
- Authentication failure.
- Permission denied.
- Query failure.

## NFR-07 Usability

The UI shall:

- Be simple.
- Be consistent.
- Use readable labels.
- Provide clear error messages.
- Provide confirmation messages.
- Minimize unnecessary steps for attendance marking.

## NFR-08 Maintainability

The project shall use:

- Modular architecture.
- Separate UI/business/data responsibilities.
- Reusable components.
- Meaningful naming.
- Centralized Firebase configuration.
- Documented Firestore structure.

## NFR-09 Reliability

The system shall:

- Validate data before saving.
- Prevent duplicate attendance.
- Handle failed Firebase operations.
- Avoid accidental destructive operations.
- Provide confirmation dialogs.

## NFR-10 Data Integrity

The system shall maintain consistency between:

```text
Student
Faculty
Department
Subject
Class
Assignment
Attendance
```

Invalid references shall not be accepted.

## NFR-11 Privacy

Students shall only be able to access their permitted information.

Faculty shall only access information related to authorized assignments.

Administrative access shall be restricted to authorized administrators.

---

# 6. Firebase Requirements

## 6.1 Firebase Authentication

Required for:

```text
Login
Logout
Password Reset
User Identity
UID
Authentication State
```

## 6.2 Cloud Firestore

Cloud Firestore shall be the primary application database.

Proposed collections:

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

## 6.3 Firebase Security Rules

Security Rules shall control:

```text
Read
Create
Update
Delete
```

based on authentication, role, ownership and assignment.

## 6.4 Firebase Storage

Firebase Storage is optional.

It may store:

```text
Profile Images
Documents
Other Approved Files
```

Storage access shall be protected.

## 6.5 Firebase Cloud Messaging

Optional.

May be used for:

```text
Low Attendance Alert
Administrative Notification
Attendance Update
```

## 6.6 Cloud Functions

Optional.

Potential uses:

```text
Automatic notifications
Scheduled processing
Attendance summaries
Administrative automation
```

---

# 7. Firestore Data Requirements

## 7.1 users

```text
users/{uid}
```

| Field | Type | Required |
|---|---|---|
| name | String | Yes |
| email | String | Yes |
| role | String | Yes |
| phone | String | No |
| active | Boolean | Yes |
| createdAt | Timestamp | Yes |
| updatedAt | Timestamp | Yes |

Roles:

```text
ADMIN
FACULTY
STUDENT
```

## 7.2 students

```text
students/{studentId}
```

| Field | Type | Required |
|---|---|---|
| userId | String | Yes |
| rollNo | String | Yes |
| name | String | Yes |
| email | String | Yes |
| phone | String | No |
| departmentId | String | Yes |
| classId | String | Yes |
| semester | Number | Yes |
| section | String | Yes |
| active | Boolean | Yes |
| createdAt | Timestamp | Yes |
| updatedAt | Timestamp | Yes |

## 7.3 faculty

```text
faculty/{facultyId}
```

| Field | Type | Required |
|---|---|---|
| userId | String | Yes |
| employeeId | String | Yes |
| name | String | Yes |
| email | String | Yes |
| phone | String | No |
| departmentId | String | Yes |
| active | Boolean | Yes |
| createdAt | Timestamp | Yes |
| updatedAt | Timestamp | Yes |

## 7.4 departments

```text
departments/{departmentId}
```

Fields:

```text
name
code
description
active
createdAt
updatedAt
```

## 7.5 subjects

```text
subjects/{subjectId}
```

Fields:

```text
code
name
departmentId
semester
credits
active
createdAt
updatedAt
```

## 7.6 classes

```text
classes/{classId}
```

Fields:

```text
name
departmentId
semester
section
academicYear
active
createdAt
updatedAt
```

## 7.7 assignments

```text
assignments/{assignmentId}
```

Fields:

```text
facultyId
subjectId
classId
departmentId
semester
academicYear
active
createdAt
updatedAt
```

## 7.8 attendance

```text
attendance/{attendanceId}
```

Fields:

```text
studentId
facultyId
subjectId
classId
assignmentId
date
status
createdAt
updatedAt
```

## 7.9 notifications

```text
notifications/{notificationId}
```

Fields:

```text
userId
title
message
type
read
createdAt
```

---

# 8. Firestore Query Requirements

The application shall support queries such as:

### Faculty Assignments

```text
facultyId == currentFacultyId
AND active == true
```

### Student Attendance

```text
studentId == currentStudentId
```

### Subject Attendance

```text
studentId == currentStudentId
AND subjectId == selectedSubject
```

### Class Attendance

```text
classId == selectedClass
AND subjectId == selectedSubject
AND date == selectedDate
```

Compound indexes shall be created only when required by actual application queries.

---

# 9. Security Requirements

## 9.1 Authentication

Unauthenticated users shall not access protected application data.

Conceptually:

```text
request.auth != null
```

## 9.2 Admin Authorization

Admin operations shall require administrator authorization.

## 9.3 Faculty Authorization

Faculty shall only access authorized classes, subjects and attendance records.

## 9.4 Student Authorization

Students shall only access their own protected information.

## 9.5 Field Validation

Security Rules shall validate required fields and protect fields that users must not modify.

---

# 10. Business Rules

### BR-01
Every application user shall have exactly one primary application role.

### BR-02
Inactive users shall not be allowed to perform normal application operations.

### BR-03
A faculty member can mark attendance only for authorized assignments.

### BR-04
A student cannot mark or modify attendance.

### BR-05
Duplicate attendance for the same student/session shall not be permitted.

### BR-06
Attendance status shall be restricted to:

```text
PRESENT
ABSENT
```

### BR-07
Attendance percentage shall be calculated from valid attendance records.

### BR-08
The low-attendance threshold shall be configurable.

### BR-09
Referenced academic records should generally be deactivated rather than hard-deleted.

### BR-10
Timestamps should use Firestore Timestamp values where practical.

---

# 11. Use Case Requirements

## Admin Use Cases

```text
Login
Manage Students
Manage Faculty
Manage Departments
Manage Subjects
Manage Classes
Assign Faculty
View Attendance
Generate Reports
Manage User Status
Logout
```

## Faculty Use Cases

```text
Login
View Profile
View Assigned Classes
View Assigned Subjects
View Students
Mark Attendance
Edit Authorized Attendance
View Attendance History
Generate Reports
Logout
```

## Student Use Cases

```text
Login
View Profile
View Attendance
View Subject Attendance
View Attendance History
View Percentage
View Reports
View Notifications
Logout
```

---

# 12. System Workflow

```text
                         START
                           |
                           v
                     Login Screen
                           |
                           v
                Firebase Authentication
                           |
                  +--------+--------+
                  |        |        |
                  v        v        v
                ADMIN    FACULTY  STUDENT
                  |        |        |
                  v        v        v
              Admin DB  Assignment Own Data
               Manage     Access     Access
                  |        |        |
                  +--------+--------+
                           |
                           v
                    Attendance Data
                           |
                           v
                    Firestore
                           |
                           v
                  Calculation/Reports
                           |
                           v
                          END
```

---

# 13. Data Flow Requirements

## Level 0

```text
              +----------------+
              |     ADMIN      |
              +-------+--------+
                      |
                      v
+---------+      +----------+      +----------+
| STUDENT | ---> |   PAMS   | <--- | FACULTY |
+---------+      +----+-----+      +----------+
                      |
                      v
                +-----------+
                | Firebase  |
                | Services  |
                +-----------+
```

## Level 1

```text
User
 ↓
Authentication
 ↓
Role Management
 ↓
Dashboard
 ↓
Academic Management
 ↓
Assignment Management
 ↓
Attendance Management
 ↓
Firestore
 ↓
Reports
```

---

# 14. System Architecture Requirements

```text
+------------------------------------------------+
|                 PRESENTATION                   |
|       Application UI / Dashboards / Forms      |
+-------------------------+----------------------+
                          |
                          v
+------------------------------------------------+
|             APPLICATION LOGIC                 |
| Authentication | Validation | Attendance       |
| Calculations   | Reports    | Role Management  |
+-------------------------+----------------------+
                          |
                          v
+------------------------------------------------+
|                    FIREBASE                    |
|                                                |
| Firebase Authentication                        |
| Cloud Firestore                                |
| Firebase Storage (Optional)                    |
| FCM (Optional)                                 |
| Cloud Functions (Optional)                     |
| Security Rules                                 |
+------------------------------------------------+
```

---

# 15. Attendance Module Requirements

## 15.1 Attendance Screen

The attendance screen shall contain:

```text
Class
Subject
Date/Session
Student List
Present/Absent Controls
Save Button
Reset/Cancel
```

## 15.2 Attendance Validation

Before saving:

```text
Class selected?
Subject selected?
Date/session valid?
Faculty authorized?
Students loaded?
Status valid?
Duplicate record?
```

## 15.3 Attendance Save

Only validated records shall be written to Firestore.

---

# 16. Dashboard Requirements

## Admin Dashboard

```text
+--------------------------------------+
|          ADMIN DASHBOARD             |
+--------------------------------------+
| Students | Faculty | Classes        |
| Subjects | Attendance | Reports     |
+--------------------------------------+
| Attendance Overview                  |
+--------------------------------------+
| Low Attendance Students              |
+--------------------------------------+
```

## Faculty Dashboard

```text
+--------------------------------------+
|         FACULTY DASHBOARD            |
+--------------------------------------+
| My Classes | My Subjects             |
+--------------------------------------+
| Mark Attendance                      |
+--------------------------------------+
| Attendance History                   |
+--------------------------------------+
```

## Student Dashboard

```text
+--------------------------------------+
|         STUDENT DASHBOARD            |
+--------------------------------------+
| Overall Attendance: 87%              |
+--------------------------------------+
| Subject        Attendance            |
| Java              92%                |
| DSA               86%                |
| Mathematics       78%                |
+--------------------------------------+
```

---

# 17. Error Handling Requirements

The application shall provide understandable messages for:

```text
Invalid Login
Network Error
Permission Denied
Record Not Found
Duplicate Attendance
Invalid Input
Firebase Error
Session Expired
Unauthorized Access
```

Example:

```text
"Unable to save attendance. Please check your connection and try again."
```

---

# 18. Audit and Tracking Requirements

The initial system shall maintain:

```text
createdAt
updatedAt
```

for relevant records.

A future audit system may record:

```text
Who changed attendance
When it was changed
Previous status
New status
Reason
```

---

# 19. Backup and Recovery

Because the application uses a cloud backend, the project shall include a documented backup/recovery strategy appropriate to the chosen Firebase/Google Cloud configuration.

Development data shall be separated from production data.

Important configuration files and Security Rules shall be maintained in version control where safe.

Secrets and service-account credentials shall not be committed to public repositories.

---

# 20. Performance Requirements

The system should:

- Avoid unnecessary Firestore reads.
- Retrieve only required fields/data where the SDK and architecture allow.
- Use efficient queries.
- Use pagination for large lists.
- Avoid repeatedly downloading the same data.
- Use indexes for required compound queries.
- Avoid unnecessary real-time listeners.

Attendance marking should require minimal user interaction.

---

# 21. Compatibility Requirements

The application shall be tested on the target operating system/platform selected for implementation.

If the project is implemented as a Java desktop application, the final Java/Firebase integration must be tested on the supported Java runtime and operating systems.

If the project is implemented as a web application, supported browsers shall be defined during implementation.

---

# 22. Testing Requirements

## 22.1 Authentication Testing

- Valid login.
- Invalid login.
- Logout.
- Password reset.
- Unauthorized access.

## 22.2 Admin Testing

- Add student.
- Update student.
- Deactivate student.
- Add faculty.
- Update faculty.
- Create subject.
- Create class.
- Assign faculty.

## 22.3 Faculty Testing

- Login.
- View assignment.
- Load students.
- Mark attendance.
- Edit attendance.
- Duplicate attendance.
- Unauthorized class access.

## 22.4 Student Testing

- Login.
- View profile.
- View attendance.
- View percentage.
- View history.
- Attempt unauthorized access.

## 22.5 Firebase Testing

- Authentication.
- Firestore reads.
- Firestore writes.
- Security Rules.
- Queries.
- Indexes.
- Error handling.

## 22.6 Security Testing

Verify:

```text
Unauthenticated user → DENIED
Admin → Authorized management
Faculty → Assigned data only
Student → Own data only
```

Firebase recommends using the Local Emulator Suite for testing Security Rules before production deployment. 

---

# 23. Deployment Requirements

Before deployment:

```text
Development Testing
        ↓
Security Rule Testing
        ↓
Production Configuration
        ↓
Remove Test Data
        ↓
Verify Authentication
        ↓
Verify Database
        ↓
Verify Rules
        ↓
Build Application
        ↓
Deploy
        ↓
Final Verification
```

Firebase CLI configuration and rules should be version-controlled with the project where appropriate.

---

# 24. Project Development Phases

## Phase 0 — Planning

- Project idea
- Scope
- Technology decision
- Team planning

## Phase 1 — Requirements

- Project Proposal
- SRS
- Functional requirements
- Non-functional requirements

## Phase 2 — System Design

- ER Diagram
- Use Case Diagram
- DFD
- Activity Diagram
- Class Diagram
- Sequence Diagram
- Architecture

## Phase 3 — Firebase Architecture

- Firebase services
- Firestore data model
- Collections
- Documents
- Relationships
- Query design
- Security design

## Phase 4 — Firebase Setup

- Firebase project
- Authentication
- Firestore
- Required services
- Application configuration

## Phase 5 — Application Setup

- Project structure
- Firebase integration
- Configuration
- Base UI

## Phase 6 — Authentication

- Login
- Logout
- Role handling
- Session handling

## Phase 7 — Admin Module

- Students
- Faculty
- Departments
- Subjects
- Classes
- Assignments

## Phase 8 — Faculty Module

- Faculty dashboard
- Assignments
- Attendance

## Phase 9 — Student Module

- Student dashboard
- Attendance
- Reports

## Phase 10 — Attendance

- Marking
- Editing
- Validation
- Duplicate prevention
- History

## Phase 11 — Analytics

- Percentage
- Subject statistics
- Low attendance

## Phase 12 — Reports and Notifications

- Reports
- Notifications

## Phase 13 — Security

- Security Rules
- Authorization
- Data validation

## Phase 14 — Testing

- Functional
- Integration
- System
- Security
- User acceptance

## Phase 15 — Deployment

- Production setup
- Deployment
- Final verification

## Phase 16 — Documentation

- Final report
- README
- User manual
- Presentation
- Viva

---

# 25. Project Constraints

- Internet connectivity may be required depending on application architecture and offline support.
- Firebase quotas and pricing limits must be considered.
- Incorrect Security Rules can expose data.
- Incorrect data modeling can increase Firestore reads and costs.
- Advanced biometric/AI functionality is outside the initial scope.
- Firebase configuration must match the final client application architecture.

---

# 26. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect data entry | Medium | Validation |
| Duplicate attendance | High | Deterministic IDs and validation |
| Unauthorized access | High | Authentication + Security Rules |
| Incorrect Firebase rules | High | Emulator testing |
| Excessive Firestore reads | Medium | Efficient queries |
| Network failure | Medium | Error handling |
| Development delay | Medium | Phase-wise development |
| Requirement changes | Medium | SRS change control |
| Data loss | High | Backup/recovery strategy |

---

# 27. Future Enhancements

Possible future versions may include:

1. QR-code attendance.
2. Face-recognition attendance.
3. Fingerprint/biometric integration.
4. Android/iOS application.
5. Parent portal.
6. Email notifications.
7. Push notifications.
8. Advanced analytics.
9. AI-based attendance prediction.
10. ERP integration.
11. Automated attendance summaries.
12. Advanced dashboards.

---

# 28. Acceptance Criteria

The project shall be considered acceptable when:

- Admin can authenticate.
- Faculty can authenticate.
- Students can authenticate.
- Correct dashboards appear for each role.
- Admin can manage required academic data.
- Faculty can view authorized assignments.
- Faculty can mark attendance.
- Duplicate attendance is prevented.
- Attendance is correctly stored in Firestore.
- Attendance percentage is correctly calculated.
- Students can view their attendance.
- Reports work correctly.
- Unauthorized access is blocked.
- Security Rules pass testing.
- Application errors are handled.
- Core functionality passes system testing.

---

# 29. Deliverables

## Documentation

```text
Project Proposal
SRS
ER Diagram
Use Case Diagram
DFD Level 0
DFD Level 1
Activity Diagrams
Class Diagram
Sequence Diagrams
System Architecture
Firebase Architecture
Firestore Database Design
Data Dictionary
Security Rules Documentation
Test Plan
Test Cases
Deployment Guide
User Manual
Final Project Report
```

## Software

```text
Source Code
Firebase Configuration
Firestore Structure
Security Rules
Required Index Configuration
Application Build
README
```

## Presentation

```text
Project Presentation
System Demonstration
Viva Preparation
```

---

# 30. Requirements Traceability Matrix

| Requirement Area | Module | Firebase Component | Test Area |
|---|---|---|---|
| Authentication | Authentication | Firebase Auth | Login tests |
| Users | User Management | Firestore | CRUD tests |
| Students | Admin | Firestore | Student tests |
| Faculty | Admin | Firestore | Faculty tests |
| Departments | Admin | Firestore | Department tests |
| Subjects | Admin | Firestore | Subject tests |
| Classes | Admin | Firestore | Class tests |
| Assignments | Admin | Firestore | Assignment tests |
| Attendance | Faculty | Firestore | Attendance tests |
| Attendance Calculation | Analytics | Firestore + App Logic | Calculation tests |
| Reports | Reports | Firestore + App Logic | Report tests |
| Notifications | Notifications | FCM/Firestore | Notification tests |
| Authorization | All modules | Security Rules | Security tests |
| File Upload | Profile/Files | Storage | Storage tests |

---

# 31. Suggested Project Folder Structure

```text
PAMS/
│
├── docs/
│   ├── SRS.md
│   ├── PROJECT_PROPOSAL.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   └── TEST_PLAN.md
│
├── src/
│   └── application-source-code/
│
├── firebase/
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   ├── storage.rules
│   └── firebase.json
│
├── diagrams/
│   ├── er-diagram
│   ├── use-case
│   ├── dfd
│   ├── activity
│   ├── class
│   └── sequence
│
├── README.md
└── .gitignore
```

---

# 32. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Project Student | __________________ | __________ | __________ |
| Project Guide | __________________ | __________ | __________ |
| HOD / Coordinator | __________________ | __________ | __________ |

---

# 33. Student Information

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

# END OF SRS
