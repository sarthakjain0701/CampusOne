# CAMPUSONE — GLOBAL BRANDING UPDATE ONLY

Update the existing CampusOne project branding across **ALL modules and screens**.

The user has provided the official **CampusOne logo** as the new branding asset.

## 🚨 CRITICAL RULE

This is a **BRANDING-ONLY change**.

### DO NOT redesign the GUI.

Do NOT change:

* layout
* colors
* gradients
* typography
* spacing
* cards
* tables
* buttons
* forms
* sidebar design
* header design
* mobile UI
* desktop UI
* responsive behavior
* animations
* hover effects
* dashboard structure
* module structure
* routes
* Firebase
* Firestore
* Authentication
* RBAC
* Cloud Functions
* business logic
* data models
* services
* APIs

The current GUI must remain visually identical.

Only replace the **institution/application name and logo**.

---

# 1. NEW OFFICIAL BRANDING

Application/institution name:

```text
CampusOne
```

Use exactly:

**CampusOne**

Do not use:

```text
Poornima Group Of College
POORNIMA GROUP OF COLLEGE
Poornima Group of College
Poornima Attendance System
PAMS
```

as the visible application/institution branding where they are currently being used as the product/portal name.

---

# 2. LOGO

Use the **uploaded CampusOne logo** provided with this task.

Do NOT redesign, recreate, recolor, crop, simplify, or modify the logo.

Use the uploaded logo exactly as provided.

Preserve its original visual appearance and transparency.

If necessary, copy the uploaded logo into the project's existing appropriate assets/images directory.

Use the project's existing asset-loading convention.

Do NOT introduce an external image URL when the uploaded local asset can be used.

---

# 3. PROJECT-WIDE BRANDING SEARCH

Perform a complete frontend project search for visible branding references.

Search for:

```text
CampusOne
CAMPUSONE
campusone

Poornima Group Of College
POORNIMA GROUP OF COLLEGE
Poornima Group of College

Poornima Attendance System
POORNIMA ATTENDANCE SYSTEM
PAMS
```

Also search for:

```text
logo
brand
application name
portal name
institution name
```

Only change occurrences that are **visible UI/application branding**.

---

# 4. SIDEBAR

Keep the existing sidebar design exactly the same.

Only update its branding.

Example:

```text
[ CampusOne Logo ]

CampusOne

Dashboard
...
```

Do NOT change:

* sidebar width
* colors
* spacing
* navigation structure
* icons
* hover effects
* active states

Only replace the existing logo/name.

---

# 5. TOP HEADER

Keep the existing top header exactly as it is.

If the current header displays the old institution/product name, replace it with:

```text
CampusOne
```

Do not change the header layout.

---

# 6. LOGIN PAGE

Keep the current login GUI exactly unchanged.

Do NOT redesign the login page.

Only update:

### Logo

Replace the existing Poornima logo with the provided CampusOne logo.

### Application name

Replace the existing visible institution/product name with:

```text
CampusOne
```

If the current login page contains:

```text
POORNIMA GROUP OF COLLEGE
```

replace only that branding text with:

```text
CampusOne
```

Keep:

* existing campus background
* existing background blur
* existing panel position
* existing panel color
* existing glassmorphism
* existing inputs
* existing login button
* existing motivational text
* existing animations

exactly unchanged.

---

# 7. ADMIN MODULE

Update only visible branding in:

* Admin Dashboard
* User Management
* Student Management
* Faculty Management
* Lab Assistant Management
* Librarian Management
* Department Management
* Class Management
* Subject Management
* Timetable
* Exam Management
* Library Management
* System Settings
* Reports
* Notifications
* Profile
* all Admin modals/dialogs

Replace old visible product/institution branding with:

**CampusOne**

Do not modify any Admin functionality.

---

# 8. FACULTY MODULE

Update visible branding only in:

