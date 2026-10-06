# CAMPUSONE — PHASE 11: FINAL MOBILE UAT & RELEASE READINESS

This is the **final validation phase** for the mobile-responsive CampusOne UI.

Do NOT redesign the UI.

Do NOT add new features.

Do NOT change Firebase architecture, Firestore schema, Authentication, Cloud Functions, RBAC, routes, or business logic.

The purpose is to verify that the mobile UI implementation is stable and ready for real user testing.

---

## 1. PROJECT SAFETY

First inspect the current project state.

Confirm:

* current Git branch
* working tree status
* current frontend structure
* active CSS files
* active JS files
* active views
* Firebase integration
* role configuration

Do not overwrite unrelated work.

Do not revert previously implemented mobile changes.

---

# 2. MOBILE BREAKPOINT VALIDATION

Verify the UI at:

* 320px
* 360px
* 375px
* 390px
* 414px
* 480px
* 600px
* 768px
* 900px

Confirm:

* no horizontal page overflow
* no clipped buttons
* no overlapping cards
* no broken navigation
* no unreadable text
* no broken modals
* no elements extending outside viewport
* tables remain usable
* forms remain usable

Desktop layouts above 900px must remain unchanged.

---

# 3. LOGIN / LOGOUT

Verify source code and lifecycle for:

* Login
* Logout
* Session restoration
* Role resolution
* Loading state
* Authentication error state
* Password field
* Forgot password if already supported
* Redirect after login

Do NOT modify authentication logic.

Confirm there is only one authentication flow.

Do NOT introduce:

```js
createUserWithEmailAndPassword()
```

into the frontend.

---

# 4. STUDENT MOBILE

Verify mobile UI coverage for:

### Dashboard

* statistics/cards
* quick actions
* recent information

### Attendance

* attendance information
* subject information
* readable mobile layout

### Examinations

* available exam information
* relevant student information

### Digital Learning

Verify the combined structure:

```text
Digital Learning

├── Faculty Learning
└── Lab Assistant Learning
```

Students must remain view-only.

### Library

Verify:

* issued books
* issue date
* due date
* return status
* overdue
* fines

### Notifications

### Profile

Confirm no administrative controls appear.

---

# 5. FACULTY MOBILE

Verify:

* Dashboard
* Attendance
* Attendance Assignments
* Attendance History
* Timetable
* Assignments
* Digital Learning
* Notifications
* Profile

Confirm faculty cannot access Admin-only functions.

Confirm attendance functionality remains unchanged.

---

# 6. LAB ASSISTANT MOBILE

Verify the intended navigation:

```text
Dashboard
Laboratory
Digital Learning
Report Problem
My Reports
Notifications
Profile
```

IMPORTANT:

Attendance must NOT appear in the Lab Assistant mobile navigation.

Timetable must NOT appear.

Mid-Term Marks must NOT appear.

Verify:

### Report Problem

* category
* title
* description
* priority
* submit action
* loading state
* error state

### My Reports

* submitted reports
* status
* priority
* timestamps

Do not change the existing backend/report architecture.

---

# 7. LIBRARIAN MOBILE

Verify:

```text
Dashboard
Books
Book Copies
Members
Issue / Return
Reservations
Fines
Reports
Notifications
Profile
```

Verify library workflows remain functional.

Institutional library rules remain:

* Maximum issue period: 15 days
* Fine: ₹2/day after due period
* Reminder: days 13, 14 and 15

Do not silently change these rules.

---

# 8. ADMIN MOBILE

Verify the mobile Admin interface.

Primary navigation may remain:

```text
Dashboard
Users
Academics
Library
More
```

Verify access to existing Admin functionality through appropriate sections.

Confirm:

* User management
* Student management
* Faculty management
* Lab Assistant management
* Librarian management
* Academic management
* Library administration
* Reports
* Notifications
* Settings
* Profile

Admin provisioning must continue using the existing secure architecture.

Do NOT implement client-side account creation.

---

# 9. RBAC SECURITY CHECK

Inspect role-based navigation and route guards for:

```text
ADMIN
FACULTY
LAB_ASSISTANT
LIBRARIAN
STUDENT
```

Confirm:

* Student cannot access Admin UI
* Student cannot access Faculty management
* Faculty cannot access Admin functions
* Lab Assistant cannot access Attendance
* Lab Assistant cannot access Faculty-only academic functions
* Librarian cannot access unrestricted academic administration
* Admin retains required administrative access

Do not weaken Firestore rules or route protection.

---

# 10. FIREBASE / FIRESTORE SAFETY

Perform static inspection only.

Confirm:

* Firebase initialization is not duplicated
* Firestore remains the source of truth
* no new mock data
* no new localStorage source of truth
* no accidental DataStore fallback
* no hardcoded credentials
* no plaintext passwords
* no client-side Admin SDK
* no unnecessary Firestore reads
* no unbounded listeners
* listeners are cleaned up
* async operations are awaited correctly

