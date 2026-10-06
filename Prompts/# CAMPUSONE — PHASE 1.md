# CAMPUSONE — PHASE 1: MOBILE UI FOUNDATION ONLY

Implement **Phase 1 of the CampusOne mobile redesign** using the uploaded **CampusOne Mobile UI Reference HTML** as the visual master reference.

## 🚨 MOST IMPORTANT REQUIREMENT

### DO NOT CHANGE THE DESKTOP UI

This project already has a working desktop interface.

The existing desktop UI must remain visually and functionally unchanged.

Do NOT redesign, refactor, replace, or modify the desktop experience.

The new work must apply **ONLY to mobile/tablet responsive breakpoints**.

Think of the implementation as:

```text
CampusOne
│
├── Desktop
│   └── EXISTING UI — DO NOT TOUCH
│
└── Mobile / Responsive
    └── NEW MOBILE UI — IMPLEMENT
```

If a CSS rule affects desktop and mobile together, do NOT modify the shared rule unless it is proven that desktop rendering remains exactly unchanged.

Prefer mobile-specific media-query overrides or dedicated mobile classes.

---

# 1. REFERENCE FILE

Use the uploaded:

**CampusOne Mobile UI Reference**

as the visual reference.

The reference establishes:

* blue/cyan visual system
* light blue background
* rounded cards
* soft shadows
* comfortable spacing
* touch-friendly controls
* mobile app bar
* compact content
* bottom navigation
* mobile-friendly forms
* mobile-friendly cards
* role-specific mobile dashboards

The reference specifically uses mobile-focused dimensions and spacing rather than simply shrinking desktop elements.

Do NOT copy the reference as a separate application.

Adapt its visual language to the existing CampusOne application.

---

# 2. FIRST AUDIT THE EXISTING PROJECT

Before changing anything, inspect the current frontend.

Identify:

* main HTML entry point
* existing global CSS
* theme CSS
* responsive CSS
* `app.js`
* current sidebar
* current header/topbar
* current page container
* current role navigation
* current dashboard layouts
* existing media queries
* existing mobile styles
* current modal/form/table styles

Identify which CSS/classes are shared between desktop and mobile.

Do NOT blindly replace existing CSS.

Create a short internal implementation plan based on the actual project structure.

---

# 3. CREATE A MOBILE-ONLY DESIGN FOUNDATION

Create a dedicated responsive/mobile styling layer.

Use the reference's visual language.

Recommended mobile foundation:

```css
Mobile background:
#edf6ff

Primary blue:
#1457d9

Secondary cyan:
#20bdf3

Dark navy:
#0f2c5c

Text:
#15243d

Muted text:
#6b7a90

Surface:
#ffffff

Border:
#dbe8f7
```

Use the reference as the source for the visual direction.

Do NOT globally replace the existing desktop theme.

These values should be applied only to the new mobile responsive layer.

---

# 4. MOBILE PAGE CONTAINER

For mobile screens use approximately:

```text
Horizontal padding: 14–16px
Vertical spacing: 12–20px
```

Avoid cramped layouts.

Use:

```css
box-sizing: border-box;
```

and prevent horizontal page overflow.

Mobile pages must never produce unwanted horizontal scrolling.

---

# 5. MOBILE TYPOGRAPHY

Use a clean system font stack consistent with the reference:

```css
font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
```

Mobile typography should be readable.

Approximate hierarchy:

```text
Page title       20–24px
Section heading  15–17px
Card title       13–15px
Body             13–14px
Secondary text   11–12px
```

Do NOT make mobile text extremely small.

---

# 6. MOBILE CARDS

Create/reuse a mobile card style based on the reference:

```text
White surface
Rounded corners
Subtle border
Soft shadow
Comfortable internal padding
```

Target:

```text
border-radius: 16–20px
padding: 14–18px
```

Do not introduce excessive glassmorphism.

Prioritize readability.

---

# 7. MOBILE BUTTONS

Buttons must be comfortable to tap.

Use approximately:

```text
Height: 44–48px
Minimum touch target: ~44px
Border radius: 12–14px
```

Primary mobile actions can use the blue → cyan gradient from the reference.

Do NOT change the underlying button functionality.

Only improve mobile presentation.

---

# 8. MOBILE INPUTS

Inputs should be touch friendly.

Target:

```text
Height: 46–48px
Border radius: 12–14px
Readable text
Clear focus state
```

Preserve:

* validation
* input names
* IDs
* form submission
* authentication
* password handling
* existing event listeners

Do NOT change authentication logic.

---

# 9. MOBILE HEADER

Create a responsive mobile header **only for mobile breakpoints**.

Target structure:

```text
┌─────────────────────────────┐
│ ☰  POORNIMA        🔔  👤 │
└─────────────────────────────┘
```

Use the existing CampusOne/Poornima branding already present in the project.

Do not introduce new branding.

Do not modify desktop header.

The mobile header should remain compact and sticky where appropriate.

---

# 10. MOBILE NAVIGATION

Prepare the foundation for mobile navigation.

Use the reference's bottom-navigation concept.

Example:

```text
┌─────────────────────────────┐
│                             │
│       PAGE CONTENT          │
│                             │
├─────────────────────────────┤
│ Home │ Attendance │ Learn │ More │
└─────────────────────────────┘
```

Do NOT remove the existing desktop sidebar.

Desktop sidebar must continue working exactly as it currently does.

Mobile navigation should be role-aware.

Do not hardcode permissions.

Use the existing role/navigation configuration.

---

# 11. ROLE SUPPORT

