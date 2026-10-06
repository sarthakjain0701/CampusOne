# CAMPUSONE — PHASE 8: GLOBAL MOBILE QA + RESPONSIVE INTEGRATION

Perform a **global mobile QA and responsive integration pass** across the entire CampusOne project.

All role-specific mobile UI phases have now been implemented.

This phase is for **integration, consistency, regression detection, and responsive fixes only**.

---

# 🚨 MOST IMPORTANT RULE

## DO NOT REDESIGN THE GUI

Do NOT introduce a new visual design in this phase.

Do NOT change the established mobile reference design.

Do NOT change desktop UI.

```text
Desktop > 900px
    ↓
EXISTING DESKTOP UI
❌ MUST REMAIN UNCHANGED

Mobile ≤ 900px
    ↓
APPROVED MOBILE UI
✅ QA + MINIMAL FIXES ONLY
```

Only fix genuine responsive, integration, navigation, lifecycle, accessibility, or mobile regression problems.

---

# 1. FIVE ROLES TO VERIFY

Perform a complete mobile integration check for:

```text
ADMIN
FACULTY
LAB_ASSISTANT
LIBRARIAN
STUDENT
```

Do not change their roles.

Do not change role resolution.

Do not change RBAC.

---

# 2. MOBILE BREAKPOINTS

Verify the application at:

```text
320px
360px
375px
390px
412px
430px
480px
600px
768px
900px
```

Check every role at appropriate widths.

At:

```text
> 900px
```

desktop UI must remain unchanged.

---

# 3. MOBILE DESIGN SYSTEM CONSISTENCY

Verify that all mobile modules consistently use the existing mobile foundation.

Check:

### Background

Light/sky-blue mobile visual system.

### Primary color

Existing CampusOne mobile blue/cyan palette.

### Cards

Consistent:

```text
16–20px radius
14–18px padding
subtle border
soft shadow
```

### Inputs

Approximately:

```text
46–48px
```

### Buttons

Approximately:

```text
44–48px
```

### Typography

Use the existing mobile typography hierarchy.

Do not introduce random fonts or font sizes.

---

# 4. CAMPUSONE BRANDING

Verify the entire mobile application uses:

**CampusOne**

and the provided CampusOne logo.

Search visible UI for:

```text
Poornima Group Of College
POORNIMA GROUP OF COLLEGE
Poornima Group of College
Poornima Attendance System
POORNIMA ATTENDANCE SYSTEM
PAMS
```

There must be no old application branding remaining in visible mobile UI unless it is legitimate user/data content rather than application branding.

Do NOT modify technical Firebase identifiers merely because they contain `poornima`.

---

# 5. GLOBAL MOBILE HEADER

Verify all roles use the same mobile header foundation.

Check:

```text
Logo
CampusOne
Notification
Profile
Menu/navigation
```

Verify:

* no overlap
* no clipping
* correct height
* correct safe-area spacing
* correct active state
* no duplicate headers
* no desktop sidebar accidentally appearing over mobile content

---

# 6. MOBILE NAVIGATION

Verify navigation separately for every role.

## STUDENT

```text
Dashboard
Attendance
Examinations
Digital Learning
Library
Notifications
Profile
```

## FACULTY

Use the approved Faculty mobile navigation.

Verify Faculty-only modules remain restricted.

## LAB ASSISTANT

```text
Dashboard
Laboratory
Digital Learning
Report Problem
My Reports
Notifications
Profile
```

### LAB ASSISTANT MUST NOT SHOW:

```text
Attendance
Timetable
Mid-Term Marks
Students
Classes
Subjects
Reports & Analytics
Admin Management
System Settings
```

## LIBRARIAN

Verify Library-specific navigation.

## ADMIN

Verify Admin navigation and More menu.

Do not add unauthorized routes.

---

# 7. ROLE ISOLATION

Test navigation logic conceptually/static-wise to ensure one role cannot accidentally inherit another role's mobile menu.

Verify:

```text
STUDENT ≠ FACULTY
FACULTY ≠ LAB_ASSISTANT
LAB_ASSISTANT ≠ LIBRARIAN
LIBRARIAN ≠ ADMIN
```

