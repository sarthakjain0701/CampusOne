# CAMPUSONE — PHASE 2: MOBILE LOGIN UI

Implement **ONLY the mobile Login Page redesign** for CampusOne.

Use the uploaded **CampusOne Mobile UI Reference** as the visual reference.

## 🚨 ABSOLUTE RULE — DO NOT TOUCH DESKTOP

The existing desktop Login Page must remain **100% unchanged**.

Do NOT modify the desktop:

* layout
* panel position
* background
* logo size
* typography
* colors
* spacing
* animations
* form layout
* authentication behavior

The new design must activate ONLY at the mobile/tablet responsive breakpoint established in Phase 1.

```text
Desktop
> 900px
    ↓
EXISTING LOGIN — UNCHANGED

Mobile
≤ 900px
    ↓
NEW MOBILE LOGIN UI
```

---

# 1. MOBILE LOGIN STRUCTURE

Create a mobile-first login layout based on the reference.

Recommended structure:

```text
┌─────────────────────────────┐
│                             │
│       Campus Background     │
│        / Soft Gradient      │
│                             │
│       [ Poornima Logo ]     │
│                             │
│   POORNIMA GROUP OF COLLEGE │
│                             │
│   Smart Attendance.         │
│   Better Management.        │
│   Better Education.         │
│                             │
│ ┌─────────────────────────┐ │
│ │ Welcome Back             │ │
│ │                         │ │
│ │ Email                   │ │
│ │ [____________________]  │ │
│ │                         │ │
│ │ Password                │ │
│ │ [__________________ 👁] │ │
│ │                         │ │
│ │       [ LOG IN ]        │ │
│ │                         │ │
│ │ Forgot Password?        │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

The exact arrangement should follow the uploaded reference where appropriate.

---

# 2. CAMPUS BACKGROUND

Use the existing CampusOne/Poornima login background asset.

Do NOT replace the existing asset with a generated image.

If the current project already uses the provided Poornima campus image, keep that same image.

Mobile treatment may include:

* subtle blur
* blue overlay
* dark/light gradient overlay
* responsive positioning
* `background-size: cover`
* `background-position: center`

Do not change the desktop background.

---

# 3. POORNIMA BRANDING

Use the existing official Poornima logo already present in the project.

Display:

```text
POORNIMA GROUP OF COLLEGE
```

and:

```text
Smart Attendance.
Better Management.
Better Education.
```

Do NOT display:

```text
CampusOne
```

anywhere visibly.

Do not change technical/internal identifiers merely for branding.

---

# 4. MOBILE LOGIN CARD

Create a premium mobile login card.

Use the Phase 1 mobile design system.

Suggested:

```text
Background:
rgba(255,255,255,0.88–0.95)

Border:
subtle light-blue border

Border radius:
20–24px

Padding:
20–24px

Shadow:
soft, subtle

Backdrop blur:
moderate
```

Do not make the card excessively transparent.

The login form must remain highly readable.

---

# 5. EMAIL FIELD

Keep the existing email input exactly functionally compatible.

Preserve:

* existing ID
* existing name
* existing event listeners
* existing validation
* existing Firebase Authentication logic
* existing error handling

Only improve its mobile appearance.

Target:

```text
Height: 46–50px
Radius: 12–14px
Comfortable horizontal padding
Readable 14–16px text
```

---

# 6. PASSWORD FIELD

Keep the existing password functionality.

Preserve:

* password input
* show/hide password
* validation
* existing event listeners
* authentication flow

Make the mobile control touch friendly.

Use approximately:

```text
Height: 46–50px
```

---

# 7. LOGIN BUTTON

Use a mobile-friendly primary button.

Suggested visual direction:

```text
Blue → Cyan gradient
White text
Rounded 12–14px
Height 46–50px
Full width
```

Example:

```text
┌─────────────────────────┐
│         LOG IN          │
└─────────────────────────┘
```

Do NOT change the login JavaScript.

Do NOT replace Firebase Authentication.

---

# 8. LOADING STATE

Preserve the existing login loading behavior.

When login is being processed:

* disable the button appropriately
* show existing loading indicator/message if present
* prevent duplicate submissions

Do not create a fake loading state that bypasses the existing authentication flow.

---

# 9. ERROR STATES

Existing authentication errors must continue to work.

Examples:

* invalid email
* incorrect password
* disabled account
* role not configured
* authentication failure

Display errors in a mobile-friendly way.

Do not expose Firebase internal error details unnecessarily.

Do not change the underlying error handling.

---

# 10. FORGOT PASSWORD

If the existing login page has Forgot Password functionality:

Keep it.

Make it touch-friendly and visually consistent.

Do NOT remove it.

Do NOT create a second password recovery mechanism.

---

# 11. RESPONSIVE BEHAVIOR

The mobile login must work on:

```text
320px
360px
375px
390px
412px
430px
768px
900px
```

Important:

### Small phones

Do not allow:

* horizontal overflow
* clipped logo
* clipped text
* buttons going outside screen
* form fields overflowing

### Large phones/tablets

Use available space intelligently.

Do not make the login card unnecessarily huge.

---

# 12. KEYBOARD BEHAVIOR

Mobile browsers show the keyboard when the user focuses an input.

Ensure:

* login card remains accessible
* focused field is not hidden behind keyboard
* page can scroll when required
* no fixed-height container traps the form

Do not break normal browser scrolling.

---

# 13. SAFE AREA

Support modern mobile devices with safe areas where appropriate.

Example:

```css
padding-bottom:
    max(20px, env(safe-area-inset-bottom));
