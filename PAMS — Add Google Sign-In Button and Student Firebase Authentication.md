# PAMS — Add Google Sign-In Button and Student Firebase Authentication

## OBJECTIVE

The current PAMS login UI does **not yet contain a "Continue with Google" button**.

Implement the Google sign-in UI and connect it to the already-configured Firebase Google Authentication provider.

For this task, implement and test **STUDENT LOGIN ONLY**.

Do NOT modify Faculty or Admin authentication.

---

# 1. ADD GOOGLE SIGN-IN BUTTON

Add a clearly visible button to the existing PAMS login page:

```text id="google-button"
[ G  Continue with Google ]
```

Use the existing PAMS design system.

Do not create a separate login page.

Do not redesign unrelated parts of the login page.

The Google button must be visible when:

```text id="role-student"
Student
```

is selected.

---

# 2. KEEP EXISTING LOGIN ROLE SELECTION

The existing login page has:

```text id="role-selection"
○ Student
○ Faculty
○ Admin
```

Keep this UI unchanged.

For this task:

```text id="student-flow"
Student → Google Authentication → Student authorization
```

Faculty/Admin flows must remain untouched.

---

# 3. GOOGLE BUTTON BEHAVIOR

When the user clicks:

```text id="google-button"
Continue with Google
```

use the already-configured Firebase Authentication Google provider.

Use the existing Firebase initialization from the project.

Do not create a second Firebase initialization.

---

# 4. USE FIREBASE GOOGLE AUTHENTICATION

Use Firebase Authentication with Google.

The flow should:

1. Open Google account selection.
2. Authenticate the selected Google account.
3. Receive the Firebase authenticated user.
4. Obtain the authenticated email.
5. Validate the email.
6. Check the PAMS `authorizedUsers` collection.
7. Validate Student role.
8. Validate ACTIVE status.
9. Create/update the user's Firebase UID record if authorized.
10. Open the existing Student Dashboard.

---

# 5. EXACT AUTHENTICATED EMAIL

After Google authentication, use:

```text
Firebase Auth currentUser.email
```

Do NOT use the email typed into the manual email field as proof of identity.

The Google-authenticated email is the source of truth.

---

# 6. DOMAIN CHECK

The authenticated email must belong to:

```text id="domain"
@poornima.org
```

Examples:

```text id="valid-domain"
2025pietcssarthak149@poornima.org
✅ Allowed to continue checking authorization
```

```text id="invalid-domain"
example@gmail.com
❌ Reject
```

Show:

```text id="domain-error"
Please sign in using your official @poornima.org Google account.
```

---

# 7. EXACT authorizedUsers CHECK

After validating the domain:

Check:

```text id="authorized-lookup"
authorizedUsers/{authenticatedEmail}
```

Use the exact email as the document ID if that is how the existing test documents are stored.

For example:

```text id="authorized-example"
authorizedUsers/
2025pietcssarthak149@poornima.org
```

Only the two existing Student test documents should be used for this test.

Do not automatically create extra Student authorization records.

---

# 8. STUDENT ROLE CHECK

Read the existing authorized user document.

Require:

```text id="student-role-check"
role == "STUDENT"
```

If the authenticated email exists but has another role:

```text id="wrong-role"
This account is not registered as a Student.
```

Do not allow access to Student Dashboard.

Do not modify Faculty or Admin data.

---

# 9. ACTIVE STATUS CHECK

Require:

```text id="active-check"
status == "ACTIVE"
```

If status is:

```text id="inactive"
INACTIVE
```

reject login.

Display:

```text id="inactive-message"
Your PAMS account is inactive.
Please contact the administrator.
```

---

# 10. GOOGLE AUTHENTICATION + authorizedUsers FLOW

Implement exactly:

```text id="final-flow"
Student selected
      ↓
Continue with Google
      ↓
Google account picker
      ↓
Firebase Authentication
      ↓
Authenticated email
      ↓
@poornima.org?
      ↓
authorizedUsers/{email} exists?
      ↓
role == STUDENT?
      ↓
status == ACTIVE?
      ↓
Create/update users/{firebaseUid}
      ↓
Student Dashboard
```

If any check fails:

```text id="deny"
DO NOT OPEN DASHBOARD
DO NOT CREATE A PAMS USER RECORD
```

---

# 11. WRONG ACCOUNT TEST

If the user selects a personal Gmail:

```text id="personal-account"
example@gmail.com
```

the login must be rejected.

Do not let a successful Google authentication automatically grant PAMS access.

Google authentication and PAMS authorization are separate checks.

---

# 12. FAKE @poornima.org TEST

A fake account such as:

```text id="fake-email"
fakeperson@poornima.org
```

must also be rejected if the exact email is not present in `authorizedUsers`.

Message:

```text id="not-registered"
This Google account is not registered for PAMS.
Please contact the administrator.
```

---

# 13. MANUAL EMAIL OPTION

Keep the existing manual email field if it already exists.

Do NOT create Email/Password authentication.

The manual email field should only help the user identify/validate the institutional account.

The actual authentication must still come from Google.

Example:

```text id="manual-email-flow"
Manual Email:
2025pietcssarthak149@poornima.org

        ↓

Continue with Google

        ↓

Google authenticated email:
2025pietcssarthak149@poornima.org

        ↓

Emails match
        ↓

Continue
```

If the manually entered email and Google-authenticated email do not match:

```text id="email-mismatch"
The selected Google account does not match the institutional email entered.
Please choose the correct Google account.
```

Do not trust the manually entered value over Firebase Authentication.

---

# 14. CREATE USERS/{UID}

After the authenticated Student passes all authorization checks:

Create or update:

```text id="user-record"
users/{firebaseUid}
```