* Faculty Dashboard
* Attendance
* Attendance Assignments
* Attendance History
* Digital Learning
* Assignments
* Examinations
* Timetable
* Notifications
* Profile
* all Faculty modals/dialogs

Use:

**CampusOne**

Do not change Faculty functionality.

---

# 9. STUDENT MODULE

Update visible branding only in:

* Student Dashboard
* Attendance
* Examinations
* Digital Learning
* Library
* Notifications
* Profile
* Hall Ticket
* Results
* all Student modals/dialogs

Use:

**CampusOne**

Do not change Student functionality.

---

# 10. LAB ASSISTANT MODULE

Update visible branding only in:

* Lab Assistant Dashboard
* Laboratory
* Digital Learning
* Report Problem
* My Reports
* Notifications
* Profile
* all Lab Assistant modals/dialogs

Use:

**CampusOne**

Do NOT re-add:

* Attendance
* Timetable
* Mid-Term Marks

The existing Lab Assistant navigation/functionality must remain unchanged.

---

# 11. LIBRARIAN MODULE

Update visible branding only in:

* Librarian Dashboard
* Books
* Book Copies
* Members
* Issue/Return
* Reservations
* Fines
* Reports
* Library Settings
* Notifications
* Profile
* all Librarian dialogs

Use:

**CampusOne**

Do not change Library functionality.

---

# 12. MOBILE UI

This branding update must also apply to the mobile UI.

Keep the mobile design exactly unchanged.

Only replace:

```text
old logo → CampusOne logo
old institution/product name → CampusOne
```

Do not change:

* mobile header
* bottom navigation
* mobile cards
* mobile spacing
* mobile colors
* responsive breakpoints
* mobile layouts

---

# 13. BROWSER TITLE / META

Where the visible browser/application title currently contains the old branding, update it appropriately to:

```text
CampusOne
```

Examples:

```html
<title>CampusOne</title>
```

If the project has page-specific titles, preserve their page name and only replace the product branding portion.

For example:

```text
CampusOne — Dashboard
CampusOne — Attendance
CampusOne — Library
```

Do not modify Firebase project IDs or technical configuration.

---

# 14. FAVICON

If the existing favicon uses the old Poornima logo and it is appropriate to replace it:

Use the provided CampusOne logo as the favicon/source asset.

Do not redesign the favicon.

If a dedicated favicon format is required, generate only the necessary technical size/crop while preserving the CampusOne logo's appearance.

---

# 15. LOADING / ERROR / EMPTY STATES

Search visible UI messages such as:

```text
Loading Poornima...
Welcome to Poornima...
Poornima Attendance System...
Poornima Group...
```

Replace only branding portions with:

```text
CampusOne
```

Do not alter the actual error/loading logic.

---

# 16. DOCUMENT / PRINT UI

Search printable pages and documents for visible old branding.

Examples:

* Hall Ticket
* reports
* library reports
* attendance reports
* printable documents

If an old visible product/institution name is present, replace it with:

```text
CampusOne
```

Do not change:

* A4 layout
* print CSS
* margins
* tables
* fonts
* QR codes
* exam information
* data

---

# 17. TECHNICAL IDENTIFIERS — DO NOT RENAME

This is extremely important.

Do NOT blindly rename technical identifiers such as:

```text
poornima-attendance-syst-aa3f1
authorizedUsers
faculties
admins
librarySettings
Firebase configuration
Firestore collection names
Cloud Function names
routes
service names
file names
Git repository identifiers
```

Do not modify Firebase project ID.

Do not modify Firestore collection names.

Do not modify database schema.

Do not modify Cloud Functions.

The requirement is to change **visible branding**, not technical architecture.

---

# 18. EXISTING CAMPUSONE REFERENCES

If the project already contains technical/internal `CampusOne` references, leave them intact.

Do not duplicate them.

Normalize the visible UI so that the official visible product name is:

```text
CampusOne
```

---

# 19. LOGO IMPLEMENTATION

Use one centralized CampusOne logo asset where possible.

