# Poornima Attendance System
## Software Requirements Specification (SRS) — Feature Update

**Project:** Poornima Attendance System (PAS)  
**Document Version:** 2.0  
**Date:** 14 August 2026  
**Platform:** Responsive Web Application  
**Planned Backend:** Firebase Authentication, Cloud Firestore, Firebase Storage  

---

## 1. Introduction

### 1.1 Purpose
This SRS updates the Poornima Attendance System by adding five academic-portal modules while preserving all existing attendance functionality.

### 1.2 New Features
1. Digital Learning Portal
2. Semester Timetable
3. Examination Results
4. Holiday Calendar
5. Student Fee Receipts

### 1.3 Project Vision
The system will provide students with one portal to monitor attendance and access important academic information.

---

## 2. Existing Functionality

The system already includes:
- Authentication
- Admin, Faculty and Student dashboards
- Student management
- Faculty management
- Department management
- Subject management
- Class management
- Faculty-subject-class assignment
- Attendance marking
- Attendance history
- Attendance calculation
- Attendance reports
- Notifications

The new modules must not break these features.

---

# 3. User Roles

## 3.1 Admin
Admin can:
- Manage students, faculty, departments, subjects and classes
- Assign faculty to classes/subjects
- Monitor attendance
- Manage digital learning resources
- Manage timetables
- Manage examination results
- Manage holidays
- Manage fee records/receipts
- Manage notifications
- Generate reports

## 3.2 Faculty
Faculty can:
- View assigned classes and subjects
- Mark attendance
- View attendance history
- Upload and manage learning resources for assigned subjects
- View their timetable
- Access relevant academic information

Faculty must not modify financial records or final published results unless explicitly authorized.

## 3.3 Student
Students can:
- View attendance
- Access learning resources
- View semester timetable
- View published examination results
- View holidays
- View their own fee receipts
- View notifications

Students must never access another student's private data.

---

# 4. Functional Requirements

## FR-01 Authentication
The final system shall use Firebase Authentication for secure login, logout, session management and password reset where enabled.

---

# 5. Digital Learning

## FR-02 Digital Learning Portal
The system shall provide learning resources organized by department, semester, class, subject and faculty.

## FR-03 Resource Types
Supported types:
- Notes
- Book Suggestions
- Assignments
- Tutes/Tutorials
- Study Material
- Important Questions
- Reference Material

## FR-04 Resource Fields
Each resource may contain:
- Resource ID
- Title
- Description
- Subject
- Class
- Faculty
- Resource Type
- File/Resource URL
- Upload Date
- Visibility/Status

## FR-05 Student Features
Students can:
- View
- Search
- Filter
- Open
- Download permitted resources

## FR-06 Faculty Features
Faculty can add, edit, delete and view resources for their assigned subjects/classes.

## FR-07 Admin Features
Admin can view resources, manage visibility and remove inappropriate resources.

## FR-08 Copyright
The system shall not distribute copyrighted books without authorization. Book suggestions may contain title, author, publisher, edition, ISBN and legitimate reference/purchase/library links.

---

# 6. Semester Timetable

## FR-09 Timetable
Students shall be able to view the complete timetable for their class/semester.

Timetable data may include:
- Day
- Date where applicable
- Start time
- End time
- Subject
- Faculty
- Room
- Class/Section

## FR-10 Timetable Views
- Weekly timetable
- Complete semester timetable

## FR-11 Timetable Upload
Admin can publish official timetable files in PDF or image format.

## FR-12 Timetable Management
Admin can create, edit, delete, upload and publish/unpublish timetable information.

## FR-13 Student Access
Students can view today's classes, weekly timetable and official timetable files.

## FR-14 Faculty Access
Faculty can view their assigned timetable.

---

# 7. Examination Results

## FR-15 Result Management
Results shall be associated with student, semester, subject and academic year.

## FR-16 Result Fields
- Result ID
- Student ID
- Semester
- Academic Year
- Subject
- Internal Marks
- External Marks
- Total Marks
- Grade
- Grade Point
- Result Status

## FR-17 Student Result View
Students can view subject-wise marks, total marks, grades, grade points, percentage where applicable, SGPA/CGPA where available and result status.

## FR-18 Result History
Students can select a semester and view published results.

## FR-19 Result Publishing
Authorized Admin users can add, edit unpublished results, publish and unpublish results.

## FR-20 Result Privacy
A student can only access their own results.

---

# 8. Holiday Calendar

## FR-21 Holiday Calendar
The system shall provide an official academic holiday calendar.

