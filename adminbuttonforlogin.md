# PAMS — Add Continue with Google to Admin Login and Verify Admin Email

## OBJECTIVE

Add a functional **Continue with Google** button to the existing **Admin Login** flow and connect it to Firebase Authentication.

The Admin login must support:

- Manual Admin email entry
- Continue with Google authentication
- Firestore `/admins` authorization check
- Exact email matching
- Role validation
- Account status validation

IMPORTANT:

The manual email field is **not an independent authentication mechanism**.

It is used to identify/validate the intended Admin account before Google authentication.

Firebase Google Authentication remains the actual identity verification mechanism.

---

# 1. ADMIN LOGIN UI

When:

```text
Admin
```

is selected on the PAMS login page, show:

```text id="admin-login-ui"
┌──────────────────────────────────────────────┐
│                ADMIN LOGIN                  │
│                                              │
│ Official / Authorized Admin Email            │
│ [________________________________]            │
│                                              │
│ [ Continue with Google ]                     │
│                                              │
└──────────────────────────────────────────────┘
```

Use the existing PAMS login design.

Do not create a new login page.

Do not change the Student or Faculty UI in this task.

---

# 2. GOOGLE AUTHENTICATION

The Google button must use the already-configured Firebase Google provider.

Use the existing Firebase initialization.

Do not create:

- Another Firebase project
- Another Firebase app
- Another Google provider
- Email/Password authentication

---

# 3. MANUAL EMAIL FIELD

The user may enter an Admin email such as:

```text id="fh7n0q"
yourgmail@gmail.com
```

or an official institutional Admin email if used later.

The application must NOT treat the typed email as authenticated identity.

It is only a pre-authentication authorization check.

---

# 4. ADMIN COLLECTION LOOKUP

After the user enters the email, check:

```text id="admins-lookup"
admins/{enteredEmail}
```

The Admin document must exist.

Example:

```text id="admin-doc"
admins/
  yourgmail@gmail.com
```

with:

```text id="admin-fields"
{
  email: "yourgmail@gmail.com",
  role: "ADMIN",
  status: "ACTIVE"
}
```

---

# 5. ADMIN ROLE VALIDATION

The Firestore Admin document must contain:

```text id="admin-role"
role = "ADMIN"
```

If the document exists but the role is not ADMIN:

```text id="wrong-admin-role"
This account is not registered as an Administrator.
```

Do not allow login.

---

# 6. ADMIN STATUS VALIDATION

Require:

```text id="admin-status"
status = "ACTIVE"
```

If:

```text id="inactive-admin"
status = "INACTIVE"
```

reject access:

```text id="inactive-admin-message"
Your Admin account is inactive.
Please contact the system administrator.
```

---

# 7. CONTINUE WITH GOOGLE

Only after the manual email passes the Admin authorization check should the application continue to Google authentication.

Flow:

```text id="admin-auth-flow"
Admin selected
      ↓
Enter Email
      ↓
Check admins/{email}
      ↓
Exists?
      ↓
role = ADMIN?
      ↓
status = ACTIVE?
      ↓
Continue with Google
      ↓
Google authentication
```

---

# 8. GOOGLE EMAIL MUST MATCH MANUAL EMAIL

After Firebase Authentication succeeds, retrieve:

```text id="authenticated-email"
firebaseUser.email
```

Compare it to the email entered manually.

Example:

```text id="match"
Manual Email:
yourgmail@gmail.com

Google Account:
yourgmail@gmail.com

→ MATCH ✅
→ Login allowed
```

Mismatch:

```text id="mismatch"
Manual Email:
yourgmail@gmail.com

Google Account:
another@gmail.com

→ REJECT ❌
```

Show:

```text id="mismatch-message"
The Google account does not match the authorized Admin email.
Please select the correct Google account.
```

Never allow the typed email to override the authenticated Firebase email.

---

# 9. PERSONAL GMAIL FOR DEVELOPMENT TESTING

For the current development phase, a personal Gmail may be used as a temporary Admin test account.

Example:

```text id="dev-admin"
admins/
  yourgmail@gmail.com
```

with:

```text id="dev-admin-fields"
role: "ADMIN"
status: "ACTIVE"
environment: "DEVELOPMENT"
```

This test account must be clearly treated as development-only.

Do not automatically allow arbitrary Gmail accounts.

The exact email must exist in `/admins`.

---

# 10. PRODUCTION BEHAVIOR

When PAMS is moved to production, use the approved institutional Admin account(s) in `/admins`.

Do not rely on:

```text id="unsafe-admin"
any Gmail
```

The Admin collection is the whitelist.

The final rule is:

```text id="admin-policy"
Authenticated Google account
+
Exact email exists in /admins
+
role = ADMIN
+
status = ACTIVE
=
Admin Access
```

---

# 11. PERSONAL ACCOUNT NOT IN ADMINS

If:

```text id="unknown-gmail"
someone@gmail.com
```

is not present in:

```text id="admin-unknown"
admins/
```

then:

```text id="deny-admin"
Google authentication
may succeed
BUT
PAMS authorization must fail
```

Display:

```text id="not-admin"
This Google account is not authorized for the PAMS Admin Portal.
```

---

# 12. DO NOT AUTO-CREATE ADMIN

Never automatically create:

```text id="no-auto-admin"
admins/{email}
```

when someone signs in.

The Admin record must already exist or be created by the controlled Admin/developer provisioning process.

A successful Google sign-in must NEVER automatically make a user an Admin.

---

