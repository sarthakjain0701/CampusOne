# CAMPUSONE — PHASE 7: ADMIN MOBILE UI

Implement **ONLY the Admin mobile interface** for CampusOne.

Use the uploaded **CampusOne Mobile UI Reference** and the mobile foundation created in Phases 1–6.

The official visible branding is:

**CampusOne**

Use the provided official CampusOne logo.

---

# 🚨 ABSOLUTE RULE — DESKTOP MUST NOT CHANGE

```text
Desktop > 900px
    ↓
EXISTING ADMIN UI
❌ DO NOT CHANGE

Mobile ≤ 900px
    ↓
NEW ADMIN MOBILE UI
✅ IMPLEMENT
```

This phase is mobile UI only.

Do NOT redesign the existing desktop Admin interface.

Do NOT modify:

* Firebase Authentication
* Firestore
* Cloud Functions
* Firestore rules
* RBAC
* Admin permissions
* database schema
* business logic
* existing services
* desktop CSS/layout
* existing routes

---

# 1. ADMIN MOBILE NAVIGATION

Admin has the broadest access, but do not put every module into the primary bottom navigation.

Primary mobile navigation:

```text
Dashboard
Users
Academics
Library
More
```

The **More** section should contain the remaining existing Admin modules.

Example:

```text
Users
  Students
  Faculty
  Lab Assistants
  Librarians
  Provision User

Academics
  Departments
  Classes
  Subjects
  Timetable
  Examinations
  Attendance Management

Library
  Books
  Book Copies
  Members
  Issue / Return
  Reservations
  Fines
  Library Settings

More
  Reports & Analytics
  Digital Learning
  Notifications
  System Settings
  Profile
```

Use only routes/modules that already exist.

Do not create duplicate routes.

---

# 2. ADMIN MOBILE HEADER

Reuse the existing mobile header foundation.

Example:

```text
┌──────────────────────────────┐
│ ☰  CampusOne       🔔 Profile│
└──────────────────────────────┘
```

Use the CampusOne logo.

Do not modify the desktop header.

---

# 3. ADMIN DASHBOARD

Create a mobile-first Admin Dashboard.

Structure:

```text
Welcome
    ↓
System Overview
    ↓
Quick Actions
    ↓
Academic Overview
    ↓
Library Overview
    ↓
Recent Activity
    ↓
Notifications
```

Use real data.

Do not introduce static dashboard numbers.

---

# 4. ADMIN WELCOME

Display the authenticated Admin's real profile information.

Example:

```text
Good Morning 👋

Admin Name

Administrator
CampusOne
```

Do not hardcode the name.

Use the existing authenticated user/profile service.

---

# 5. SYSTEM OVERVIEW

Create compact mobile cards using real existing dashboard statistics.

Possible existing metrics:

```text
Students
Faculty
Lab Assistants
Librarians
Departments
Classes
Subjects
```

Example:

```text
┌──────────────┐ ┌──────────────┐
│ Students     │ │ Faculty      │
│ 1200         │ │ 84           │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Departments  │ │ Classes      │
│ 6            │ │ 42           │
└──────────────┘ └──────────────┘
```

Use actual values from existing services.

Do not invent statistics.

---

# 6. QUICK ACTIONS

Create mobile-friendly Admin actions:

```text
[ Add Student ]
[ Add Faculty ]
[ Add Lab Assistant ]
[ Add Librarian ]
[ Add Department ]
[ Add Class ]
[ Add Subject ]
```

Only show actions that already exist.

Use existing forms/routes.

Do not duplicate provisioning logic.

---

# 7. USER MANAGEMENT

Make existing Admin User Management mobile responsive.

The Admin must be able to access existing:

* Students
* Faculty
* Lab Assistants
* Librarians
* User provisioning

Use the existing Admin services.

Do not change provisioning architecture.

---

# 8. PROVISION USER

The mobile UI must use the existing secure provisioning workflow.

Do NOT implement:

```text
createUserWithEmailAndPassword()
```

from the browser.

Do NOT create a second authentication system.