The mobile foundation must support all existing roles:

```text
ADMIN
FACULTY
LAB_ASSISTANT
LIBRARIAN
STUDENT
```

Do NOT change role definitions.

Do NOT change RBAC.

Do NOT change route permissions.

Do NOT create duplicate role systems.

The reference defines separate mobile visual directions for Admin, Faculty, Student, Librarian and Lab Assistant.

---

# 12. MOBILE DASHBOARD FOUNDATION

Do NOT redesign individual dashboards yet.

For Phase 1, only ensure the foundation can support:

```text
Hero / welcome section
↓
Statistics cards
↓
Quick actions
↓
Recent activity
↓
Lists
```

Use responsive grid behavior.

Example:

Desktop:

```text
[Card] [Card] [Card] [Card]
```

Mobile:

```text
[Card]
[Card]
[Card]
[Card]
```

Do not change dashboard data sources.

---

# 13. TABLE FOUNDATION

Do NOT redesign every table in Phase 1.

Only create the responsive foundation:

```css
.table-container {
    width: 100%;
    overflow-x: auto;
}
```

Mobile tables should:

* remain readable
* scroll horizontally when necessary
* not shrink text excessively
* preserve all existing columns/data
* preserve existing actions

Later phases will redesign individual module tables.

---

# 14. MODAL FOUNDATION

On mobile:

```text
Desktop:
Centered modal

Mobile:
Nearly full-width modal
Comfortable padding
Scrollable content
Touch-friendly buttons
```

Do NOT change modal business logic.

Do not remove existing validation or actions.

---

# 15. LOGIN FOUNDATION

Do NOT redesign the login page completely in Phase 1.

Only ensure the existing login can receive a mobile-specific layout later.

Preserve:

* Firebase Authentication
* email/password
* password visibility
* validation
* loading state
* error handling
* authentication flow

No backend changes.

---

# 16. RESPONSIVE BREAKPOINTS

Use sensible breakpoints based on the existing project.

Recommended starting structure:

```text
Mobile:
≤ 600px

Large mobile / small tablet:
601–767px

Tablet:
768–900px

Desktop:
> 900px
```

IMPORTANT:

The desktop breakpoint must preserve the existing desktop layout.

Do not accidentally apply mobile styles to desktop.

---

# 17. DESKTOP REGRESSION PROTECTION

Before finishing:

Inspect all new CSS selectors and media queries.

Confirm:

```text
Desktop > 900px
    ↓
Existing UI remains active

Mobile ≤ 900px
    ↓
Mobile UI foundation activates
```

Do not modify existing desktop selectors unnecessarily.

If a shared selector must be touched, verify its desktop behavior is unchanged.

---

# 18. FUNCTIONALITY — ZERO CHANGES

This is a UI-only foundation task.

DO NOT modify:

* Firebase Authentication
* Firestore
* Cloud Functions
* Cloudflare
* Firebase configuration
* Firestore rules
* RBAC
* role resolution
* attendance logic
* timetable logic
* examination logic
* library logic
* digital learning logic
* notification logic
* user provisioning
* database collections
* database schemas
* existing routes
* service APIs

Do NOT introduce mock data.

Do NOT introduce localStorage/sessionStorage as a replacement for Firebase data.

---

# 19. DO NOT CREATE A SECOND APPLICATION

Do not create:

```text
mobile-app/
mobile-version/
mobile-campusone/
```

The mobile UI must be part of the existing CampusOne frontend.

One application:

```text
CampusOne
     │
     ├── Desktop rendering
     └── Mobile rendering
```

---

# 20. STATIC VALIDATION

After implementation:

Run syntax checks for all changed JavaScript files.

Check:

* no syntax errors
* no broken imports
* no missing globals
* no duplicate Firebase initialization
* no changed Firebase configuration
* no changed routes
* no changed role definitions

Also search the changed files for accidental modifications to:

```text
FirebaseService
AuthorizationService
authService
firestore
provisionUser
attendanceService
libraryService
```

These should not be functionally changed in Phase 1.

---

# 21. GIT SAFETY

Before committing:

Show exactly:

```text
Files changed:
...
```

Do NOT include unrelated files.

Do NOT commit generated temporary files.

Create one focused commit:

```text
feat: add mobile responsive UI foundation
```

Push to the existing branch only if the normal project workflow requires it.

---

# 22. FINAL REPORT

Report:

### Mobile Foundation

* Mobile CSS layer created: PASS/FAIL
* Mobile header foundation: PASS/FAIL
* Mobile navigation foundation: PASS/FAIL
* Mobile cards: PASS/FAIL
* Mobile forms: PASS/FAIL
* Mobile table responsiveness: PASS/FAIL
* Mobile modal responsiveness: PASS/FAIL

### Desktop Protection

* Desktop UI changed: MUST BE NO
* Desktop CSS behavior preserved: PASS/FAIL
* Desktop functionality changed: MUST BE NO

### Backend Protection

* Firebase changed: NO
* Firestore changed: NO
* Authentication changed: NO
* RBAC changed: NO
* Business logic changed: NO

### Validation

* JavaScript syntax: PASS/FAIL
* Broken imports: PASS/FAIL
* Responsive CSS validation: PASS/FAIL
* Files changed: list exact files
* Git commit: provide hash if committed

## IMPORTANT

Do NOT claim mobile live testing was performed unless it was actually performed.

I will perform the real mobile/browser testing myself.

STOP after Phase 1.

Do not continue to Student, Faculty, Admin, Librarian, or Lab Assistant mobile redesign until I approve Phase 1.
