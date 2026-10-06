# CAMPUSONE — PHASE 13: ANDROID APK / CAPACITOR INTEGRATION

Convert the existing CampusOne responsive web application into an Android APK using Capacitor.

This must be a packaging/integration task.

Do NOT create a separate CampusOne application.

Do NOT duplicate the Firebase backend.

Do NOT rewrite the existing application.

---

## 1. CORE REQUIREMENT

The Android application must use the existing CampusOne web application and existing mobile-responsive UI.

The APK must display the existing mobile UI/reference design already implemented in the project.

The mobile design must remain:

* light/sky-blue
* modern university ERP style
* rounded cards
* comfortable spacing
* touch-friendly controls
* mobile navigation
* responsive tables
* responsive forms
* CampusOne branding

Do not redesign the mobile GUI during this phase.

---

# 2. USE CAPACITOR

Use Capacitor to package the existing web application as Android.

Before installing anything, inspect the project and determine:

* existing package.json
* existing build system
* whether the project is static HTML/CSS/JS or uses a bundler
* existing Firebase configuration
* existing output/build directory
* existing asset structure

Do not assume a build directory.

Use the project's actual structure.

---

# 3. PRESERVE FIREBASE

The APK must continue using the existing Firebase architecture.

Preserve:

* Firebase Authentication
* Firestore
* existing Firebase configuration
* existing collections
* existing security rules
* existing RBAC
* existing role resolution
* existing services
* existing business logic

Do NOT create a second Firebase project.

Do NOT create a second database.

Do NOT move Firestore data into local SQLite.

Do NOT replace Firebase with another backend.

---

# 4. AUTHENTICATION

The APK must use the existing authentication flow.

Preserve:

* Email/password login
* logout
* session persistence
* role resolution
* authentication errors
* password reset if currently supported

Do NOT add:

* Google Sign-In
* public registration
* client-side admin provisioning

Do NOT introduce:

```javascript
createUserWithEmailAndPassword()
```

for admin/user provisioning.

---

# 5. FIVE ROLES

Verify that the APK supports:

```text
ADMIN
FACULTY
LAB_ASSISTANT
LIBRARIAN
STUDENT
```

The APK must use the same RBAC architecture as the web application.

Do not create separate mobile permissions.

---

# 6. MOBILE UI

The APK must use the existing responsive mobile interface.

Verify:

### Student

* Dashboard
* Attendance
* Examinations
* Digital Learning
* Library
* Notifications
* Profile

### Faculty

* Dashboard
* Attendance
* Attendance Assignments
* Attendance History
* Timetable
* Assignments
* Digital Learning
* Notifications
* Profile

### Lab Assistant

* Dashboard
* Laboratory
* Digital Learning
* Report Problem
* My Reports
* Notifications
* Profile

Attendance must NOT appear in the Lab Assistant navigation.

### Librarian

* Dashboard
* Books
* Book Copies
* Members
* Issue/Return
* Reservations
* Fines
* Reports
* Notifications
* Profile

### Admin

* Dashboard
* Users
* Academics
* Library
* More

Preserve existing role-specific access.

---

# 7. MOBILE REFERENCE

The previously approved CampusOne mobile UI reference is the visual reference.

Preserve:

* mobile header
* bottom navigation
* card system
* blue/cyan palette
* spacing
* typography
* buttons
* forms
* tables
* modals
* responsive behavior
* touch interaction

Do not redesign the interface.

---

# 8. CAPACITOR CONFIGURATION

Initialize Capacitor only if it is not already configured.

Use the existing application identity.

Choose an appropriate Android package ID based on the existing CampusOne project.

Do not change Firebase project IDs or Firestore collection names.

Configure:

* app name: CampusOne
* Android package/application ID
* web directory according to the actual project build output
* Android platform

Do not invent an incorrect web directory.

---

# 9. ANDROID PROJECT

Create the Android project using Capacitor.

Verify:

```text
android/
```

contains a valid Android project.

Do not commit generated build caches or unnecessary machine-specific files.

---