Do not modify authorization logic unless a genuine regression is discovered.

If a role visibility bug is found, make the smallest possible correction.

---

# 8. LOGIN RESPONSIVENESS

Verify the approved mobile Login UI at:

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

* campus background loads
* CampusOne logo loads
* login card fits
* email field fits
* password field fits
* login button fits
* keyboard does not permanently hide the button
* validation messages remain visible
* loading state works
* error state works

Do NOT modify authentication logic.

Do NOT create a second login implementation.

---

# 9. STUDENT MOBILE QA

Verify:

```text
Dashboard
Attendance
Examinations
Digital Learning
Library
Notifications
Profile
```

Special checks:

### Digital Learning

Both must be represented correctly:

```text
Faculty Digital Learning
Lab Assistant Digital Learning
```

### Attendance

Student remains view-only according to existing permissions.

### Library

Use real LibraryService data.

### Notifications

Use existing NotificationService.

Do not introduce mock data.

---

# 10. FACULTY MOBILE QA

Verify:

```text
Dashboard
Attendance
Mark Attendance
Attendance Assignments
Attendance History
Timetable
Assignments
Digital Learning
Examinations
Notifications
Profile
```

Special checks:

### Mark Attendance

Verify:

* class selection
* subject selection
* date
* student list
* Present/Absent controls
* Save Attendance
* existing attendance behavior

Do not change attendance business logic.

### Attendance History

Ensure it does not remain permanently on:

```text
Loading...
```

### Attendance Assignments

Ensure the page lifecycle correctly calls its required data-loading logic.

---

# 11. LAB ASSISTANT MOBILE QA

Verify:

```text
Dashboard
Laboratory
Digital Learning
Report Problem
My Reports
Notifications
Profile
```

### Report Problem

Verify UI supports:

```text
Laboratory
Category
Title
Description
Priority
Submit
```

Categories must support existing problem-report functionality such as:

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

### My Reports

Only the authenticated Lab Assistant's reports should be displayed.

Do not expose another Lab Assistant's reports through client-side filtering.

### Attendance

Must NOT appear in Lab Assistant mobile navigation.

Do not delete Attendance code.

---

# 12. LIBRARIAN MOBILE QA

Verify:

```text
Dashboard
Books
Book Copies
Members
Issue/Return
Reservations
Fines
Reports
Library Settings
Notifications
Profile
```

Verify institutional rules remain:

```text
15-day issue period
₹2/day overdue fine
Reminder days 13, 14, 15
```

Do not alter business logic.

Check:

* book search
* issue flow
* return flow
* reissue flow
* member search
* overdue records
* fines
* settings loading

---

# 13. ADMIN MOBILE QA

Verify:

```text
Dashboard
Users
Students
Faculty
Lab Assistants
Librarians
Departments
Classes
Subjects
Timetable
Examinations
Attendance Management
Library
Reports & Analytics
Digital Learning
Lab Problem Reports
Notifications
System Settings
Profile
```

Special attention:

### Dashboard

Check for:

```text
Loading dashboard data...
Fetching analytics...
```

that remains indefinitely.

Trace the actual lifecycle/service issue if found.

### Provision User

Ensure the existing secure provisioning architecture remains intact.

There must be no browser-side:

```text
createUserWithEmailAndPassword()
```

for Admin provisioning.

---

# 14. DATA SYNCHRONIZATION

Verify mobile screens use the same source of truth as desktop.

Search changed/mobile files for:

```text
MOCK_DATA
mockData
DataStore
localStorage
sessionStorage
```

Do not introduce any new client-side source of truth.

Existing Firebase/Firestore services remain authoritative.

---

# 15. FIRESTORE PERFORMANCE

Perform a static audit of mobile-related code for newly introduced:

```text
collection().get()
```

without appropriate filtering/limits.

Look specifically for:

* Students
* Faculty
* Books
* Transactions
* Notifications
* Learning resources
* Problem reports
* Attendance
* Assignments

Do not introduce unbounded reads.

Use existing service-level pagination/limits.

---

# 16. LISTENER CLEANUP

Check every mobile view using:

```text
onSnapshot
```

