# CAMPUSONE — PHASE 4: FACULTY MOBILE UI

Implement **ONLY the Faculty mobile interface** for CampusOne.

Use the uploaded **CampusOne Mobile UI Reference** as the visual reference and reuse the mobile foundation created in Phases 1–3.

---

## 🚨 ABSOLUTE RULE — DESKTOP MUST NOT CHANGE

```text
Desktop > 900px
    ↓
EXISTING FACULTY UI
❌ DO NOT CHANGE

Mobile ≤ 900px
    ↓
FACULTY MOBILE UI
✅ IMPLEMENT
```

Do not redesign, replace, remove, or restructure the existing desktop Faculty interface.

Do not modify Firebase, Firestore, Authentication, RBAC, Cloud Functions, or business logic.

---

# 1. FACULTY MOBILE NAVIGATION

Use the existing Faculty RBAC and routes.

The mobile Faculty navigation should contain only Faculty-appropriate modules.

Recommended structure:

```text
Dashboard
Attendance
Attendance Assignments
Attendance History
Examinations
Digital Learning
Library
Notifications
Profile
```

Only include modules that already exist and are permitted for `FACULTY`.

Do NOT expose:

* Admin Management
* Students Management
* Class Management
* Subject Management
* Reports & Analytics
* System Settings
* User Provisioning
* Admin-only Library Management

Do not create duplicate routes.

---

# 2. MOBILE HEADER

Create/reuse the Phase 1 mobile header:

```text
┌──────────────────────────────┐
│ ☰  POORNIMA       🔔  Profile│
└──────────────────────────────┘
```

Use:

**POORNIMA GROUP OF COLLEGE**

Keep the header compact and touch-friendly.

Do not change the desktop header.

---

# 3. FACULTY DASHBOARD

Create a mobile-first Faculty Dashboard.

Suggested structure:

```text
Welcome Faculty
        ↓
Today's Summary
        ↓
Attendance Quick Actions
        ↓
Today's Classes
        ↓
Assignments
        ↓
Digital Learning
        ↓
Notifications
```

Use real Firebase data only.

No mock dashboard numbers.

---

# 4. FACULTY WELCOME SECTION

Display the authenticated faculty's actual profile.

Example:

```text
Good Morning 👋

Shivansh Jain
Faculty
Department: CSE
```

Use the actual Faculty profile from:

```text
faculties/{email}
```

Do not hardcode faculty information.

---

# 5. TODAY'S SUMMARY

Create compact mobile cards such as:

```text
┌──────────────┐
│ Today's      │
│ Classes      │
│ 4            │
└──────────────┘

┌──────────────┐
│ Attendance   │
│ Sessions     │
│ 3            │
└──────────────┘
```

Only show values supported by existing services/data.

Do not invent statistics.

---

# 6. ATTENDANCE QUICK ACTIONS

Create large touch-friendly actions:

```text
[ Mark Attendance ]

[ Attendance Assignments ]

[ Attendance History ]
```

Use existing routes.

Do not modify AttendanceService logic.

Do not create a second attendance implementation.

---

# 7. MARK ATTENDANCE MOBILE UI

Optimize the existing Faculty attendance screen for mobile.

Example:

```text
Class
[ CSE-A ]

Subject
[ Data Structures ]

Date
[ 12 Sep 2026 ]

────────────────────

Students

Rahul Sharma
[ Present ] [ Absent ]

Priya Jain
[ Present ] [ Absent ]

Amit Kumar
[ Present ] [ Absent ]

────────────────────

[ Save Attendance ]
```

Requirements:

* touch-friendly controls
* readable student names
* clear Present/Absent state
* sticky/visible Save button where appropriate
* no accidental taps
* preserve existing attendance workflow

Do not change attendance calculations or Firestore schema.

---

# 8. ATTENDANCE ASSIGNMENTS

Make the existing Attendance Assignments module mobile-friendly.

The Faculty should be able to:

* view assignments
* create assignments if permitted
* select class/section
* select subject
* select faculty where allowed
* review assignment
* save assignment

If the current assignment form uses the 4-step wizard, keep the existing functionality but make it mobile-friendly.