## FR-22 Holiday Fields
- Holiday ID
- Holiday Name
- Date
- Day
- Holiday Type
- Description
- Academic Year
- Publication Status

## FR-23 Holiday Types
- National Holiday
- Festival Holiday
- College Holiday
- University Holiday
- Exam Break
- Semester Break
- Other

## FR-24 Calendar
Students can view holidays in a monthly calendar.

## FR-25 Holiday Details
Selecting a holiday displays its name, date, day, type and description.

## FR-26 Holiday Management
Admin can add, edit, delete and publish/unpublish holidays.

## FR-27 Upcoming Holidays
The student dashboard shall display upcoming holidays.

---

# 9. Student Fee Receipts

## FR-28 Fee Information
Students can view their fee payment records and receipts.

## FR-29 Fee Summary
The system may display:
- Total Fees
- Paid Amount
- Remaining Amount
- Payment Status

## FR-30 Receipt Fields
- Receipt ID
- Receipt Number
- Student ID
- Student Name
- Roll Number
- Course
- Semester
- Fee Type
- Amount
- Payment Date
- Payment Mode
- Payment Status
- Receipt File/URL

## FR-31 Receipt View
Students can view and download authorized receipts.

## FR-32 Fee Privacy
Students can only view their own fee records and cannot edit or delete them.

## FR-33 Fee Management
Authorized Admin/Finance users can add, update, upload and publish fee records and receipts.

---

# 10. Updated Student Dashboard

The dashboard shall contain:
- Overall attendance
- Subject-wise attendance
- Digital Learning
- Today's timetable
- Latest examination result
- Upcoming holidays
- Fee summary
- Notifications

Example:

```text
Welcome, Student

Attendance: 85%       Latest SGPA: 8.4
Learning: 12 Resources
Today's Classes: 3
Next Holiday: 15 August
Fee Remaining: ₹40,000
Notifications
```

---

# 11. Navigation

## Student
```text
Dashboard
Attendance
Digital Learning
Timetable
Exam Results
Holiday Calendar
Fee Receipts
Notifications
Profile
Settings
Logout
```

## Faculty
```text
Dashboard
My Classes
My Subjects
Attendance
Digital Learning
Timetable
Attendance History
Reports
Notifications
Profile
Logout
```

## Admin
```text
Dashboard
Students
Faculty
Departments
Subjects
Classes
Assignments
Attendance
Digital Learning
Timetable
Exam Results
Holiday Calendar
Fee Management
Reports
Notifications
Settings
Logout
```

---

# 12. Non-Functional Requirements

## NFR-01 Responsiveness
The system shall work on Android phones, iPhones, tablets, laptops and desktops.

## NFR-02 Usability
The interface shall be modern, consistent, simple and easy to navigate.

## NFR-03 Performance
The application shall avoid unnecessary database reads/writes and load only relevant data.

## NFR-04 Security
The final Firebase implementation shall use Firebase Authentication, Firestore Security Rules and appropriate Storage security. Firebase App Check may be enabled where appropriate.

## NFR-05 Privacy
Attendance, results, personal information and financial records must be protected.

## NFR-06 Scalability
The architecture shall target 2,000+ users and minimize unnecessary Firestore operations.

---

# 13. Firebase Architecture

Firebase will be integrated in a later phase.

### Authentication
Used for:
- Student login
- Faculty login
- Admin login
- Session management
- Password reset

### Firestore Collections
```text
users
students
faculty
departments
subjects
classes
facultyAssignments
attendance
learningResources
timetables
examResults
holidays
feeReceipts
notifications
```

### Firebase Storage
Used for authorized:
- Notes
- Tutes
- Assignments
- Timetable files
- Receipt files
- Other permitted academic documents

---

# 14. Data Relationships

```text
Department
 ├── Students
 ├── Faculty
 └── Subjects

Class
 ├── Students
 ├── Subjects
 └── Timetable

Faculty
 ├── Assignments
 ├── Learning Resources
 └── Attendance

Student
 ├── Attendance
 ├── Exam Results
 ├── Fee Receipts
 └── Notifications

Subject
 ├── Learning Resources
 ├── Attendance
 ├── Exam Results
 └── Timetable
```

---

# 15. Security Requirements

### Student
Can read:
- Own attendance
- Own results
- Own fee receipts
- Permitted learning resources
- Own timetable
- Holidays
- Own notifications

Cannot:
- Modify attendance
- Modify results
- Modify fee receipts
- Access another student's private information
- Manage institutional data

