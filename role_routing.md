# PAMS — Test Firebase Email/Password Authentication + Role-Based Portal Routing

## OBJECTIVE

Connect the existing PAMS login page to the already-configured Firebase Authentication Email/Password provider and verify that authenticated users are routed to the correct portal based on their Firestore role.

CURRENT TEST DATA ALREADY EXISTS:

### Firebase Authentication

There are already 4 test users in:

```text
Firebase Console
→ Authentication
→ Users
```

### Firestore

There are already:

```text
admins
→ 2 documents

faculties
→ 1 document

authorizedUsers
→ 2 Student documents
```

The Firestore documents already contain role values:

```text
ADMIN
FACULTY
STUDENT
```

Do NOT create additional users.

Do NOT modify the existing test user credentials.

Do NOT add Google Sign-In.

The current authentication method for this test is:

```text
Email + Password
```

---

# 1. LOGIN PAGE

Keep the existing role selector:

```text
Login As:

○ Student
○ Faculty
○ Admin
```

Keep the existing email and password fields.

Example:

```text
┌──────────────────────────────────────────┐
│             PAMS LOGIN                   │
│                                          │
│ Login As                                 │
│ ○ Student   ○ Faculty   ○ Admin          │
│                                          │
│ Email                                    │
│ [____________________________]           │
│                                          │
│ Password                                 │
│ [____________________________]           │
│                                          │
│             [ Sign In ]                  │
└──────────────────────────────────────────┘
```

Do not add a Sign Up option.

Do not add Google Sign-In.

---

# 2. AUTHENTICATION FLOW

When the user clicks:

```text
Sign In
```

use Firebase Email/Password Authentication.

Flow:

```text
Email + Password
      ↓
Firebase Authentication
      ↓
Authentication successful?
      ↓
YES
      ↓
Get Firebase user email + UID
      ↓
Check PAMS Firestore role/authorization
      ↓
Route to correct portal
```

If Firebase authentication fails:

```text
Invalid email or password.
```

Do not reveal which credential was incorrect.

---

# 3. IMPORTANT — DO NOT TRUST THE SELECTED ROLE

The role selected on the login page is NOT the final authority.

For example:

```text
User selects:
Admin
```

does not automatically make them Admin.

The system must verify the authenticated email against the Firestore data.

---

# 4. STUDENT LOGIN LOOKUP

When:

```text
Student
```

is selected and Firebase authentication succeeds:

Look up the authenticated email in:

```text
authorizedUsers
```

Use the exact authenticated email.

Example:

```text
authorizedUsers/{authenticatedEmail}
```

Check:

```text
role == "STUDENT"
```

and:

```text
status == "ACTIVE"
```

if the existing document contains a status field.

If valid:

```text
Firebase Auth ✅
Firestore user found ✅
Role = STUDENT ✅
Status = ACTIVE ✅
```

Then:

```text
→ Open Student Dashboard
```

---

# 5. FACULTY LOGIN LOOKUP

When:

```text
Faculty
```

is selected and Firebase authentication succeeds:

Look up the authenticated email in:

```text
faculties
```

Use:

```text
faculties/{authenticatedEmail}
```

Check:

```text
role == "FACULTY"
```

and:

```text
status == "ACTIVE"
```

if the field exists.

If valid:

```text
Firebase Auth ✅
Faculty document found ✅
Role = FACULTY ✅
Status = ACTIVE ✅
```

Then:

```text
→ Open Faculty Dashboard
```

---

# 6. ADMIN LOGIN LOOKUP

When:

```text
Admin
```

is selected and Firebase authentication succeeds:

Look up the authenticated email in:

```text
admins
```

Use:

```text
admins/{authenticatedEmail}
```

Check:

```text
role == "ADMIN"
```

and:

```text
status == "ACTIVE"
```

if the field exists.

If valid:

```text
Firebase Auth ✅
Admin document found ✅
Role = ADMIN ✅
Status = ACTIVE ✅
```

Then:

```text
→ Open Admin Dashboard
```

---

# 7. ROLE MISMATCH PROTECTION

The system must prevent users from entering the wrong portal simply by changing the role selector.

### Example

Suppose a Student email belongs to:

```text
authorizedUsers
role = STUDENT
```

but the user selects:

```text
Admin
```

Expected:

```text
Firebase Authentication ✅
Admin Firestore lookup ❌
```

Result:

```text
You are not authorized to access the Admin Portal.
```