Example:

```text id="user-example"
{
  uid: "...",
  email: "2025pietcssarthak149@poornima.org",
  role: "STUDENT",
  status: "ACTIVE"
}
```

Only perform this operation after successful authorization.

Do not create a PAMS user for unauthorized accounts.

---

# 15. LOGIN SESSION

Use Firebase Authentication session persistence.

Do not create a custom authentication token system.

On refresh, the existing authenticated session should be restored where Firebase persistence is configured.

After logout:

```text id="logout-flow"
Firebase signOut
      ↓
Clear local application state
      ↓
Return to Login
```

---

# 16. GOOGLE AUTH PROVIDER

The Firebase project already has Google authentication enabled.

Use the existing provider configuration.

Do NOT create:

- another Firebase app
- another Firebase project
- another Google provider
- Email/Password authentication
- a second authentication service

---

# 17. MOBILE SUPPORT

On mobile devices, use the appropriate Firebase web authentication flow for the platform, including redirect handling where required.

The Google sign-in button must remain usable on:

```text id="devices"
Mobile
Tablet
Laptop
Desktop
```

Do not allow the popup/login UI to become unusable on small screens.

---

# 18. LOADING STATE

When Google sign-in starts, show:

```text id="google-loading"
Signing in with Google...
```

Disable duplicate clicks while authentication is processing.

Do not allow multiple simultaneous authentication requests.

---

# 19. ERROR HANDLING

Handle common failures gracefully:

### User cancels Google account selection

```text id="cancel-error"
Google sign-in was cancelled.
```

### Personal account

```text id="domain-error2"
Please use your official @poornima.org account.
```

### Unregistered institutional account

```text id="not-authorized"
This Google account is not registered for PAMS.
```

### Wrong role

```text id="wrong-role2"
This account is not registered as a Student.
```

### Inactive account

```text id="inactive2"
Your PAMS account is inactive.
Please contact the administrator.
```

### Firebase/network failure

```text id="firebase-error"
Unable to complete sign-in. Please try again.
```

Do not expose raw Firebase error objects to users.

---

# 20. DO NOT MODIFY FACULTY OR ADMIN

Do not:

- Change Faculty login logic.
- Change Admin login logic.
- Change Faculty documents.
- Change Admin documents.
- Change Faculty dashboard.
- Change Admin dashboard.
- Change Faculty permissions.
- Change Admin permissions.

This task is Student authentication only.

---

# 21. TEST THE TWO EXISTING STUDENT DOCUMENTS

Use the two Student documents already present in:

```text id="existing-auth"
authorizedUsers
```

### Test both individually:

```text id="test-one"
Student test account #1
→ Google login
→ authorizedUsers match
→ role STUDENT
→ ACTIVE
→ Student Dashboard
```

```text id="test-two"
Student test account #2
→ Google login
→ authorizedUsers match
→ role STUDENT
→ ACTIVE
→ Student Dashboard
```

Do not add more test users.

---

# 22. TEST PERSONAL GOOGLE ACCOUNT

Try:

```text id="personal-test"
personal@gmail.com
```

Expected:

```text id="personal-result"
Authentication may succeed with Google,
but PAMS access MUST be denied.
```

---

# 23. TEST FAKE @poornima.org

Use a non-authorized institutional email.

Expected:

```text id="fake-result"
Google Authentication
→ success
→ authorizedUsers lookup
→ not found
→ PAMS access denied
```

---

# 24. PERFORMANCE

Do not load:

- all students
- all Faculty
- all Admins
- attendance
- results
- library
- reports
- timetable

during login.

The login process should perform only the authentication and authorization checks needed for the current Student.

---

# 25. SECURITY

Do not trust:

- Selected role alone
- Manually entered email alone
- `@poornima.org` domain alone
- Frontend-only authorization

The effective authorization is:

```text id="security-flow"
Authenticated Firebase identity
+
@poornima.org
+
Exact authorizedUsers match
+
role = STUDENT
+
status = ACTIVE
```

---

# 26. FINAL ACCEPTANCE CRITERIA

The implementation is complete when:

- [ ] "Continue with Google" button appears for Student.
- [ ] Button uses Firebase Google Authentication.
- [ ] Google account selector opens correctly.
- [ ] Authenticated Firebase email is obtained.
- [ ] Personal Gmail is rejected.
- [ ] Non-`@poornima.org` account is rejected.
- [ ] Fake/non-authorized `@poornima.org` account is rejected.
- [ ] Exact match against `authorizedUsers` works.
- [ ] Role must be `STUDENT`.
- [ ] Status must be `ACTIVE`.
- [ ] First authorized Student can log in.
- [ ] Second authorized Student can log in.
- [ ] `users/{firebaseUid}` is created/updated only after successful authorization.
- [ ] Unauthorized accounts do not create PAMS users.
- [ ] Student reaches existing Student Dashboard.
- [ ] Logout works.
- [ ] Manual email field remains supported if it already exists.
- [ ] Manual email does not override Google identity.
- [ ] Faculty remains untouched.
- [ ] Admin remains untouched.
- [ ] No Email/Password authentication is introduced.
- [ ] No Signup option is introduced.
- [ ] No other PAMS modules are modified.
- [ ] No critical console errors remain.

---

# FINAL INSTRUCTION

The current PAMS UI has **no Google sign-in button yet**.

Therefore, the first implementation step is:

**ADD the "Continue with Google" button to the existing Student login UI and connect it to the already-enabled Firebase Google provider.**

Then implement the exact `authorizedUsers` validation described above.

Do not modify Faculty or Admin.

Do not migrate Attendance or other Firestore business data in this task.

Do not create new Student test accounts.

Use only the two existing Student documents for authentication testing.