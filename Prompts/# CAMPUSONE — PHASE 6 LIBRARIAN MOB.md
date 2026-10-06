# CAMPUSONE — PHASE 6: LIBRARIAN MOBILE UI

Implement **ONLY the Librarian mobile interface** for CampusOne.

Use the uploaded **CampusOne Mobile UI Reference** and the mobile foundation created in previous phases.

The official visible branding is now:

**CampusOne**

Use the newly provided CampusOne logo.

---

# 🚨 ABSOLUTE RULE — DESKTOP MUST NOT CHANGE

```text
Desktop > 900px
    ↓
EXISTING LIBRARIAN UI
❌ DO NOT CHANGE

Mobile ≤ 900px
    ↓
NEW LIBRARIAN MOBILE UI
✅ IMPLEMENT
```

Do not redesign the existing desktop Librarian interface.

Do not modify:

* Firebase Authentication
* Firestore
* Cloud Functions
* Firestore rules
* RBAC
* Library business logic
* existing LibraryService
* existing routes
* existing database schema
* desktop CSS/layout

This is a **mobile UI implementation only**.

---

# 1. LIBRARIAN MOBILE NAVIGATION

Use the existing Librarian RBAC.

Recommended mobile navigation:

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

If Library Settings already exists and is permitted for Librarian, expose it through **More** rather than overcrowding the primary navigation.

Example:

```text
Home
Books
Issue/Return
Members
More
```

More:

```text
Book Copies
Reservations
Fines
Reports
Library Settings
Notifications
Profile
```

Do not create duplicate routes.

---

# 2. REMOVE INAPPROPRIATE MODULES

Librarian mobile UI must NOT show:

* Student Management
* Faculty Management
* Class Management
* Subject Management
* Attendance Administration
* Attendance Assignment
* Mid-Term Marks
* Admin Management
* User Provisioning
* System Administration

Do not delete their underlying services.

Only control what the Librarian UI exposes according to existing RBAC.

---

# 3. MOBILE HEADER

Reuse the existing mobile header foundation.

Example:

```text
┌──────────────────────────────┐
│ ☰  CampusOne       🔔  Profile│
└──────────────────────────────┘
```

Use the official CampusOne logo where the existing mobile branding area displays a logo.

Do not change the desktop header.

---

# 4. LIBRARIAN DASHBOARD

Create a mobile-first Library Dashboard.

Structure:

```text
Welcome
   ↓
Library Summary
   ↓
Quick Actions
   ↓
Overdue / Fine Alerts
   ↓
Recent Transactions
   ↓
New Books
```

Use real Firestore data.

No mock statistics.

---

# 5. DASHBOARD STAT CARDS

Use compact responsive cards.

Show real values such as:

```text
Current Issued
Pending Fines
Overdue Books
Total Book Titles
```

Example:

```text
┌──────────────┐ ┌──────────────┐
│ Current      │ │ Pending      │
│ Issued       │ │ Fines        │
│ 24           │ │ ₹120         │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Overdue      │ │ Book Titles  │
│ 5            │ │ 842          │
└──────────────┘ └──────────────┘
```

Do not hardcode values.

Use existing LibraryService/dashboard data.

---

# 6. QUICK ACTIONS

Provide touch-friendly actions:

```text
[ Add Book ]

[ Issue Book ]

[ Return Book ]

[ Search Member ]
```

Only show actions the authenticated Librarian is authorized to perform.

Use existing routes and services.

Do not create a second implementation.

---

# 7. BOOKS MODULE

Create a mobile-friendly Books page.

Show:

* Book title
* Author
* ISBN where available
* Category
* Total copies
* Available copies
* Status

Use real Firestore data.

Example:

```text
┌────────────────────────────┐
│ Database Management        │
│ R. Elmasri                 │
│ ISBN: ********             │
│                            │
│ Total Copies     8         │
│ Available       5          │
│ Status          Active     │
│                            │
│ [ View ] [ Edit ]          │
└────────────────────────────┘
```

Do not change book schema.

---

# 8. BOOK SEARCH

Make search mobile-friendly.

Use:

```text
Search books...
```

Search should use the existing LibraryService/query behavior.

Do not load the entire book collection unnecessarily.

Use existing limits/pagination.

Provide a clear empty state:

```text
No books found.
```

---

# 9. BOOK COPIES

Create a mobile-friendly Book Copies view.

Display:

* Book
* Copy ID
* Accession number
* Status
* Location
* Condition where available

Possible statuses:

```text
AVAILABLE
ISSUED
RESERVED
LOST
DAMAGED
MAINTENANCE
```

Use existing data definitions if these already exist.

Do not invent unsupported fields.

---

# 10. ISSUE BOOK

Create a touch-friendly Issue Book workflow.

Structure:

```text
Issue Book

Member
[ Search Member ]

Book
[ Search Book ]

Copy
[ Select Available Copy ]

Issue Date
[ Current Date ]

Due Date
[ Calculated ]

[ Issue Book ]
```