Do not perform destructive production writes.

---

# 11. ASYNC LIFECYCLE CHECK

Because previous loading-screen issues were caused by missing `afterRender()` lifecycle calls, specifically inspect:

```text
App.renderCurrentView()
App.postRenderView()
View.render()
View.afterRender()
```

Check every active route that uses `afterRender()`.

Confirm no route can remain permanently stuck on:

```text
Loading...
Loading attendance...
Loading timetable...
Loading library...
Loading configuration...
```

without a valid reason.

Check especially:

* mark-attendance
* attendance-assignments
* attendance-history
* timetable
* library-settings
* library
* notifications
* digital learning
* report problem
* admin pages

---

# 12. ERROR HANDLING

Every important asynchronous mobile operation should have:

```text
Loading
Success
Empty
Error
Retry
```

where appropriate.

Do not leave blank screens after an exception.

Do not hide errors using empty catch blocks.

---

# 13. MOBILE TABLES

Verify data-heavy screens.

Tables should:

* remain readable
* support horizontal scrolling where necessary
* not shrink text excessively
* maintain aligned columns
* keep action controls usable
* avoid overflowing the viewport

Do not convert existing data tables into decorative cards unnecessarily.

---

# 14. MOBILE MODALS

Verify:

* Add User
* Add Student
* Add Faculty
* Add Class
* Add Subject
* Attendance
* Library Issue/Return
* Report Problem
* Settings
* Confirmation dialogs

Confirm:

* modal fits viewport
* close button works
* keyboard does not hide important fields
* buttons remain accessible
* scrolling works inside long forms

---

# 15. TOUCH ACCESSIBILITY

Verify interactive elements are comfortable for touch.

Target approximately:

```text
44px minimum touch area
```

Check:

* buttons
* navigation
* bottom navigation
* dropdowns
* checkboxes
* attendance controls
* table actions
* modal controls

Do not reduce desktop controls unnecessarily.

---

# 16. BRANDING

Current visible application branding is:

**CampusOne**

Do not change it back to:

**Poornima Group Of College**

Do not rename technical identifiers.

Verify CampusOne branding is consistent across:

* login
* sidebar
* mobile header
* dashboard
* page titles
* loading states
* empty states
* notifications
* profile
* browser title where applicable

Use the approved CampusOne logo if it is already present in the project.

Do not redesign the interface because of branding.

---

# 17. DESKTOP REGRESSION PROTECTION

This is critical.

Confirm mobile CSS is isolated through responsive rules/media queries.

Desktop above 900px must retain:

* existing layout
* existing sidebar
* existing tables
* existing dashboard
* existing login layout
* existing spacing
* existing functionality

Do not rewrite desktop components unnecessarily.

---

# 18. STATIC VALIDATION

Run appropriate static checks.

At minimum:

```bash
node -c js/app.js
```

Then syntax-check all modified JavaScript files.

Also inspect:

* broken imports
* undefined globals
* duplicate IDs
* duplicate Firebase initialization
* missing assets
* missing view exports
* invalid CSS
* invalid media queries
* broken route references

Build if the project has an existing build process.

Do not introduce a new build system.

---

# 19. GIT SAFETY

Before finishing:

```bash
git status
git diff --stat
git diff
```

Do not commit unrelated files.

Do not revert previous valid work.

Report exactly:

### Files changed

List every changed file.

### Files deleted

List any deleted files.

### Files intentionally untouched

Mention Firebase/backend/security files that were not modified.

---

# 20. FINAL REPORT

Return a concise report with:

```text
PHASE 11 — FINAL MOBILE UAT READINESS

Mobile Breakpoints: PASS / FAIL
Login Lifecycle: PASS / FAIL
Student UI: PASS / FAIL
Faculty UI: PASS / FAIL
Lab Assistant UI: PASS / FAIL
Librarian UI: PASS / FAIL
Admin UI: PASS / FAIL
RBAC Inspection: PASS / FAIL
Firebase Safety: PASS / FAIL
Async Lifecycle: PASS / FAIL
Error Handling: PASS / FAIL
Tables: PASS / FAIL
Modals: PASS / FAIL
Touch Accessibility: PASS / FAIL
CampusOne Branding: PASS / FAIL
Desktop Protection: PASS / FAIL
Static Validation: PASS / FAIL
Git Safety: PASS / FAIL
```

For every FAIL:

* identify the exact file
* explain the root cause
* make only the smallest targeted fix
* rerun static validation

Do NOT claim live testing.

The user will perform actual mobile/browser testing.

---

# FINAL RULE

If all static checks pass:

**STOP HERE.**

Do not start another redesign phase.

Do not add unnecessary features.

The remaining work should be based only on actual issues found by the user during real mobile testing.