Use the existing provisioning service/function architecture.

Supported roles remain:

```text
ADMIN
FACULTY
LAB_ASSISTANT
LIBRARIAN
STUDENT
```

---

# 9. PROVISION USER MOBILE FORM

Use a touch-friendly form:

```text
Provision User

Role
[ Select Role ]

Name
[ Enter Name ]

Email
[ Enter Email ]

Department
[ Select Department ]

Additional Information
[ ... ]

[ Create User ]
```

Use existing fields required by the actual provisioning workflow.

Do not invent new required database fields.

If the existing workflow returns a temporary password, preserve the existing secure one-time display behavior.

Do not store the temporary password in Firestore.

Do not log it.

---

# 10. STUDENT MANAGEMENT

Make Student Management mobile responsive.

Use proper searchable/filterable records.

Possible filters:

```text
Enrollment Year
Department
Semester
Section
Registration Number
```

Use existing StudentService queries.

Do not download the entire student collection unnecessarily.

---

# 11. FACULTY MANAGEMENT

Make Faculty Management mobile responsive.

Show:

* Name
* Email
* Department
* Designation
* Status
* Role where appropriate

Use existing FacultyService.

Do not change role data.

---

# 12. LAB ASSISTANT MANAGEMENT

Provide a mobile-friendly Admin view for Lab Assistants.

Show:

* Name
* Email
* Department
* Laboratory where available
* Status
* Role

The role must remain:

```text
LAB_ASSISTANT
```

Do not convert Lab Assistant to Faculty.

---

# 13. LIBRARIAN MANAGEMENT

Make Librarian management mobile-friendly.

Use the existing:

```text
faculties/{email}
```

identity architecture where applicable.

The role remains:

```text
LIBRARIAN
```

Do not create a separate identity collection unless one already exists and is actually required by the project.

---

# 14. ACADEMIC MANAGEMENT

Make existing Admin academic modules responsive:

```text
Departments
Classes
Subjects
Timetable
```

Use proper mobile forms and tables.

Do not change the underlying Firestore schema.

---

# 15. DEPARTMENTS

Mobile layout:

```text
Departments

Search...
[ + Add Department ]

┌────────────────────────────┐
│ CSE                        │
│ Computer Science           │
│ HOD: ...                   │
│ Status: Active             │
│                            │
│ [ View ] [ Edit ]          │
└────────────────────────────┘
```

Use real Firestore data.

---

# 16. CLASSES

Make Classes responsive.

Display relevant existing fields:

```text
Class
Department
Semester
Section
Academic Year
Status
```

Use existing ClassService.

Do not change class IDs or schema.

---

# 17. SUBJECTS

Make Subjects responsive.

Display:

```text
Code
Name
Department
Semester
Credits
Status
```

Use existing SubjectService.

Do not alter subject IDs or schema.

---

# 18. TIMETABLE

Make the existing Admin Timetable mobile-friendly.

Use a structured layout.

For narrow screens, allow horizontal scrolling where necessary.

Do not replace actual timetable data with cards containing incomplete information.

Preserve:

* day
* time
* department
* section/class
* subject
* faculty
* room
* status

Use existing TimetableService.

---

# 19. EXAMINATIONS

Make existing Admin examination modules responsive.

Only adapt presentation.

Do not modify:

* exam logic
* result logic
* hall-ticket logic
* exam-form logic
* marks calculations
* Firestore schema

Use existing services.

---

# 20. ATTENDANCE MANAGEMENT

Admin mobile may access existing attendance administration where already permitted.

Keep existing functionality.

Do not change:

* AttendanceService
* AttendanceAssignmentService
* attendance calculations
* attendance schema
* faculty attendance permissions
* student attendance permissions

Use mobile-friendly tables/cards without changing behavior.

---

# 21. LIBRARY ADMINISTRATION

Make the existing Admin Library Management mobile-friendly.

Include only existing Admin-authorized functionality:

```text
Books
Book Copies
Members
Issue/Return
Reservations
Fines
Reports
Library Settings
```