```

Do not introduce unnecessary device-specific hacks.

---

# 14. ACCESSIBILITY

Maintain:

* proper labels
* visible focus states
* readable contrast
* keyboard navigation
* touch targets ≥ approximately 44px

Do not rely exclusively on color for validation/error states.

---

# 15. DO NOT CHANGE AUTHENTICATION

This is extremely important.

Do NOT modify:

* Firebase Authentication configuration
* `authService`
* `FirebaseService`
* Firebase project configuration
* Firestore
* Cloud Functions
* Cloudflare
* RBAC
* role resolution
* provisioning
* Firestore security rules

The mobile login must use the **same authentication system** as desktop.

```text
Mobile Login
     ↓
Existing Auth Logic
     ↓
Firebase Authentication
     ↓
Existing Role Resolution
     ↓
Existing CampusOne Application
```

---

# 16. DO NOT DUPLICATE LOGIN LOGIC

Do NOT create:

```text
mobileLogin.js
mobileAuthService.js
mobileFirebaseAuth.js
```

unless an existing architecture genuinely requires it.

Prefer the existing login implementation with a mobile-specific presentation layer.

---

# 17. DESKTOP REGRESSION CHECK

After implementation, inspect the login at desktop width.

Confirm:

```text
Desktop Login
    ↓
Looks exactly as before
    ↓
No layout changes
    ↓
No CSS regressions
    ↓
Authentication unchanged
```

If a CSS selector is shared between desktop and mobile, use responsive overrides instead of changing its desktop behavior.

---

# 18. STATIC VALIDATION

Run:

* JavaScript syntax validation
* CSS validation where available
* HTML/template validation where available
* search for duplicate login handlers
* search for duplicate Firebase initialization

Verify:

```text
No broken imports
No missing globals
No duplicate authentication handler
No Firebase changes
No Firestore changes
No RBAC changes
```

---

# 19. FILE CHANGE CONTROL

Only modify files actually required for the mobile Login UI.

Do NOT modify unrelated modules.

Do NOT redesign:

* Student
* Faculty
* Lab Assistant
* Librarian
* Admin
* Dashboard
* Attendance
* Exams
* Library
* Digital Learning

Those belong to later phases.

---

# 20. FINAL REPORT

Return:

### Mobile Login

* Mobile layout: PASS/FAIL
* Logo/branding: PASS/FAIL
* Email field: PASS/FAIL
* Password field: PASS/FAIL
* Login button: PASS/FAIL
* Error state: PASS/FAIL
* Loading state: PASS/FAIL
* Forgot password: PASS/FAIL
* Small-phone responsiveness: PASS/FAIL
* Tablet responsiveness: PASS/FAIL

### Desktop Protection

* Desktop Login changed: MUST BE NO
* Desktop visual regression: PASS/FAIL
* Desktop authentication regression: PASS/FAIL

### Backend Protection

* Firebase Authentication changed: NO
* Firestore changed: NO
* RBAC changed: NO
* Cloud Functions changed: NO
* Cloudflare changed: NO

### Validation

* JS syntax: PASS/FAIL
* CSS validation: PASS/FAIL
* Broken imports: PASS/FAIL
* Files changed: exact list
* Git commit: hash if committed

## STOP HERE

Do NOT continue to Phase 3.

Do NOT redesign Student, Faculty, Admin, Librarian, or Lab Assistant yet.

I will personally test the mobile Login Page.

Only proceed to Phase 3 after I confirm this phase is working.