---

# 11. LIBRARY POLICY — IMPORTANT

Preserve the existing institutional library policy:

```text
Maximum issue period: 15 days
Fine after due date: ₹2 per day
Return/reissue reminders: Days 13, 14 and 15
```

Do not change these rules.

Do not introduce different values on mobile.

The mobile UI must use the existing LibraryService/settings implementation.

---

# 12. DUE DATE

When issuing a book, the due date must be calculated using the existing library policy.

Do not duplicate date calculation logic in the mobile UI.

The service/business logic remains the source of truth.

---

# 13. RETURN BOOK

Create a mobile-friendly Return Book screen.

Example:

```text
Return Book

Member
Rahul Sharma

Book
Database Management

Issue Date
01 Sep 2026

Due Date
16 Sep 2026

Current Date
18 Sep 2026

Overdue
2 days

Fine
₹4

[ Return Book ]
```

Use actual transaction data.

Do not calculate conflicting fine values in the UI.

Use LibraryService as the source of truth.

---

# 14. REISSUE

If existing Librarian functionality supports reissue:

Provide:

```text
[ Reissue Book ]
```

Use the existing reissue workflow.

Preserve:

* 15-day policy
* reminder logic
* fine logic
* transaction history

Do not create a second reissue implementation.

---

# 15. MEMBERS

Create mobile member search/list.

Show only appropriate member information.

Example:

```text
┌────────────────────────────┐
│ Rahul Sharma               │
│ Student                    │
│ PIET25CS158                │
│                            │
│ Issued Books: 2            │
│ Fine: ₹0                   │
│                            │
│ [ View ]                   │
└────────────────────────────┘
```

Use existing member data and LibraryService.

Do not expose unnecessary private information.

---

# 16. ISSUE / RETURN TRANSACTIONS

Create a mobile-friendly transaction list.

Display:

```text
Member
Book
Issue Date
Due Date
Return Status
Fine
```

For dense records, use horizontally scrollable tables.

For individual records, cards may be used where appropriate.

Do not make text tiny.

---

# 17. RESERVATIONS

Make existing reservations functionality responsive.

Show:

* Member
* Book
* Reservation date
* Status

Possible statuses should follow existing data.

Do not invent new reservation states.

---

# 18. FINES

Create a mobile-friendly Fines view.

Show:

```text
Member
Book
Days Overdue
Fine Amount
Status
```

Use the existing ₹2/day business rule.

Do not modify fine calculation logic.

---

# 19. OVERDUE ALERTS

Create a clear mobile section for overdue books.

Example:

```text
Overdue Books

Database Management
Rahul Sharma
3 days overdue
Fine: ₹6

[ View Transaction ]
```

Use real data.

No mock alerts.

---

# 20. RETURN / REISSUE REMINDERS

Show reminders generated by the existing system.

The institutional reminder window is:

```text
Day 13
Day 14
Day 15
```

Do not implement a separate notification scheduler inside the UI.

Use existing NotificationService/LibraryService behavior.

---

# 21. NEW BOOK NOTIFICATIONS

If the existing new-book notification functionality is enabled:

Display relevant notifications.

Example:

```text
New Book Added

"Operating System Concepts"
is now available in the library.
```

Use existing notification infrastructure.

Do not generate fake notifications.

---

# 22. LIBRARY SETTINGS

If Librarian has access to the existing Library Settings module:

Make it mobile responsive.

Existing configuration location:

```text
librarySettings/config
```

Do not create another settings collection.

Preserve existing access control.

The mobile page should correctly handle:

```text
Loading
Success
Error
```

Never remain permanently stuck on:

```text
Loading library configuration...
```

If the configuration document does not exist, use the existing default handling.

Do not silently create conflicting settings.

---

# 23. REPORTS

Make existing Library Reports responsive.

Possible existing reports:

* Issue/Return
* Overdue
* Fines
* Book inventory
* Reservations

Use existing report functionality.

Do not introduce new report calculations.

For data-heavy reports, allow horizontal scrolling.

---

# 24. DIGITAL LEARNING

If the existing Librarian role has Digital Learning access, preserve it and make it responsive.

Otherwise do not add a new Librarian learning module.

Do not change RBAC merely for mobile.

---

# 25. NOTIFICATIONS

Use the existing NotificationService.

Display real notifications such as:

* overdue reminders
* return/reissue reminders
* new books
* reservation updates
* administrative library notices

Preserve read/unread functionality.

---

# 26. PROFILE

Show existing Librarian profile data:

```text
Name
Email
Role
Designation
Department
```

Only show fields that actually exist.

Do not allow modification of security-sensitive fields.

---

# 27. MOBILE CARD SYSTEM

Reuse the established mobile design system:

```text
border-radius: 16–20px
padding: 14–18px
soft shadow
subtle border
```

Keep the light/sky-blue CampusOne theme.

Do not introduce a separate Library theme.

---

# 28. MOBILE FORMS

Forms must be touch-friendly.

Use:

```text
Label
[ Input ]

Label
[ Dropdown ]

[ Primary Action ]
```

Recommended:

```text
Input: 46–48px
Button: 44–48px
```

Maintain existing validation.

Do not change service/API contracts.

---

# 29. MOBILE TABLES

Use proper tabular structures for:

* Transactions
* Fines
* Book Copies
* Reports
* Reservations

On small screens:

```css
overflow-x: auto;
```

Do not compress the table until it becomes unreadable.

---

# 30. LOADING / EMPTY / ERROR STATES

Every Librarian mobile view must have:

### Loading

```text
Loading...
```

### Empty

```text
No records found.
```

### Error

```text
Unable to load data.
[ Retry ]
```

Trace existing lifecycle:

```text
render()
afterRender()
App.postRenderView()
```

where applicable.

Fix missing lifecycle calls if required.

Do not introduce a second lifecycle mechanism.

---

# 31. PERFORMANCE

Use existing performance-safe LibraryService methods.

Do NOT introduce:

```text
get all books
get all transactions
get all members
get all fines
```

without appropriate limits/filtering.

Use:

* targeted queries
* pagination
* limits
* existing listeners
* listener cleanup

Do not introduce unnecessary realtime listeners.

---

# 32. DATA SOURCE

The Librarian mobile UI must use:

```text
LibraryService
LibrarySettingsService
NotificationService
existing FirebaseService
```

where applicable.

Do NOT introduce:

* MOCK_DATA
* static book arrays
* DataStore
* localStorage as source of truth
* sessionStorage as source of truth
* duplicate Firestore collections

---

# 33. RBAC

Do not modify:

* AuthorizationService
* roleConfig
* FirebaseService
* Firestore rules
* role resolution

The role remains:

```text
LIBRARIAN
```

Do not grant Admin permissions.

---

# 34. DESKTOP PROTECTION

Verify that Desktop Librarian remains unchanged.

Check:

```text
Desktop > 900px
```

for:

* Dashboard
* Books
* Copies
* Members
* Issue/Return
* Reservations
* Fines
* Reports
* Settings
* Notifications
* Profile

Desktop visual and functional behavior must remain unchanged.

---

# 35. RESPONSIVE TESTING

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

* no horizontal page overflow
* no clipped cards
* forms fit
* buttons are tappable
* modals fit
* keyboard does not hide actions
* bottom navigation does not cover content
* tables scroll correctly
* safe-area spacing works

---

# 36. STATIC VALIDATION

Run syntax validation for every changed JavaScript file.

Check:

* broken imports
* missing globals
* duplicate Firebase initialization
* duplicate routes
* mock data
* localStorage/sessionStorage
* unbounded Firestore reads
* RBAC regressions
* desktop CSS regressions

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

# 37. BRANDING VALIDATION

The visible product branding must remain:

**CampusOne**

Use the provided CampusOne logo.

Do not reintroduce:

```text
Poornima Group Of College
Poornima Attendance System
PAMS
```

as application branding.

Do not redesign the CampusOne logo.

---

# 38. FILE CHANGE CONTROL

Only modify files required for Librarian mobile UI.

Do not modify unrelated:

* Student
* Faculty
* Lab Assistant
* Admin
* backend
* Firestore rules
* Cloud Functions

unless a minimal existing mobile lifecycle fix is genuinely required.

---

# 39. FINAL REPORT

Return:

## Librarian Mobile

* Dashboard: PASS/FAIL
* Books: PASS/FAIL
* Book Copies: PASS/FAIL
* Members: PASS/FAIL
* Issue Book: PASS/FAIL
* Return Book: PASS/FAIL
* Reissue: PASS/FAIL
* Reservations: PASS/FAIL
* Fines: PASS/FAIL
* Reports: PASS/FAIL
* Library Settings: PASS/FAIL
* Notifications: PASS/FAIL
* Profile: PASS/FAIL
* Mobile navigation: PASS/FAIL
* Responsive testing: PASS/FAIL

## Library Policy

* 15-day issue period preserved: PASS/FAIL
* ₹2/day fine preserved: PASS/FAIL
* Day 13/14/15 reminders preserved: PASS/FAIL
* New-book notification behavior preserved: PASS/FAIL

## Desktop Protection

* Desktop Librarian UI changed: MUST BE NO
* Desktop visual regression: PASS/FAIL
* Desktop functionality regression: PASS/FAIL

## Backend Protection

* Firebase changed: NO
* Authentication changed: NO
* RBAC changed: NO
* Library business logic changed: NO
* Firestore schema changed: NO unless genuinely required

## Validation

* JS syntax: PASS/FAIL
* Broken imports: PASS/FAIL
* Mock data introduced: MUST BE NO
* Unbounded reads introduced: MUST BE NO
* CampusOne branding intact: PASS/FAIL
* Exact files changed
* Git commit/hash

# STOP AFTER PHASE 6

Do not start Admin mobile redesign yet.

I will perform the actual Librarian mobile testing before approving Phase 7.