Do not change assignment business rules.

---

# 9. ATTENDANCE HISTORY

Convert the existing Attendance History UI into a mobile-readable layout.

Use:

```text
Date
Subject
Class
Present
Absent
Status
```

For dense records, allow horizontal scrolling.

Do not remove information merely to make it fit.

Use pagination/bounded queries already provided by the existing service.

---

# 10. TODAY'S CLASSES

Show today's real timetable/scheduled sessions.

Example:

```text
Today's Classes

09:00 – 10:00
Data Structures
CSE-A
Room 201

11:00 – 12:00
Database Management
CSE-B
Room 204
```

Use the existing timetable data.

Do not create fake timetable entries.

If no class exists:

```text
No classes scheduled for today.
```

Do not show an infinite loading state.

---

# 11. ASSIGNMENTS

Show Faculty's existing assignments.

Example:

```text
Assignments

DBMS Assignment
CSE-A
Due: 18 Sep

Data Structures Assignment
CSE-B
Due: 20 Sep
```

Use real AssignmentService data.

Do not fetch the entire assignment collection unnecessarily.

---

# 12. DIGITAL LEARNING

Create a mobile-friendly Faculty Digital Learning section.

Faculty should be able to use existing functionality for:

* upload/add learning material
* view materials
* edit where permitted
* delete where permitted
* filter/search
* categorize content

Use existing LearningService.

Do not create a duplicate collection.

Do not change Student Digital Learning behavior.

---

# 13. EXAMINATIONS

Make existing Faculty examination functionality responsive.

Only expose Faculty-authorized features.

Possible existing areas:

```text
Exam Results
Mid-Term Marks
Exam Forms
Hall Ticket-related academic workflows
```

Do not expose Admin-only exam management.

Do not modify examination business logic.

---

# 14. EXAM RESULTS / MARKS

Where Faculty enters or views marks:

Use a mobile-friendly structure.

Example:

```text
Student
Rahul Sharma

Marks
[ 78 ]

Status
[ Save ]
```

For multiple students, use a horizontally scrollable table where appropriate.

Do not alter marks calculation, validation, or Firestore schema.

---

# 15. LIBRARY

If Faculty has an existing Library view, keep only the existing permitted functionality.

Do not expose:

* Book administration
* Book-copy administration
* Fine management
* Library settings
* Member administration

Those remain Librarian/Admin functionality.

---

# 16. NOTIFICATIONS

Use the existing NotificationService.

Show real Faculty notifications.

Example:

```text
Notifications

● New class assignment
● Attendance reminder
● New learning material
```

Do not create mock notifications.

Preserve unread/read functionality.

---

# 17. PROFILE

Create a mobile-friendly Faculty Profile using existing data.

Display:

```text
Name
Email
Department
Designation
Role
```

Use the existing Faculty profile.

Do not change role or authorization fields from the client.

---

# 18. MOBILE CARDS

Follow the Phase 1 mobile design system.

Use:

```text
border-radius: 16–20px
padding: 14–18px
soft shadow
subtle border
comfortable spacing
```

Use the light/sky-blue CampusOne mobile theme.

Avoid excessive glass effects on data-heavy screens.

---

# 19. MOBILE TABLES

Faculty frequently works with structured data.

For:

* Attendance
* Attendance History
* Assignments
* Marks
* Timetable
* Exam records

Use proper tabular structures.

On narrow screens:

```css
overflow-x: auto;
```

Do not make text tiny just to fit the screen.

---

# 20. MOBILE FORMS

All Faculty forms should use touch-friendly controls:

```text
Label
[ Input ]

Label
[ Dropdown ]

[ Save ]
```

Recommended:

```text
Input height: 46–48px
Button height: 44–48px
```

Do not change validation or submission logic.

---

# 21. BOTTOM NAVIGATION

Reuse the mobile navigation system created previously.

Recommended primary navigation:

```text
Home
Attendance
Learning
Exams
More
```

The More section can contain:

```text
Attendance Assignments
Attendance History
Library
Notifications
Profile
```

Use existing routes.

Do not create duplicate navigation systems.

---

# 22. RESPONSIVE WIDTHS

