# CAMPUSONE — PHASE 3: STUDENT MOBILE UI

Implement **ONLY the Student mobile interface** for CampusOne.

Use the uploaded **CampusOne Mobile UI Reference** as the visual reference.

## 🚨 ABSOLUTE RULE

### DO NOT CHANGE DESKTOP STUDENT UI

Desktop must remain exactly as it currently works and looks.

```text
Desktop > 900px
    ↓
EXISTING STUDENT UI
❌ DO NOT TOUCH

Mobile ≤ 900px
    ↓
NEW STUDENT MOBILE UI
✅ IMPLEMENT
```

Do not modify desktop CSS/layout/functionality while implementing this phase.

---

# 1. STUDENT MOBILE SIDEBAR / NAVIGATION

For mobile, use the existing Student permissions and routes.

The mobile navigation should contain the appropriate existing Student modules:

```text
Dashboard
Attendance
Examinations
Digital Learning
Library
Notifications
Profile
```

Do NOT create duplicate routes.

Do NOT change RBAC.

Do NOT expose:

* Admin Management
* Faculty Management
* Class Management
* Subject Management
* Reports & Analytics
* System Settings
* Attendance Administration
* Faculty-only functions

The mobile navigation should use the same authorization logic as desktop.

---

# 2. MOBILE APP HEADER

Create a compact Student mobile header:

```text
┌──────────────────────────────┐
│ ☰  POORNIMA       🔔  Profile│
└──────────────────────────────┘
```

Use existing CampusOne/Poornima branding.

Keep it visually consistent with the mobile reference.

Do not modify desktop header.

---

# 3. STUDENT DASHBOARD

Redesign the Student Dashboard **only at mobile breakpoint**.

Use the reference structure:

```text
Welcome section
        ↓
Attendance summary
        ↓
Quick actions
        ↓
Digital Learning
        ↓
Library
        ↓
Recent activity
```

Do not use fake data.

All values must come from the existing Firebase/Firestore services.

---

# 4. WELCOME SECTION

Display the student's existing real profile information.

Example:

```text
Good Morning 👋

Siddhant Jain
PIET25CS158
CSE • Section C
```

Use the actual authenticated/profile data.

Do not hardcode student names, registration numbers, department or section.

---

# 5. ATTENDANCE CARD

Create a compact mobile attendance card.

Example:

```text
┌────────────────────────────┐
│ Attendance                 │
│                            │
│ 92%                        │
│ Overall Attendance         │
│                            │
│ Present     46             │
│ Absent       4             │
└────────────────────────────┘
```

Use the existing AttendanceService/data source.

Do NOT change attendance calculations.

Do NOT add new Firestore fields.

Do NOT modify attendance business logic.

---

# 6. QUICK ACTIONS

Create mobile-friendly quick-action cards/buttons for existing Student features.

For example:

```text
┌─────────────┐ ┌─────────────┐
│ Attendance  │ │ Exams       │
└─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐
│ Learning    │ │ Library     │
└─────────────┘ └─────────────┘
```

Each action must navigate using the existing CampusOne routes.

Do not create duplicate navigation logic.

---

# 7. DIGITAL LEARNING

The Student Digital Learning module must support BOTH existing learning sources.

### Faculty Digital Learning

Show faculty-uploaded academic content.

### Lab Assistant Digital Learning

Show lab-related learning content such as:

* lab manuals
* practical guides
* experiment procedures
* equipment manuals
* safety resources
* lab learning material

Use the existing learning resource architecture and Firestore source of truth.

Do NOT create a duplicate learning collection unless the existing architecture genuinely requires it.

Use the actual uploader/role metadata already present in the project.

---

# 8. LEARNING UI

On mobile, use:

```text
┌────────────────────────────┐
│ Digital Learning           │
│                            │
│ Faculty Learning           │
│ ┌────────────────────────┐ │
│ │ Data Structures        │ │
│ │ Lecture Notes          │ │
│ │ Faculty • PDF          │ │
│ └────────────────────────┘ │
│                            │
│ Lab Learning               │
│ ┌────────────────────────┐ │
│ │ DBMS Lab Manual        │ │
│ │ Practical Guide        │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

Use tabs or clearly separated sections.

Do not create separate sidebar routes for Faculty Learning and Lab Learning.

---

# 9. EXAMINATIONS

Create a mobile-friendly Examination section using existing functionality.

Potential existing content:

```text
Upcoming Exams
Hall Tickets
Exam Forms
Results
Mid-Term information
```

Only display modules that the existing Student RBAC allows.

Do not expose administrative exam management.

Do not change exam logic.

Cards should be compact and vertically stacked.

---

# 10. HALL TICKET

If Hall Ticket is available to the Student:

Create a mobile-friendly card:

```text
Exam
Subject
Subject Code
Exam Date
Exam Time
Status

[ View Hall Ticket ]
```

Keep the existing Hall Ticket functionality.

Do NOT change PDF/print logic.

Do NOT change exam data.

---

# 11. LIBRARY

Create a mobile-friendly Student Library summary.

Show real data such as:

```text
Currently Issued
Due Soon
Overdue
Fine
```

Example:

```text
┌────────────────────────────┐
│ Library                    │
│                            │
│ 2 Books Issued             │
│ 1 Due Soon                 │
│ ₹0 Fine                    │
│                            │
│ [ View Library ]           │
└────────────────────────────┘
```

Use the existing LibraryService.

Do not create fake book records.

---

# 12. NOTIFICATIONS

Create a mobile notification preview.

Show real notifications only.

Example:

```text
Notifications