# 10. NETWORK / FIREBASE

The Android application must be able to reach Firebase over HTTPS.

Verify that Capacitor configuration does not block:

* Firebase Authentication
* Firestore
* Firebase APIs
* existing external assets that are required by the application

Do not disable HTTPS security.

Do not add insecure HTTP exceptions unless an existing required service explicitly needs it.

---

# 11. MOBILE ASSETS

Verify:

* CampusOne logo
* login background
* icons
* images
* CSS
* JavaScript
* fonts
* Firebase configuration

No broken relative paths.

Pay special attention to paths that work in the browser but fail inside the APK.

---

# 12. ANDROID BACK BUTTON

Implement sensible Android back-button behavior without changing application routing logic.

Expected behavior:

```text
Modal open
    ↓
Back
    ↓
Close modal

Otherwise:

Current page
    ↓
Back
    ↓
Previous application route
```

Do not log the user out simply because Android Back was pressed.

Avoid unexpected application termination.

---

# 13. KEYBOARD BEHAVIOR

Verify Android soft keyboard behavior.

For login/forms:

* input remains visible
* buttons remain accessible
* modal content can scroll
* keyboard does not permanently cover fields
* page does not become horizontally scrollable

---

# 14. SAFE AREA

Support modern Android devices with:

* status bar
* navigation bar
* gesture navigation

Do not allow important controls to sit underneath system UI.

---

# 15. OFFLINE / NETWORK ERRORS

Do not introduce a new offline database.

However, gracefully handle:

```text
No Internet
Firebase unavailable
Request timeout
Authentication failure
Firestore error
```

Show an understandable error/retry state instead of a blank screen.

---

# 16. PERFORMANCE

The APK must not introduce unnecessary:

* Firestore reads
* listeners
* polling
* duplicate Firebase initialization
* background processes

Reuse the existing performance-safe services.

---

# 17. SECURITY

Do not place:

* Firebase Admin credentials
* service account private keys
* Cloudflare secrets
* API secrets
* passwords

inside the APK.

Remember:

Anything shipped inside an APK can potentially be extracted.

Only public/client-safe Firebase configuration may exist in the frontend.

---

# 18. BUILD

After configuration:

1. Build the existing web application using its actual project build command.
2. Sync Capacitor.
3. Build Android.
4. Resolve only genuine build errors.
5. Do not modify unrelated application logic.

Use the appropriate Android/Gradle build method for the generated project.

Generate a release-capable APK.

---

# 19. APK OUTPUT

Create a clear output such as:

```text
dist/
    CampusOne.apk
```

or another appropriate existing distribution directory.

Do not overwrite unrelated files.

---

# 20. STATIC VALIDATION

Before declaring success, verify:

* JavaScript syntax
* Capacitor configuration
* Android project structure
* package/application ID
* asset paths
* Firebase initialization
* no duplicate Firebase initialization
* no hardcoded credentials
* no broken imports
* no missing files

---

# 21. IMPORTANT — DO NOT CLAIM DEVICE TESTING

Do NOT claim:

"APK tested successfully on Android"

unless an actual Android device/emulator has been used.

Static build success is NOT the same as device testing.

Report separately:

```text
APK Build: PASS/FAIL
Android Project: PASS/FAIL
Static Validation: PASS/FAIL
Device Testing: NOT PERFORMED
```

The user will install and test the APK on an actual Android phone.

---

# 22. FINAL REPORT

Return:

### Capacitor

PASS / FAIL

### Android Project

PASS / FAIL

### Firebase Integration

PASS / FAIL

### Authentication

PASS / FAIL

### RBAC

PASS / FAIL

### Mobile UI

PASS / FAIL

### Asset Paths

PASS / FAIL

### Android Back Button

PASS / FAIL / NOT TESTED

### APK Build

PASS / FAIL

### APK Location

Provide exact path.

### Device Testing

NOT PERFORMED unless actually performed.

### Files Changed

List exact files.

### Backend Changes

Must be:

NONE

unless absolutely required and explicitly reported.

STOP after APK generation.