# 13. USERS COLLECTION

After successful Admin authentication and authorization, create/update:

```text id="admin-user-record"
users/{firebaseUid}
```

Example:

```text id="admin-user-data"
{
  uid: "...",
  email: "yourgmail@gmail.com",
  role: "ADMIN",
  status: "ACTIVE"
}
```

Only create/update this record after:

```text id="admin-final-check"
Firebase authentication
+
admins/{email}
+
role ADMIN
+
status ACTIVE
```

have all succeeded.

---

# 14. ROLE SELECTION MUST STILL BE VERIFIED

The login page may allow:

```text id="login-as-admin"
○ Student
○ Faculty
● Admin
```

But selecting Admin does NOT grant Admin access.

The actual authorization comes from:

```text id="admin-source"
admins/{authenticatedEmail}
```

Therefore:

```text id="student-as-admin"
Student email
+
Admin selected
=
❌ Reject
```

---

# 15. WRONG ACCOUNT TEST

Scenario:

```text id="wrong-account"
Manual email:
yourgmail@gmail.com

Google selected:
other@gmail.com
```

Expected:

```text id="wrong-result"
Reject login
No Admin Dashboard
No users/{uid} Admin record
```

---

# 16. FIREBASE AUTHENTICATION FLOW

Use the existing Firebase Google provider.

For web:

- Use popup where appropriate.
- Support redirect flow where required for mobile.

Do not create custom authentication tokens.

---

# 17. LOADING STATE

When Google authentication begins:

```text id="admin-loading"
Signing in with Google...
```

Prevent duplicate clicks.

Do not start multiple authentication operations simultaneously.

---

# 18. ERROR HANDLING

Use clear messages.

### Admin record not found

```text id="admin-not-found"
This account is not authorized for the PAMS Admin Portal.
```

### Wrong role

```text id="admin-wrong-role"
This account is not configured as an Admin.
```

### Inactive

```text id="admin-inactive"
Your Admin account is inactive.
```

### Google account mismatch

```text id="admin-mismatch"
The Google account does not match the authorized Admin email.
```

### Cancelled login

```text id="admin-cancelled"
Google sign-in was cancelled.
```

### Firebase/network error

```text id="admin-firebase-error"
Unable to complete Admin sign-in. Please try again.
```

Do not expose raw Firebase errors to the user.

---

# 19. TEST CASES

## TEST 1 — Authorized development Admin

```text id="admin-test-1"
Manual Email:
yourgmail@gmail.com

admins/yourgmail@gmail.com:
role = ADMIN
status = ACTIVE

Google account:
yourgmail@gmail.com
```

Expected:

```text id="admin-test-result"
Authentication ✅
Admin lookup ✅
Role ✅
Status ✅
Email match ✅
Admin Dashboard ✅
```

---

## TEST 2 — Manual email not in /admins

```text id="admin-test-2"
unknown@gmail.com
```

Expected:

```text id="admin-test-result2"
Access denied
```

---

## TEST 3 — Google account mismatch

```text id="admin-test-3"
Manual:
yourgmail@gmail.com

Google:
another@gmail.com
```

Expected:

```text id="admin-test-result3"
Access denied
```

---

## TEST 4 — Inactive Admin

Set:

```text id="admin-test-4"
status = INACTIVE
```

Expected:

```text id="admin-test-result4"
Access denied
```

Restore to:

```text id="admin-test-restore"
status = ACTIVE
```

after the test.

---

# 20. SECURITY

Do not rely only on the frontend.

A user must not be able to change:

```text id="admin-security"
role: "STUDENT"
```

to:

```text id="admin-security2"
role: "ADMIN"
```

from browser code.

Firestore Security Rules/backend authorization must restrict:

- Admin record creation
- Admin record updates
- Role changes
- Status changes

to your controlled authorization mechanism.

---

# 21. KEEP STUDENT/FACULTY UNCHANGED

Do not modify:

- Student login
- Faculty login
- Student authorizedUsers documents
- Faculty authorizedUsers documents
- Student dashboard
- Faculty dashboard

This task is specifically for Admin Google authentication.

---

# 22. FINAL AUTHENTICATION ARCHITECTURE

```text id="final-admin-auth"
                    ADMIN LOGIN

                Select "Admin"
                      ↓
              Enter Admin Email
                      ↓
             Check /admins/{email}
                      ↓
                 Exists + Active
                      ↓
                Continue with Google
                      ↓
              Firebase Authentication
                      ↓
              Get authenticated email
                      ↓
              Compare with typed email
                      ↓
                  Match?
                 ↙      ↘
               NO       YES
               ↓          ↓
             Reject     Check
                        /admins again
                           ↓
                      role = ADMIN
                           ↓
                     status = ACTIVE
                           ↓
                  users/{firebaseUid}
                           ↓
                   Admin Dashboard
```

---

# FINAL INSTRUCTION

Add **Continue with Google** to the Admin login flow.

The manual Admin email field must **NOT bypass Firebase Authentication**.

The manual email should first be checked against:

```text
admins/{enteredEmail}
```

Then Google Authentication must authenticate the same email.

The final login condition is:

```text id="final-condition"
Manual email authorized in /admins
+
role = ADMIN
+
status = ACTIVE
+
Google authentication successful
+
Google email == manual email
=
ADMIN LOGIN SUCCESS
```

For your current development test, allow your specific test Gmail only because it is explicitly present in `/admins`.

Do not modify Student or Faculty authentication.

Do not migrate attendance/timetable data in this task.