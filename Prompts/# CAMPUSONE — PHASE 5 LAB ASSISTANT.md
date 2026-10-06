# CAMPUSONE — PHASE 5: LAB ASSISTANT MOBILE UI

Implement **ONLY the Lab Assistant mobile interface** for CampusOne.

Use the uploaded **CampusOne Mobile UI Reference** and the mobile foundation from Phases 1–4.

---

# 🚨 ABSOLUTE RULE — DESKTOP MUST NOT CHANGE

```text
Desktop > 900px
    ↓
EXISTING LAB ASSISTANT DESKTOP UI
❌ DO NOT CHANGE

Mobile ≤ 900px
    ↓
NEW LAB ASSISTANT MOBILE UI
✅ IMPLEMENT
```

This is a mobile-only UI implementation.

Do NOT modify:

* Firebase Authentication
* Firestore
* Cloud Functions
* Firestore rules
* RBAC
* role resolution
* existing business logic
* desktop CSS/layout
* existing Lab Assistant functionality

---

# 1. FINAL LAB ASSISTANT MOBILE NAVIGATION

The Lab Assistant mobile sidebar/bottom navigation must contain:

```text
Dashboard
Laboratory
Digital Learning
Report Problem
My Reports
Notifications
Profile
```

## REMOVE FROM LAB ASSISTANT UI

Do NOT show:

* Attendance
* Mark Attendance
* Attendance History
* Attendance Assignments
* Mid-Term Marks
* Timetable
* Lab Schedule
* Students
* Classes
* Subjects
* Reports & Analytics
* Admin Management
* User Management
* System Settings

Do NOT delete the underlying Attendance/Timetable services.

They must remain available for roles that require them.

This is only a **Lab Assistant UI/RBAC presentation requirement**.

---

# 2. MOBILE HEADER

Reuse the Phase 1 mobile header system.

Example:

```text
┌──────────────────────────────┐
│ ☰  POORNIMA       🔔  Profile│
└──────────────────────────────┘
```

Use:

**POORNIMA GROUP OF COLLEGE**

Do not introduce another branding system.

---

# 3. LAB ASSISTANT DASHBOARD

Create a mobile-first dashboard focused on laboratory operations.

Structure:

```text
Welcome
   ↓
Lab Summary
   ↓
Problem Summary
   ↓
Recent Problems
   ↓
Laboratory Information
   ↓
Digital Learning
```

Use real data only.

No mock dashboard statistics.

---

# 4. WELCOME SECTION

Display actual authenticated Lab Assistant information.

Example:

```text
Good Morning 👋

Lab Assistant Name

LAB ASSISTANT
Department / Assigned Laboratory
```

Use:

```text
faculties/{email}
```

because Lab Assistant identity is stored in the existing `faculties` collection.

The role must remain:

```text
LAB_ASSISTANT
```

Do not change it to `FACULTY`.

Do not hardcode the user's name.

---

# 5. LAB SUMMARY CARDS

Create four compact mobile cards:

```text
┌──────────────┐
│ My Labs      │
│ 2            │
└──────────────┘

┌──────────────┐
│ Open Issues  │
│ 3            │
└──────────────┘

┌──────────────┐
│ High Priority│
│ 1            │
└──────────────┘

┌──────────────┐
│ Resolved     │
│ 8            │
└──────────────┘
```

Values must come from real Firestore data.

Do not hardcode numbers.

Use responsive two-column cards where the screen allows it.

On very small screens, stack them vertically.

---

# 6. LABORATORY MODULE

The Laboratory section should contain useful laboratory information.

Use existing data architecture if available.

Possible sections:

### My Laboratories

Show laboratories assigned to the Lab Assistant.

Example:

```text
CSE Computer Lab
Room 201
Capacity: 60
Status: Active
```

### Lab Details

Show:

* Laboratory name
* Room
* Department
* Capacity
* Status
* Assigned Lab Assistant

### Equipment

Where existing equipment data exists, show:

* Equipment name
* Quantity
* Status
* Location

Statuses may include:

```text
Available
In Use
Damaged
Under Maintenance
```

### Maintenance

Show existing maintenance information where supported.

Do not create fake equipment records.

If the project does not currently have an equipment collection/service, show a clean empty state instead of inventing data.

Example:

```text
No equipment records available.
```

---

# 7. LABORATORY MOBILE CARD DESIGN

Use cards like:

```text
┌────────────────────────────┐
│ CSE Computer Lab           │
│ Room 201                   │
│                            │
│ Capacity        60         │
│ Equipment       42         │
│ Status           Active    │
│                            │
│ [ View Details ]           │
└────────────────────────────┘
```

Use:

* 16–20px radius
* 14–18px padding
* subtle border
* soft shadow
* comfortable spacing

---

# 8. REPORT PROBLEM — MAIN FEATURE

This is the primary Lab Assistant workflow.

The Lab Assistant must be able to report problems to Admin.

Examples:

* Light not working
* Fan not working
* AC problem
* Wi-Fi problem
* Internet unavailable
* Computer not working
* Printer problem
* Power socket problem
* Electricity issue
* Lab equipment damaged
* Missing equipment
* Furniture damage
* Cleaning problem
* Security/lock problem
* Other maintenance issue

---

# 9. REPORT PROBLEM FORM

Create a mobile-friendly form:

```text
Report Problem

Laboratory
[ Select Laboratory ]

Category
[ Wi-Fi / Internet ]

Problem Title
[ Wi-Fi not working ]

Description
[ Describe the issue... ]

Priority
[ High ]

Optional Image
[ Upload Image ]

[ Submit Problem ]
```

Use touch-friendly controls.

Input height:

```text
46–48px
```

Textarea should be comfortably sized.

---

# 10. PROBLEM CATEGORIES

Use the existing category design if already implemented.

Otherwise use:

```text
ELECTRICAL
WIFI/INTERNET
COMPUTER/PC
PRINTER
AC/FAN
POWER/SOCKET
FURNITURE
LAB EQUIPMENT
CLEANING/MAINTENANCE
SECURITY/LOCK
MISSING EQUIPMENT
DAMAGED EQUIPMENT
OTHER
```

Do not unnecessarily duplicate category definitions in multiple files.

Create/reuse a central constant if required.

---

# 11. PRIORITY

Use:

```text
LOW
MEDIUM
HIGH
URGENT
```

Use both text and visual styling.

Do not rely only on color.

Example:

```text
HIGH
```

with an appropriate accessible badge.

---

# 12. PROBLEM STATUS

Display:

```text
SUBMITTED
ACKNOWLEDGED
IN_PROGRESS
RESOLVED
CLOSED
```

The Lab Assistant should be able to see status updates.

Only Admin-authorized functionality should change administrative status.

Do not allow Lab Assistant to mark an issue as resolved unless existing business rules explicitly permit it.

---

# 13. MY REPORTS

Create a dedicated mobile page:

```text
My Reports
```

Show only the authenticated Lab Assistant's reports.

Example:

```text
┌────────────────────────────┐
│ Wi-Fi not working          │
│ CSE Computer Lab           │
│ High                      │
│                            │
│ Submitted                  │
│ 12 Sep 2026                │
└────────────────────────────┘
```

Include:

* title
* laboratory
* category
* priority
* status
* created date
* updated date

---

# 14. REPORT DETAILS

When a report is opened, show:

```text
Problem
Wi-Fi not working

Laboratory
CSE Computer Lab

Category
WIFI/INTERNET

Priority
HIGH

Description
...

Status
IN_PROGRESS

Reported On
12 Sep 2026

Last Updated
13 Sep 2026
```

If Admin has added notes/comments and the existing architecture supports them, show them.

Do not invent fields that do not exist.

---

# 15. ADMIN SIDE INTEGRATION

If the `labProblemReports` workflow already exists, reuse it.

If it does not yet exist and this workflow genuinely requires a Firestore collection, use:

```text
labProblemReports
```

Suggested document structure:

```text
reportedByUid
reportedByEmail
reportedByName
laboratoryId
laboratoryName
category
title
description
priority
status
createdAt
updatedAt
```

Only add fields that are actually required.

Do not duplicate existing problem-report collections.

---

# 16. SECURITY

Lab Assistant queries must be restricted to the authenticated user's reports.

Conceptually:

```text
reportedByUid == currentUser.uid
```

Admin can access authorized reports according to existing RBAC/security rules.

Do not use:

```text
get all reports
```

for a Lab Assistant dashboard.

Do not download every problem report and filter client-side.

---

# 17. DIGITAL LEARNING

Keep Digital Learning in the Lab Assistant mobile UI.

Lab Assistant learning content can include:

* lab manuals
* practical guides
* experiment procedures
* equipment manuals
* safety instructions
* laboratory resources

Use the existing LearningService.

Do not create a separate duplicate learning architecture.

Students should be able to see Lab Assistant learning content through the Student Digital Learning page according to existing permissions.

---

# 18. NOTIFICATIONS

Show real notifications relevant to the Lab Assistant.

Examples:

```text
Problem report acknowledged
Wi-Fi issue is in progress
Computer maintenance completed
New lab learning material
```

Use the existing NotificationService.

Do not create fake notifications.

Preserve unread/read behavior.

---

# 19. PROFILE

Mobile Profile should show:

```text
Name
Email
Role
Designation
Department
Assigned Laboratory
```

Only show fields that actually exist.

Do not allow the client to modify security-sensitive role fields.

---

# 20. BOTTOM NAVIGATION

Reuse the existing mobile navigation foundation.

Recommended:

```text
Home
Laboratory
Report Problem
Notifications
More
```

More:

```text
Digital Learning
My Reports
Profile
```

Do not create duplicate route systems.

---

# 21. LOADING STATES

Every page must correctly handle:

```text
Loading
Success
Empty
Error
```

Never leave:

```text
Loading...
```

permanently visible.

Trace:

```text
render()
afterRender()
App.postRenderView()
```

where applicable.

If a view requires `afterRender()`, ensure the existing App lifecycle invokes it.

Do not create a second lifecycle mechanism.

---

# 22. EMPTY STATES

Examples:

### No Laboratory

```text
No laboratory has been assigned yet.
```

### No Reports

```text
No problem reports yet.

[ Report a Problem ]
```

### No Notifications

```text
You're all caught up.
```

### No Learning Material

```text
No laboratory learning material available.
```

Do not use mock records to fill empty screens.

---

# 23. RESPONSIVE DESIGN

Verify:

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

* no horizontal overflow
* forms fit screen
* buttons are tappable
* cards do not overflow
* modal fits screen
* textarea works correctly
* bottom navigation does not cover content
* safe-area spacing works
* keyboard does not hide primary actions

---

# 24. MOBILE TABLES

If equipment or reports are naturally tabular:

Use responsive tables.

On small screens:

```css
overflow-x: auto;
```

Do not make text tiny.

Use cards where they provide better mobile readability for individual reports.

---

# 25. PERFORMANCE

Do not introduce unbounded Firestore reads.

Lab Assistant:

```text
My Reports → query current user's reports
Dashboard → bounded summary/recent reports
Laboratory → targeted assigned lab data
Notifications → existing bounded notification flow
Learning → existing bounded learning flow
```

Use pagination/limits where appropriate.

Do not introduce unnecessary realtime listeners.

---

# 26. DESKTOP PROTECTION

Desktop Lab Assistant must remain unchanged.

Verify:

```text
Desktop > 900px
```

has:

* existing layout
* existing navigation
* existing functionality
* existing styling

No desktop redesign is allowed in this phase.

---

# 27. ROLE PROTECTION

The role must remain:

```text
LAB_ASSISTANT
```

Do not modify:

```text
roleConfig
AuthorizationService
FirebaseService
Firestore rules
```

Do not give Lab Assistant Faculty/Admin permissions.

---

# 28. ATTENDANCE PROTECTION

Do NOT delete or modify:

```text
AttendanceService
AttendanceAssignmentService
Attendance views
Faculty attendance
Student attendance
```

The requirement is simply:

**Attendance must not appear in the Lab Assistant mobile UI.**

Other roles must continue working normally.

---

# 29. STATIC VALIDATION

Run syntax validation on every changed JS file.

Check:

* no broken imports
* no missing globals
* no duplicate Firebase initialization
* no duplicate routes
* no mock data
* no localStorage/sessionStorage source of truth
* no unbounded Firestore reads
* no RBAC regression
* no desktop CSS regression

Search for:

```text
MOCK_DATA
DataStore
localStorage
sessionStorage
createUserWithEmailAndPassword
```

Do not introduce any of these.

---

# 30. FILE CHANGE CONTROL

Only modify files required for Lab Assistant mobile UI.

Do not modify unrelated:

* Student
* Faculty
* Librarian
* Admin
* Firebase backend
* Firestore rules
* Cloud Functions

unless an existing mobile problem-report workflow genuinely requires a minimal supporting change.

---

# 31. FINAL REPORT

Return:

## Lab Assistant Mobile

* Dashboard: PASS/FAIL
* Laboratory: PASS/FAIL
* Digital Learning: PASS/FAIL
* Report Problem: PASS/FAIL
* My Reports: PASS/FAIL
* Notifications: PASS/FAIL
* Profile: PASS/FAIL
* Mobile navigation: PASS/FAIL
* Responsive testing: PASS/FAIL

## Attendance Removal

* Attendance visible in Lab Assistant mobile: MUST BE NO
* Attendance code deleted: MUST BE NO
* Faculty Attendance unaffected: PASS/FAIL
* Student Attendance unaffected: PASS/FAIL

## Problem Reporting

* Problem categories: PASS/FAIL
* Priority: PASS/FAIL
* Status display: PASS/FAIL
* User-specific reports: PASS/FAIL
* Admin visibility: PASS/FAIL
* Firestore source of truth: PASS/FAIL

## Desktop Protection

* Desktop Lab Assistant UI changed: MUST BE NO
* Desktop visual regression: PASS/FAIL
* Desktop functionality regression: PASS/FAIL

## Backend Protection

* Firebase changed: NO unless genuinely required
* Authentication changed: NO
* RBAC changed: NO
* Existing Firestore collections changed: NO unless required
* Existing business logic changed: NO

## Validation

* JS syntax: PASS/FAIL
* Broken imports: PASS/FAIL
* Mock data introduced: MUST BE NO
* Unbounded reads introduced: MUST BE NO
* Exact files changed
* Git commit/hash

# STOP AFTER PHASE 5

Do not begin Librarian or Admin mobile redesign yet.

I will perform the actual Lab Assistant mobile testing before approving the next phase.