Verify Faculty UI at:

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
* no clipped buttons
* no clipped modal
* no overlapping header
* bottom navigation does not cover content
* tables remain usable
* forms remain readable
* touch controls remain at least approximately 44px

---

# 23. LOADING / EMPTY / ERROR STATES

Every Faculty mobile page must have proper states.

### Loading

```text
Loading...
```

with appropriate skeleton/spinner.

### Empty

```text
No attendance records found.
```

### Error

```text
Unable to load data.
[ Retry ]
```

Never leave a page permanently stuck on:

```text
Loading...
```

Trace the existing:

```text
render()
afterRender()
App.postRenderView()
```

lifecycle where applicable.

Do not create duplicate lifecycle systems.

---

# 24. DATA SOURCE

Faculty mobile UI must use the same services as desktop.

Use existing:

```text
FacultyService
AttendanceService
AttendanceAssignmentService
TimetableService
AssignmentService
LearningService
ExamResultService
NotificationService
```

Do not introduce:

* mock data
* static arrays
* localStorage
* sessionStorage
* DataStore
* duplicate Firestore collections

Firebase/Firestore remains the source of truth.

---

# 25. PERFORMANCE

Do not load every Faculty-related dataset when opening Dashboard.

Use:

* bounded queries
* existing pagination
* targeted Faculty UID/email queries
* lazy loading
* existing service-level limits

Do not introduce unbounded Firestore reads.

Do not introduce unnecessary realtime listeners.

---

# 26. RBAC

Do not modify:

* AuthorizationService
* roleConfig
* Firestore rules
* Faculty role resolution
* authentication
* permissions

The mobile UI must inherit the existing:

```text
FACULTY
```

permissions.

Do not convert Faculty into Admin or another role.

---

# 27. DESKTOP PROTECTION

Before finishing, verify that no desktop CSS was unintentionally changed.

Desktop Faculty:

```text
Dashboard
Attendance
Assignments
Attendance History
Digital Learning
Examinations
Notifications
Profile
```

must retain the existing desktop layout and functionality.

Mobile CSS should be isolated using responsive media queries/mobile classes.

---

# 28. STATIC VALIDATION

Run:

```text
node --check
```

for every changed JavaScript file.

Also verify:

* no broken imports
* no missing globals
* no duplicate routes
* no duplicate Firebase initialization
* no duplicate navigation
* no mock data introduced
* no new localStorage/sessionStorage source of truth
* no unbounded Firestore reads
* no RBAC regression

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

# 29. FILE CHANGE CONTROL

Only modify files required for Faculty mobile UI.

Do NOT modify unrelated:

* Student mobile UI
* Lab Assistant
* Librarian
* Admin
* Firebase backend
* Firestore rules
* Cloud Functions

Do not alter desktop layout intentionally.

---

# 30. FINAL REPORT

Return:

### Faculty Mobile

* Mobile Dashboard: PASS/FAIL
* Attendance: PASS/FAIL
* Mark Attendance: PASS/FAIL
* Attendance Assignments: PASS/FAIL
* Attendance History: PASS/FAIL
* Timetable: PASS/FAIL
* Assignments: PASS/FAIL
* Digital Learning: PASS/FAIL
* Examinations: PASS/FAIL
* Notifications: PASS/FAIL
* Profile: PASS/FAIL
* Mobile navigation: PASS/FAIL
* Responsive testing: PASS/FAIL

### Desktop Protection

* Desktop Faculty UI changed: MUST BE NO
* Desktop visual regression: PASS/FAIL
* Desktop functionality regression: PASS/FAIL

### Backend Protection

* Firebase changed: NO
* Firestore changed: NO
* Authentication changed: NO
* RBAC changed: NO
* Business logic changed: NO

### Validation

* JS syntax: PASS/FAIL
* Broken imports: PASS/FAIL
* Mock data introduced: MUST BE NO
* Unbounded reads introduced: MUST BE NO
* Exact files changed
* Git commit/hash

## STOP AFTER PHASE 4

Do not start Lab Assistant, Librarian, or Admin mobile redesign yet.

I will perform the actual Faculty mobile testing before approving the next phase.