or equivalent listeners.

Verify listeners are:

* stored
* unsubscribed when leaving the page
* not duplicated when returning to the page
* not duplicated after repeated navigation

Pay special attention to:

```text
Library
Notifications
Faculty
Problem Reports
Learning
```

---

# 17. LOADING LIFECYCLE

Audit mobile views using:

```text
render()
afterRender()
App.postRenderView()
fetchData()
```

Verify that pages requiring `afterRender()` actually receive it.

Known patterns in this project have previously caused pages to remain permanently on:

```text
Loading...
```

Do a global check for this class of regression.

Do not create a second lifecycle system.

Use the existing `App.postRenderView()` architecture.

---

# 18. ASYNC JAVASCRIPT

Search mobile-related views/services for:

```text
await
async
Promise
```

Verify:

* `await` only appears inside async functions
* async service calls are actually awaited
* loading states are cleared
* rejected promises are handled
* no `undefined` values are passed to Firestore
* no `forEach` is called on unresolved Promise objects

Run syntax validation on all changed JS files.

---

# 19. MOBILE MODALS

Check every mobile modal:

* Add Student
* Add Faculty
* Provision User
* Add Department
* Add Class
* Add Subject
* Assign Faculty
* Report Problem
* Issue Book
* Return Book
* Settings
* other existing dialogs

Verify:

* modal fits screen
* content scrolls
* close button accessible
* buttons visible
* keyboard does not hide actions
* no horizontal overflow
* no accidental background interaction

Do not redesign modal functionality.

---

# 20. MOBILE TABLES

Audit:

* Attendance
* Attendance History
* Assignments
* Marks
* Students
* Faculty
* Books
* Transactions
* Fines
* Reports
* Timetable

Use:

```css
overflow-x: auto;
```

where appropriate.

Do not make tables unreadably small.

Do not remove important columns simply to make them fit.

---

# 21. TOUCH ACCESSIBILITY

Verify interactive controls have approximately:

```text
44px minimum touch target
```

where practical.

Check:

* buttons
* navigation items
* checkboxes
* attendance controls
* dropdowns
* table actions
* close buttons
* notification items

Use `:focus-visible` where appropriate.

Do not rely only on color to communicate status.

---

# 22. MOBILE ORIENTATION

Check:

```text
Portrait
Landscape
```

at mobile widths.

Ensure:

* content remains accessible
* fixed navigation does not cover content
* tables remain scrollable
* modals remain usable
* buttons remain visible

---

# 23. SAFE AREA

For mobile devices with notches/home indicators, verify appropriate safe-area handling for:

* top header
* bottom navigation
* fixed action buttons

Do not introduce excessive padding on desktop.

---

# 24. NO DESKTOP REGRESSION

This is critical.

Check that mobile CSS uses proper responsive isolation.

Examples:

```css
@media (max-width: 900px) {
    /* mobile-only changes */
}
```

Do not use global selectors that unintentionally change desktop.

Verify:

```text
Desktop > 900px
```

for all five roles.

Desktop must remain visually and functionally unchanged.

---

# 25. CROSS-ROLE DATA FLOW

Verify that mobile presentation does not break existing cross-module relationships.

Examples:

```text
Admin
  ↓
Provision Student
  ↓
Student Login
  ↓
Student Dashboard

Admin
  ↓
Provision Faculty
  ↓
Faculty Login
  ↓
Faculty Dashboard

Admin
  ↓
Provision Lab Assistant
  ↓
Lab Assistant Login
  ↓
Lab Problem Reports

Librarian
  ↓
Issue Book
  ↓
Student Library

Faculty
  ↓
Upload Learning Material
  ↓
Student Digital Learning

Lab Assistant
  ↓
Upload Lab Learning Material
  ↓
Student Digital Learning
```

Do not change backend workflows.

---

# 26. BRANDING AUDIT

Verify:

```text
CampusOne
```

is the visible application branding everywhere.

CampusOne logo must load correctly.

No visible old application branding should remain.

Do not change technical identifiers such as Firebase project IDs or existing Firestore collection names merely because they contain Poornima-related technical strings.

---