Do NOT open the Admin Dashboard.

---

# 8. FACULTY-AS-STUDENT TEST

Suppose a Faculty email exists in:

```text
faculties
role = FACULTY
```

and the user selects:

```text
Student
```

Expected:

```text
Student lookup → not authorized
```

Result:

```text
This account is not registered as a Student.
```

Do not open Student Dashboard.

---

# 9. ADMIN-AS-FACULTY TEST

Suppose an Admin email exists in:

```text
admins
role = ADMIN
```

and the user selects:

```text
Faculty
```

Expected:

```text
Faculty lookup → not authorized
```

Result:

```text
This account is not registered as Faculty.
```

Do not open Faculty Dashboard.

---

# 10. WRONG COLLECTION MUST DENY ACCESS

Do NOT do this:

```text
Search all collections
→ find email anywhere
→ use whatever role is found
```

Instead, the selected role determines the authorized collection:

```text
Student → authorizedUsers
Faculty → faculties
Admin → admins
```

Then verify the role inside that document.

This is required for the current login architecture.

---

# 11. EXACT EMAIL MATCH

Use the authenticated Firebase email.

Do not trust:

- typed name
- manually entered role
- arbitrary UID
- frontend-generated email
- partial email match

Require an exact document match.

Example:

```text
2025pietcssarthak149@poornima.org
```

must match:

```text
authorizedUsers/
2025pietcssarthak149@poornima.org
```

Do not allow partial matching.

---

# 12. ACTIVE STATUS

If the Firestore document contains:

```text
status
```

require:

```text
ACTIVE
```

If the account is:

```text
INACTIVE
```

deny portal access even if Firebase Authentication succeeds.

Message:

```text
Your PAMS account is inactive. Please contact the administrator.
```

Do not log the user into any portal.

---

# 13. SUCCESSFUL PORTAL ROUTING

### Student

```text
Firebase Auth
      ↓
authorizedUsers
      ↓
role = STUDENT
      ↓
Student Dashboard
```

### Faculty

```text
Firebase Auth
      ↓
faculties
      ↓
role = FACULTY
      ↓
Faculty Dashboard
```

### Admin

```text
Firebase Auth
      ↓
admins
      ↓
role = ADMIN
      ↓
Admin Dashboard
```

---

# 14. SESSION HANDLING

After successful login, preserve the Firebase authenticated session using the existing Firebase Auth persistence.

On page refresh:

```text
Firebase session
      ↓
Get current user
      ↓
Load corresponding PAMS profile
      ↓
Restore correct portal
```

Do not make the user select a different role after every refresh if the existing application architecture can determine the authorized role from Firestore.

However, still verify the user's current authorization.

---

# 15. LOGOUT

Logout should call Firebase sign-out.

Flow:

```text
Logout
  ↓
Firebase signOut
  ↓
Clear local application state
  ↓
Return to Login page
```

After logout, protected dashboard routes must not remain accessible.

---

# 16. DO NOT MODIFY BUSINESS MODULES

This task is authentication + portal routing only.

Do NOT change:

- Attendance
- Attendance History
- Timetable
- Mid-Term Marks
- Results
- Hall Ticket
- Library
- Notifications
- Reports & Analytics
- Digital Learning
- Exam Form
- Digital ID

Only ensure that the correct dashboard opens after authentication.

---

# 17. DO NOT MODIFY FIREBASE TEST USERS

The Firebase Authentication users have already been created.

Do NOT:

- Delete them
- Recreate them
- Change their passwords
- Change their emails
- Create additional users

Use the existing 4 test users exactly as they are.

---

# 18. DO NOT MODIFY FIRESTORE TEST DOCUMENTS

Existing test records are already created.

Do NOT delete or rename them.

Do NOT change role values unless a test specifically requires checking a mismatch.

Use the current records to validate routing.

---

# 19. TEST MATRIX

Test all valid accounts.

### Student Test 1

```text
Role selected: Student
Email: existing Student test account #1
Password: existing Firebase password
```

Expected:

```text
Authentication ✅
authorizedUsers ✅
Role STUDENT ✅
Student Dashboard ✅
```

### Student Test 2

Use the second existing Student test account.

Expected:

```text
Student Dashboard ✅
```

### Faculty Test

```text
Role selected: Faculty
Email: existing Faculty test account
Password: existing Firebase password
```

Expected:

```text
Authentication ✅
faculties lookup ✅
Role FACULTY ✅
Faculty Dashboard ✅
```

### Admin Test 1

```text
Role selected: Admin
Email: existing Admin test account #1
Password: existing Firebase password
```

Expected:

```text
Authentication ✅
admins lookup ✅
Role ADMIN ✅
Admin Dashboard ✅
```

### Admin Test 2

Repeat with the second Admin test account.

Expected:

```text
Admin Dashboard ✅
```

---

# 20. NEGATIVE TESTS

Test role mismatch.

### Student account selected as Admin

Expected:

```text
❌ Access denied
```

### Student account selected as Faculty

Expected:

```text
❌ Access denied
```

### Faculty account selected as Student

Expected:

```text
❌ Access denied
```

### Faculty account selected as Admin

Expected:

```text
❌ Access denied
```

### Admin account selected as Student

Expected:

```text
❌ Access denied
```

### Admin account selected as Faculty

Expected:

```text
❌ Access denied
```

---

# 21. INVALID CREDENTIAL TEST

Enter an incorrect password.

Expected:

```text
Invalid email or password.
```

Do not perform Firestore role lookup if Firebase Authentication itself fails.

---

# 22. UNREGISTERED USER TEST

Use a Firebase authenticated user whose email does not exist in the appropriate PAMS collection.

Expected:

```text
Account is not authorized for the selected portal.
```

Do not open any dashboard.

---

# 23. NO SIGNUP

There must be no:

```text
Sign Up
Register
Create Account
```

Users are provisioned by the system/developer/admin process.

---

# 24. SECURITY

Do not trust frontend role selection.

Do not allow the user to manipulate:

```text
role = ADMIN
```

from browser developer tools.

Firestore Security Rules/backend authorization must enforce role access.

The application should use:

```text
Firebase Authentication
+
Firestore role verification
+
Protected routes
```

---

# 25. PERFORMANCE

Login should not load:

- all students
- all faculty
- all admins
- all attendance
- all timetable data
- all results
- all library records

Only perform the authentication and the single role-specific authorization lookup necessary for the current login.

---

# 26. ERROR HANDLING

Handle:

- Invalid email/password
- Firestore document not found
- Wrong role
- Inactive account
- Firebase initialization failure
- Network failure
- Logout failure

Do not expose raw Firebase errors.

---

# 27. DEBUG LOGGING

During development, log safe information:

```text
Selected role: STUDENT
Authenticated email: ...
Collection checked: authorizedUsers
Authorization record found: true/false
Database role: STUDENT
Status: ACTIVE
Routing to: Student Dashboard
```

Do not log:

- Password
- ID token
- Refresh token
- Firebase secrets

---

# 28. FINAL ACCEPTANCE CRITERIA

- [ ] Student email + correct password opens Student Portal.
- [ ] Second Student email + correct password opens Student Portal.
- [ ] Faculty email + correct password opens Faculty Portal.
- [ ] Admin email + correct password opens Admin Portal.
- [ ] Student cannot enter Faculty Portal.
- [ ] Student cannot enter Admin Portal.
- [ ] Faculty cannot enter Student Portal.
- [ ] Faculty cannot enter Admin Portal.
- [ ] Admin cannot enter Student Portal.
- [ ] Admin cannot enter Faculty Portal.
- [ ] Exact email lookup works.
- [ ] Correct Firestore collection is used.
- [ ] Role is verified against Firestore.
- [ ] Status is verified where available.
- [ ] Invalid credentials are rejected.
- [ ] Unregistered users are rejected.
- [ ] Logout works.
- [ ] Refresh preserves correct authenticated session.
- [ ] No signup functionality exists.
- [ ] Existing test users are not modified.
- [ ] Faculty and Admin business modules remain unchanged.
- [ ] No critical console errors remain.

---

# FINAL INSTRUCTION

Implement the **Firebase Email/Password login + Firestore role verification + role-based portal routing** using the existing test users.

Use this exact mapping:

```text
STUDENT
→ authorizedUsers
→ role = STUDENT
→ Student Portal

FACULTY
→ faculties
→ role = FACULTY
→ Faculty Portal

ADMIN
→ admins
→ role = ADMIN
→ Admin Portal
```

The selected role on the login page is only the **requested portal**. It is NOT proof of authorization.

The authenticated Firebase email and the Firestore record must be checked before opening any portal.

Do not modify any attendance, timetable, result, library, notification, or other business functionality in this task.