Use existing LibraryService and LibrarySettingsService.

Do not duplicate Library business logic.

---

# 22. LAB PROBLEM REPORTS

If the Lab Problem Reports workflow exists:

Add its existing Admin view to the mobile Admin interface.

The Admin should be able to see reports submitted by Lab Assistants.

Example:

```text
Lab Problem Reports

Wi-Fi not working
CSE Computer Lab
HIGH
IN_PROGRESS

Computer not starting
CSE Lab 2
URGENT
SUBMITTED
```

Admin should retain existing authorized actions:

* View
* Acknowledge
* Start work
* Resolve
* Close

Only expose actions already supported by the project.

Do not create a second problem-report architecture.

---

# 23. REPORTS & ANALYTICS

Make existing Reports & Analytics responsive.

Do not remove Admin Reports & Analytics.

Use:

* compact statistic cards
* horizontally scrollable data where needed
* responsive charts if existing
* readable labels
* filters

Do not change report calculations.

Do not introduce mock analytics.

---

# 24. DIGITAL LEARNING

Make existing Admin Digital Learning management responsive.

Preserve existing ability to manage learning resources.

Do not change:

* LearningService
* learning resource collection
* uploader role logic
* Student/FACULTY/LAB_ASSISTANT visibility rules

---

# 25. NOTIFICATIONS

Make Admin Notifications responsive.

Use existing NotificationService.

Preserve:

* unread count
* read state
* notification data
* existing notification behavior

Do not create mock notifications.

---

# 26. SYSTEM SETTINGS

Make existing System Settings mobile-friendly.

Do not change settings functionality.

Use existing forms/services.

Do not expose backend/security configuration unnecessarily.

---

# 27. PROFILE

Make Admin Profile responsive.

Show existing Admin information.

Do not allow client-side editing of security-sensitive role fields.

---

# 28. MOBILE TABLES

Admin has many data-heavy screens.

Use proper HTML/tabular layouts.

For narrow screens:

```css
overflow-x: auto;
```

Do NOT:

* make text tiny
* remove important columns
* convert every table into decorative cards

Use cards only where they genuinely improve mobile usability.

---

# 29. MOBILE FORMS

All Admin forms should use touch-friendly controls.

Recommended:

```text
Input: 46–48px
Select: 46–48px
Button: 44–48px
```

Use:

```text
Label
[ Input ]

Label
[ Select ]

[ Cancel ] [ Save ]
```

Maintain existing validation.

Do not change form submission logic.

---

# 30. LOADING / EMPTY / ERROR STATES

Every Admin mobile page must properly handle:

```text
Loading
Success
Empty
Error
```

Never leave a page permanently stuck on:

```text
Loading...
Fetching analytics...
Loading dashboard data...
```

Trace the actual lifecycle:

```text
render()
afterRender()
App.postRenderView()
service
Firebase/Firestore
```

where applicable.

Fix only the actual mobile/render lifecycle issue if one exists.

Do not create a second lifecycle system.

---

# 31. PERFORMANCE

Admin has access to large datasets.

Do NOT introduce unbounded reads.

Use:

* pagination
* targeted filters
* limits
* existing service-level queries
* lazy loading

Do not load all:

* students
* faculty
* books
* transactions
* reports
* notifications

when the Admin opens the dashboard.

---

# 32. MOBILE NAVIGATION

Reuse the mobile navigation framework from previous phases.

Do not create a separate Admin navigation implementation.

Ensure active route state works correctly.

Ensure the bottom navigation does not cover page content.

---

# 33. RESPONSIVE TESTING

Verify Admin UI at:

```text
320px
360px
375px
390px
412px
430px
600px
768px
900px
```

Check:

* no horizontal page overflow
* no clipped cards
* no broken tables
* no clipped modals
* no overlapping header
* no hidden primary actions
* keyboard does not hide buttons
* bottom navigation works
* touch targets are usable
* safe-area spacing works

---

# 34. DESKTOP PROTECTION

Desktop Admin must remain unchanged.