# 27. CSS AUDIT

Check for:

* duplicate mobile CSS
* conflicting media queries
* unnecessary `!important`
* global selectors affecting desktop
* duplicate variables
* inconsistent breakpoints
* broken overflow rules
* fixed elements covering content

Do not perform a large CSS rewrite.

Make only minimal corrective changes.

---

# 28. JAVASCRIPT AUDIT

Check for:

* duplicate event listeners
* duplicate navigation handlers
* duplicate Firebase initialization
* undefined globals
* missing exports
* missing `afterRender`
* unhandled promises
* stale references
* mobile-only code leaking into desktop

Do not refactor unrelated code.

---

# 29. ASSET AUDIT

Verify:

* CampusOne logo exists
* logo path works
* login background works
* no broken images
* no missing icons
* no unnecessary duplicate assets

Do not replace the campus background.

Do not redesign the CampusOne logo.

---

# 30. BUILD / STATIC VALIDATION

Run the project's appropriate existing validation/build process.

At minimum:

```text
JavaScript syntax validation
HTML/template validation where applicable
CSS validation where available
Broken-reference checks
```

Verify:

* no syntax errors
* no broken imports
* no missing files
* no duplicate Firebase initialization
* no new console errors caused by changed code
* no mock data introduced
* no unbounded reads introduced

---

# 31. GIT SAFETY

Before finishing:

Check:

```text
git status
git diff
```

Confirm only intended mobile/branding/QA files changed.

Do not commit unrelated generated files.

If committing, provide:

```text
Commit hash
Commit message
```

Do not push unrelated changes.

---

# 32. IMPORTANT — DO NOT CLAIM LIVE TESTING

Do NOT claim:

```text
Live testing PASS
Firebase write PASS
Firestore read-back PASS
Mobile browser PASS
```

unless an actual user-controlled browser/device test was performed.

I will perform the real mobile testing.

Your responsibility in this phase is:

```text
source inspection
static validation
responsive integration fixes
regression prevention
```

---

# 33. FINAL REPORT

Return a concise but complete report.

## Student

* Dashboard
* Attendance
* Examinations
* Digital Learning
* Faculty Learning
* Lab Learning
* Library
* Notifications
* Profile
* Navigation

## Faculty

* Dashboard
* Attendance
* Attendance Assignments
* Attendance History
* Timetable
* Assignments
* Digital Learning
* Examinations
* Notifications
* Profile

## Lab Assistant

* Dashboard
* Laboratory
* Digital Learning
* Report Problem
* My Reports
* Notifications
* Profile
* Attendance hidden

## Librarian

* Dashboard
* Books
* Book Copies
* Members
* Issue/Return
* Reservations
* Fines
* Reports
* Settings
* Notifications
* Profile

## Admin

* Dashboard
* User Management
* Academic Management
* Examinations
* Attendance
* Library
* Lab Problem Reports
* Reports & Analytics
* Digital Learning
* Notifications
* Settings
* Profile

## Responsive QA

Report each:

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

as PASS/FAIL based on static/source inspection.

## Desktop Protection

* Desktop UI changed: MUST BE NO
* Desktop CSS regression: PASS/FAIL
* Desktop route regression: PASS/FAIL
* Desktop functionality regression: PASS/FAIL

## Security

* Firebase Auth changed: NO
* RBAC changed: NO
* Firestore rules changed: NO
* Cloud Functions changed: NO
* Browser-side provisioning introduced: NO
* Existing security architecture preserved: PASS/FAIL

## Performance

* New unbounded Firestore reads: MUST BE NO
* New unnecessary listeners: MUST BE NO
* Listener cleanup: PASS/FAIL
* Async lifecycle: PASS/FAIL

## Branding

* CampusOne branding: PASS/FAIL
* CampusOne logo: PASS/FAIL
* Old visible branding removed: PASS/FAIL

## Files

List every changed file.

## Git

Provide commit/hash if committed.

# STOP AFTER PHASE 8

Do not start another redesign automatically.

Wait for my actual mobile/device testing results.

If a live-testing issue is found, we will create a **targeted Phase 9 fix** for that issue rather than changing the whole GUI again.