Avoid having multiple copies of the logo unnecessarily.

If the project already has a centralized branding configuration/component, update that instead of hardcoding the logo into every page.

However, do not refactor unrelated code just for branding.

Keep the implementation minimal.

---

# 20. SEARCH FOR OLD LOGO REFERENCES

Search for:

```text
images.shiksha.com
Poornima logo
poornima logo
old logo asset
old favicon
```

Replace only visible branding asset references that belong to the application UI.

Do not remove unrelated images used as:

* campus backgrounds
* educational content
* user uploads
* learning material
* documentation
* unrelated assets

---

# 21. GUI MUST REMAIN IDENTICAL

Before and after this task, the following should remain visually unchanged except for the logo/name:

### Desktop

* Login
* Admin
* Faculty
* Student
* Lab Assistant
* Librarian

### Mobile

* Login
* Student
* Faculty
* Lab Assistant
* Librarian
* Admin

The only intentional visual changes are:

```text
OLD LOGO
   ↓
CAMPUSONE LOGO

OLD VISIBLE BRAND NAME
   ↓
CampusOne
```

---

# 22. DO NOT TOUCH FUNCTIONALITY

Do NOT modify:

* Firebase Authentication
* Firestore
* Cloud Functions
* Firebase configuration
* Firestore rules
* RBAC
* AuthorizationService
* attendance logic
* timetable logic
* library logic
* exam logic
* learning logic
* notification logic
* problem reporting
* provisioning
* API calls
* data synchronization

This must remain a branding-only change.

---

# 23. STATIC VALIDATION

After implementation:

### Search again for visible old branding:

```text
Poornima Group Of College
POORNIMA GROUP OF COLLEGE
Poornima Group of College
Poornima Attendance System
POORNIMA ATTENDANCE SYSTEM
PAMS
```

There should be **zero visible UI occurrences** unless intentionally required by an actual academic/data record.

### Verify:

* no broken image paths
* CampusOne logo loads
* no broken imports
* no duplicate Firebase initialization
* no changed Firestore collections
* no changed Firebase project ID
* no RBAC changes
* no route changes
* no backend changes
* no desktop layout changes
* no mobile layout changes

Run JavaScript syntax validation for changed JS files.

---

# 24. FINAL REPORT

Return:

## Branding

* Visible application name changed to `CampusOne`: PASS/FAIL
* CampusOne logo applied: PASS/FAIL
* Login branding: PASS/FAIL
* Sidebar branding: PASS/FAIL
* Header branding: PASS/FAIL
* Admin branding: PASS/FAIL
* Faculty branding: PASS/FAIL
* Student branding: PASS/FAIL
* Lab Assistant branding: PASS/FAIL
* Librarian branding: PASS/FAIL
* Mobile branding: PASS/FAIL
* Browser title/favicon: PASS/FAIL

## Old Branding Search

Report:

```text
Old visible Poornima branding remaining: 0 / list exceptions
Old visible PAMS branding remaining: 0 / list exceptions
```

If any occurrence is technical/internal, explicitly identify the file and explain why it was intentionally preserved.

## GUI Protection

* Desktop GUI redesigned: NO
* Mobile GUI redesigned: NO
* Existing layout changed: NO
* Existing colors changed: NO
* Existing spacing changed: NO
* Existing functionality changed: NO

## Backend Protection

* Firebase changed: NO
* Firestore changed: NO
* Authentication changed: NO
* RBAC changed: NO
* Cloud Functions changed: NO
* Database collections changed: NO

## Files Changed

List every changed file.

## Validation

* JS syntax: PASS/FAIL
* Logo asset validation: PASS/FAIL
* Broken references: PASS/FAIL
* Desktop regression: PASS/FAIL
* Mobile regression: PASS/FAIL

## IMPORTANT

Do NOT claim live testing.

I will perform the actual browser/mobile testing myself.

Do not proceed with any other redesign or feature work after this branding change.