### Faculty
Can:
- Manage attendance for assigned classes
- Manage learning resources for assigned subjects
- View assigned timetable

Cannot:
- Modify financial records
- Modify final published results unless authorized
- Access unrelated private student records

### Admin
Can manage institutional data according to assigned permissions.

---

# 16. Search and Filters

### Digital Learning
- Search by title
- Subject
- Resource type
- Faculty

### Results
- Semester
- Subject
- Academic year

### Holidays
- Month
- Year
- Holiday type

### Fees
- Semester
- Fee type
- Payment status

---

# 17. Validation

The system shall validate:
- Required fields
- Email addresses
- Dates
- Marks
- Duplicate receipt numbers
- Duplicate timetable entries where applicable
- Duplicate holiday entries where applicable

Marks must not exceed configured maximum marks.

---

# 18. Error and Empty States

The application shall provide clear messages such as:

```text
No learning resources available.
No timetable has been published yet.
Your result has not been published.
No fee receipts available.
No matching records found.
Something went wrong. Please try again.
```

---

# 19. Notifications

Students may receive notifications for:
- New learning material
- New assignments
- Attendance warnings
- Published results
- Timetable updates
- Holiday changes
- New fee receipts

---

# 20. Reports

Admin reports may include:
- Attendance reports
- Student attendance summaries
- Subject attendance summaries
- Result reports
- Fee collection reports
- Learning resource reports

Students can only receive reports related to their own information.

---

# 21. Testing Requirements

### Authentication
- Valid login
- Invalid login
- Logout
- Role-based access
- Unauthorized access

### Digital Learning
- Add/edit/delete resource
- Search
- Filter
- Open/download

### Timetable
- Create/edit/delete
- Upload
- View
- Mobile layout

### Results
- Add/edit unpublished result
- Publish
- View
- Semester filter
- Privacy

### Holidays
- Add/edit/delete
- Calendar
- Upcoming holidays

### Fees
- Add record
- View receipt
- Download receipt
- Fee summary
- Privacy

### Existing Attendance
- Mark attendance
- Save attendance
- Calculate percentage
- History
- Reports

---

# 22. Acceptance Criteria

The update is complete when:
- Students can access digital learning resources.
- Faculty can manage resources for assigned subjects.
- Students can view their semester timetable.
- Admin can publish timetable information.
- Students can view published examination results.
- Admin can manage results.
- Students can view the holiday calendar.
- Admin can manage holidays.
- Students can view their own fee receipts.
- Authorized users can manage fee records.
- Existing attendance features continue to work.
- Role-based access works.
- Private student data is protected.
- The application is responsive.
- The architecture is ready for Firebase.
- No unnecessary features are added.

---

# 23. Out of Scope

The following are not part of this update:
- Online fee payment gateway
- Face recognition
- Fingerprint attendance
- QR attendance
- AI attendance prediction
- Blockchain
- Social media
- Live chat
- Unauthorized distribution of copyrighted books

---

# 24. Complete Module List

1. Authentication
2. Admin Management
3. Faculty Management
4. Student Management
5. Department Management
6. Subject Management
7. Class Management
8. Faculty Assignment
9. Attendance Management
10. Attendance Reports
11. Digital Learning
12. Semester Timetable
13. Examination Results
14. Holiday Calendar
15. Fee Receipts
16. Notifications
17. Profile & Settings
18. Firebase Integration
19. Security
20. Testing & Deployment

---

# 25. Implementation Priority

1. Digital Learning
2. Semester Timetable
3. Examination Results
4. Holiday Calendar
5. Fee Receipts
6. Student Dashboard Integration
7. Firebase Authentication
8. Firestore Database
9. Firebase Storage
10. Security Rules
11. Performance testing for 2,000+ users
12. Testing and deployment

---

# 26. Final Project Goal

The final system should function as a centralized academic portal:

**Attendance + Learning Resources + Timetable + Results + Holidays + Fee Receipts**

The core purpose remains attendance management while the new modules provide students with one place to access important academic information.

---

# 27. Version History

| Version | Change |
|---|---|
| 1.0 | Initial Attendance Management System |
| 2.0 | Added Digital Learning, Timetable, Results, Holiday Calendar and Fee Receipts |

---

## Conclusion

The updated Poornima Attendance System will provide a complete, responsive and scalable academic portal for students, faculty and administrators. It will preserve the existing attendance functionality while adding useful academic services and preparing the application for Firebase-based authentication, database, storage, security and deployment.