Verify:

```text
Desktop > 900px
```

for:

* Dashboard
* Users
* Students
* Faculty
* Lab Assistants
* Librarians
* Departments
* Classes
* Subjects
* Timetable
* Exams
* Attendance
* Library
* Reports
* Digital Learning
* Notifications
* Settings
* Profile

No intentional desktop visual change is permitted.

---

# 35. DATA SOURCE

Use existing services.

Do NOT introduce:

* MOCK_DATA
* static arrays
* DataStore
* localStorage as source of truth
* sessionStorage as source of truth
* duplicate Firestore collections

Firebase/Firestore remains the source of truth.

---

# 36. RBAC PROTECTION

Do not modify:

* AuthorizationService
* roleConfig
* FirebaseService
* Firestore rules
* role resolution
* Admin permissions

The Admin role remains:

```text
ADMIN
```

Do not grant additional permissions to other roles.

---

# 37. BRANDING

Visible branding must remain:

**CampusOne**

Use the provided CampusOne logo.

Do not reintroduce:

```text
Poornima Group Of College
Poornima Attendance System
PAMS
```

as application branding.

Do not redesign the logo.

---

# 38. STATIC VALIDATION

Run syntax checks on every changed JS file.

Verify:

* no broken imports
* no missing globals
* no duplicate Firebase initialization
* no duplicate routes
* no mock data
* no unbounded Firestore reads
* no RBAC regression
* no desktop CSS regression
* no new authentication logic

Search for:

```text
MOCK_DATA
DataStore
localStorage
sessionStorage
createUserWithEmailAndPassword
```

Do not introduce any of them.

---

# 39. FILE CHANGE CONTROL

Only modify files required for Admin mobile UI.

Do not modify unrelated:

* Student
* Faculty
* Lab Assistant
* Librarian
* backend
* Firestore rules
* Cloud Functions

unless an existing mobile lifecycle issue requires a minimal supporting change.

---

# 40. FINAL REPORT

Return:

## Admin Mobile

* Dashboard: PASS/FAIL
* User Management: PASS/FAIL
* Student Management: PASS/FAIL
* Faculty Management: PASS/FAIL
* Lab Assistant Management: PASS/FAIL
* Librarian Management: PASS/FAIL
* Departments: PASS/FAIL
* Classes: PASS/FAIL
* Subjects: PASS/FAIL
* Timetable: PASS/FAIL
* Examinations: PASS/FAIL
* Attendance Management: PASS/FAIL
* Library Management: PASS/FAIL
* Lab Problem Reports: PASS/FAIL
* Reports & Analytics: PASS/FAIL
* Digital Learning: PASS/FAIL
* Notifications: PASS/FAIL
* System Settings: PASS/FAIL
* Profile: PASS/FAIL
* Mobile navigation: PASS/FAIL
* Responsive testing: PASS/FAIL

## Provisioning Protection

* Existing secure provisioning flow preserved: PASS/FAIL
* Browser-side Auth user creation introduced: MUST BE NO
* Temporary password handling unchanged: PASS/FAIL

## Desktop Protection

* Desktop Admin UI changed: MUST BE NO
* Desktop visual regression: PASS/FAIL
* Desktop functionality regression: PASS/FAIL

## Backend Protection

* Firebase changed: NO
* Authentication changed: NO
* RBAC changed: NO
* Firestore schema changed: NO unless genuinely required
* Cloud Functions changed: NO
* Business logic changed: NO

## Validation

* JS syntax: PASS/FAIL
* Broken imports: PASS/FAIL
* Mock data introduced: MUST BE NO
* Unbounded reads introduced: MUST BE NO
* CampusOne branding: PASS/FAIL
* Exact files changed
* Git commit/hash

# STOP AFTER PHASE 7

Do not begin another redesign immediately.

After this phase, wait for my Admin mobile testing.

The next phase after my approval will be:

**PHASE 8 — GLOBAL MOBILE QA + RESPONSIVE INTEGRATION**

That phase will verify all five roles together without changing their desktop interfaces.