● Library book due in 2 days
● New Digital Learning material
● Exam notification
```

Use the existing NotificationService.

Do not create mock notifications.

Unread/read functionality must remain unchanged.

---

# 13. PROFILE

Create a mobile-friendly Student Profile.

Display existing profile data:

```text
Name
Email
Registration Number
Department
Semester
Section
Academic Year
```

Use existing StudentService/profile data.

Do not change profile schema.

Do not allow editing fields that are currently read-only.

---

# 14. MOBILE CARDS

Use the Phase 1 mobile design system.

Cards should have:

```text
border-radius: 16–20px
padding: 14–18px
subtle border
soft shadow
comfortable spacing
```

Use the reference's blue/cyan visual direction.

Do not make cards excessively large.

---

# 15. STUDENT MOBILE TABLES

For Attendance History, Exam Results, Library records and other structured data:

Do not destroy the table semantics.

On mobile:

* allow horizontal scrolling when required
* keep readable font size
* maintain column meaning
* preserve actions
* avoid extremely compressed tables

For simple records, compact mobile cards may be used where the existing data is not naturally tabular.

---

# 16. MOBILE FORMS

Any Student forms should become:

```text
Label
[ Input ]

Label
[ Input ]

[ Primary Action ]
```

Use 44–48px touch-friendly controls.

Do not modify validation or submission logic.

---

# 17. BOTTOM NAVIGATION

Use the mobile reference's bottom-navigation approach.

Keep the most important Student areas accessible.

Recommended:

```text
┌──────────────────────────────┐
│ Home │ Attendance │ Learn │ More │
└──────────────────────────────┘
```

If the project already has an appropriate mobile navigation system from Phase 1, reuse it.

Do not create another navigation implementation.

"More" can expose:

```text
Examinations
Library
Notifications
Profile
```

Use existing routes.

---

# 18. RESPONSIVE BEHAVIOR

Test visually for:

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

Ensure:

* no horizontal page overflow
* cards fit screen
* buttons remain tappable
* text does not clip
* modals remain usable
* tables scroll correctly
* bottom navigation does not cover content
* fixed elements respect safe areas

---

# 19. DATA SOURCE — CRITICAL

Student mobile UI must use the **same real data sources as desktop**.

Do NOT introduce:

* mock data
* static arrays
* hardcoded students
* localStorage as source of truth
* sessionStorage as source of truth
* duplicate Firestore collections

Use existing services:

```text
StudentService
AttendanceService
Exam services
LearningService
LibraryService
NotificationService
```

Use the project's actual service APIs after inspecting them.

---

# 20. AUTHENTICATION AND RBAC

Do not modify:

* Firebase Authentication
* role resolution
* AuthorizationService
* Firestore rules
* Student permissions
* Firebase configuration

Mobile Student UI must inherit the existing authenticated Student identity.

---

# 21. DESKTOP PROTECTION

After implementation, verify that:

```text
Desktop Student Dashboard
Desktop Attendance
Desktop Exams
Desktop Digital Learning
Desktop Library
Desktop Notifications
Desktop Profile
```

look and behave exactly as before.

No desktop redesign is allowed in this phase.

---

# 22. PERFORMANCE

Do not load every Student module's full dataset on dashboard startup.

Use:

* existing summary services
* bounded queries
* existing pagination
* lazy loading where appropriate

Do not add unbounded Firestore reads.

Do not add permanent listeners unnecessarily.

---

# 23. STATIC VALIDATION

Run syntax checks for every changed JS file.

Check:

* no broken imports
* no missing globals
* no duplicate Firebase initialization
* no duplicate route
* no duplicate navigation
* no mock data
* no desktop CSS regression
* no RBAC changes

Search changed files for:

```text
createUserWithEmailAndPassword
MOCK_DATA
DataStore
localStorage
sessionStorage
```

Do not introduce any new prohibited data source.

---

# 24. FILE CHANGE CONTROL

Only change files necessary for the Student mobile UI.

Do NOT modify unrelated:

* Admin
* Faculty
* Lab Assistant
* Librarian
* backend
* Firebase configuration
* Firestore rules

Do not redesign desktop.

---

# 25. FINAL REPORT

Report:

### Student Mobile

* Mobile dashboard: PASS/FAIL
* Attendance: PASS/FAIL
* Examinations: PASS/FAIL
* Digital Learning: PASS/FAIL
* Faculty Learning visible: PASS/FAIL
* Lab Assistant Learning visible: PASS/FAIL
* Library: PASS/FAIL
* Notifications: PASS/FAIL
* Profile: PASS/FAIL
* Mobile navigation: PASS/FAIL
* Responsive widths: PASS/FAIL

### Desktop Protection

* Desktop Student UI changed: MUST BE NO
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
* Exact files changed: list them
* Git commit/hash: provide if committed

## STOP AFTER PHASE 3

Do not redesign Faculty, Lab Assistant, Librarian or Admin mobile UI yet.

I will perform the actual mobile testing before approving Phase 4.
