# POORNIMA ATTENDANCE SYSTEM — TEST CASES
## Phase 6: Complete Testing & Bug Fixing

---

## 1. Authentication Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-001 | Auth | Valid Student Login (student@pas.demo) | Student Dashboard opens | Dashboard opens with student name and roll number | ✅ PASS |
| TC-002 | Auth | Valid Faculty Login (faculty@pas.demo) | Faculty Dashboard opens | Faculty Dashboard loads with assignments | ✅ PASS |
| TC-003 | Auth | Valid Admin Login (admin@pas.demo) | Admin Dashboard opens | Admin Dashboard loads with stats | ✅ PASS |
| TC-004 | Auth | Invalid Email (wrong@pas.demo) | Error message displayed | "Invalid email or password" toast shown | ✅ PASS |
| TC-005 | Auth | Empty Email | Validation message | HTML5 required validation triggers | ✅ PASS |
| TC-006 | Auth | Empty Password | Validation message | HTML5 required validation triggers | ✅ PASS |
| TC-007 | Auth | Both Fields Empty | Validation messages | HTML5 required validation triggers | ✅ PASS |
| TC-008 | Auth | Wrong Role Tab | Error message | Role mismatch error shown | ✅ PASS |
| TC-009 | Auth | Logout | Returns to login page | Login page renders correctly | ✅ PASS |
| TC-010 | Auth | Protected Route (no session) | Redirect to login | Login page shown when no session | ✅ PASS |

## 2. Student Navigation Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-011 | Nav | Student Dashboard | Dashboard loads | Loads with attendance gauge, widgets | ✅ PASS |
| TC-012 | Nav | Attendance History | Page loads with records | History table with attendance sessions | ✅ PASS |
| TC-013 | Nav | Digital Learning | Page loads with resources | Learning resources listed with filters | ✅ PASS |
| TC-014 | Nav | Timetable | Page loads with schedule | Weekly timetable grid renders | ✅ PASS |
| TC-015 | Nav | Exam Results | Page loads with grades | Semester results with marks/grades | ✅ PASS |
| TC-016 | Nav | Holiday Calendar | Page loads with holidays | Calendar with holiday entries | ✅ PASS |
| TC-017 | Nav | Fee Receipts | Page loads with receipts | Fee receipts list with amounts | ✅ PASS |
| TC-018 | Nav | Library | Page loads with books | Issued books, overdue, fines displayed | ✅ PASS |
| TC-019 | Nav | Exam Form | Page loads with form | Active exam form with subject selection | ✅ PASS |
| TC-020 | Nav | Digital ID Card | Page loads with ID card | Professional ID card with student data | ✅ PASS |
| TC-021 | Nav | Reports & Analytics | Page loads | Reports page renders | ✅ PASS |
| TC-022 | Nav | Notifications | Page loads with notifications | Notification list with read/unread | ✅ PASS |
| TC-023 | Nav | User Profile | Page loads with profile data | Shows name, email, role, roll number, department, semester | ✅ PASS |
| TC-024 | Nav | Settings | Page loads | Settings page accessible for student | ✅ PASS |
| TC-025 | Nav | Logout | Returns to login | Login page shown | ✅ PASS |

## 3. Faculty Navigation Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-026 | Nav | Faculty Dashboard | Dashboard loads | Faculty dashboard with classes | ✅ PASS |
| TC-027 | Nav | Attendance (Mark) | Page loads | Mark attendance interface | ✅ PASS |
| TC-028 | Nav | Attendance History | Page loads | History table renders | ✅ PASS |
| TC-029 | Nav | Digital Learning | Page loads | Learning resources | ✅ PASS |
| TC-030 | Nav | Timetable | Page loads | Timetable grid | ✅ PASS |
| TC-031 | Nav | Holiday Calendar | Page loads | Calendar renders | ✅ PASS |
| TC-032 | Nav | Students | Page loads | Student list | ✅ PASS |
| TC-033 | Nav | Subjects | Page loads | Subject list | ✅ PASS |
| TC-034 | Nav | Classes | Page loads | Class list | ✅ PASS |
| TC-035 | Nav | Reports | Page loads | Reports render | ✅ PASS |
| TC-036 | Nav | Notifications | Page loads | Notifications list | ✅ PASS |
| TC-037 | Nav | Profile | Page loads | Faculty employee ID, department, designation shown | ✅ PASS |
| TC-038 | Nav | Settings | Page loads | Settings accessible for faculty | ✅ PASS |

## 4. Admin Navigation Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-039 | Nav | Admin Dashboard | Dashboard loads | Dashboard with dynamic stats | ✅ PASS |
| TC-040 | Nav | Mark Attendance | Page loads | Attendance marking interface | ✅ PASS |
| TC-041 | Nav | Attendance History | Page loads | History records | ✅ PASS |
| TC-042 | Nav | Digital Learning | Page loads | Resources listed | ✅ PASS |
| TC-043 | Nav | Timetable | Page loads | Timetable grid | ✅ PASS |
| TC-044 | Nav | Exam Results | Page loads | Results management | ✅ PASS |
| TC-045 | Nav | Holiday Calendar | Page loads | Calendar | ✅ PASS |
| TC-046 | Nav | Fee Receipts | Page loads | Fee management | ✅ PASS |
| TC-047 | Nav | Exam Form Management | Page loads | Form submissions list | ✅ PASS |
| TC-048 | Nav | Students | Page loads | Student CRUD | ✅ PASS |
| TC-049 | Nav | Faculty | Page loads | Faculty management | ✅ PASS |
| TC-050 | Nav | Departments | Page loads | Department list | ✅ PASS |
| TC-051 | Nav | Subjects | Page loads | Subject management | ✅ PASS |
| TC-052 | Nav | Classes | Page loads | Class management | ✅ PASS |
| TC-053 | Nav | Faculty Assignment | Page loads | Assignment management | ✅ PASS |
| TC-054 | Nav | Reports | Page loads | Charts render | ✅ PASS |
| TC-055 | Nav | Notifications | Page loads | Notifications | ✅ PASS |
| TC-056 | Nav | Profile | Page loads | Admin profile with "System Administrator" | ✅ PASS |
| TC-057 | Nav | Settings | Page loads | Admin settings with reset | ✅ PASS |

## 5. Role-Based Access Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-058 | Access | Student accesses admin route | Access Denied toast | "Access Denied" shown, redirected to dashboard | ✅ PASS |
| TC-059 | Access | Student accesses faculty route | Access Denied toast | Access denied for mark-attendance | ✅ PASS |
| TC-060 | Access | Faculty accesses admin-only route | Access Denied toast | Access denied for departments | ✅ PASS |
| TC-061 | Access | Leave Application NOT shown | Not in sidebar | Leave Application does not appear | ✅ PASS |

## 6. Student Dashboard Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-062 | Dashboard | Student name displays | Shows "Rahul Sharma" | Correct | ✅ PASS |
| TC-063 | Dashboard | Roll number displays | Shows actual roll number | Shows PIET-CS-001 (not undefined) | ✅ PASS |
| TC-064 | Dashboard | Attendance gauge | Shows percentage | Circular gauge with valid % | ✅ PASS |
| TC-065 | Dashboard | Subject progress bars | Show per-subject attendance | Progress bars render | ✅ PASS |
| TC-066 | Dashboard | Library widget | Shows issued/overdue/fine | Dynamic counts from service | ✅ PASS |
| TC-067 | Dashboard | Exam Form widget | Shows status | Active exam form status | ✅ PASS |
| TC-068 | Dashboard | Dynamic resource count | Shows actual count | Shows 8 Resources (from MOCK_DATA) | ✅ PASS |
| TC-069 | Dashboard | Dynamic fee total | Shows actual total | Shows ₹85,000 (from data) | ✅ PASS |

## 7. Library Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-070 | Library | Issued books display | Shows current books | Books with status displayed | ✅ PASS |
| TC-071 | Library | Issue date correct | Valid date format | Dates display correctly | ✅ PASS |
| TC-072 | Library | Due date correct | Valid date | Due dates shown | ✅ PASS |
| TC-073 | Library | Return status works | ISSUED/RETURNED/OVERDUE | Status badges display | ✅ PASS |
| TC-074 | Library | Overdue calculation | Correct overdue flag | Overdue books highlighted | ✅ PASS |
| TC-075 | Library | Fine displays | Amount with status | Fine amounts shown | ✅ PASS |

## 8. Exam Form Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-076 | ExamForm | Active exam displays | Open exam shown | End Semester Examination displayed | ✅ PASS |
| TC-077 | ExamForm | Student info prefilled | Read-only identity | Name, roll, enrollment prefilled | ✅ PASS |
| TC-078 | ExamForm | Subject selection | Checkboxes for subjects | Subject list with checkboxes | ✅ PASS |
| TC-079 | ExamForm | Declaration required | Must check before submit | Checkbox required | ✅ PASS |
| TC-080 | ExamForm | Form submission | Application number generated | EXF-YYYY-XXXX number generated | ✅ PASS |
| TC-081 | ExamForm | View submitted form | Read-only details | Submission details displayed | ✅ PASS |
| TC-082 | ExamForm | Admin review | Review submissions | Admin can search, filter, review | ✅ PASS |
| TC-083 | ExamForm | Admin approve | Status changes | Approve with confirmation | ✅ PASS |
| TC-084 | ExamForm | Admin reject | Requires rejection reason | Rejection remark required | ✅ PASS |

## 9. Digital ID Card Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-085 | DigitalID | ID card loads | Card renders | Professional dark-themed card | ✅ PASS |
| TC-086 | DigitalID | Student name correct | Shows logged-in student | Correct name displayed | ✅ PASS |
| TC-087 | DigitalID | Roll number correct | Matches student data | Correct roll number | ✅ PASS |
| TC-088 | DigitalID | Course/Branch correct | B.Tech / CSE | Correct values | ✅ PASS |
| TC-089 | DigitalID | Print button works | Opens print dialog | Print window opens | ✅ PASS |
| TC-090 | DigitalID | Download button works | Triggers download flow | Print-to-PDF suggestion shown | ✅ PASS |

## 10. Profile Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-091 | Profile | Student profile data | Shows roll, department, semester | All fields displayed | ✅ PASS |
| TC-092 | Profile | Faculty profile data | Shows employee ID, designation | Faculty-specific fields shown | ✅ PASS |
| TC-093 | Profile | Admin profile data | Shows "System Administrator" | Admin level shown | ✅ PASS |
| TC-094 | Profile | Security status text | "Session Active" | Correct (not "Firebase Auth Verified") | ✅ PASS |

## 11. Responsive Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-095 | Responsive | 320px viewport | No overflow | Content fits, single column layout | ✅ PASS |
| TC-096 | Responsive | 375px viewport | Mobile layout | Cards stack, sidebar hidden | ✅ PASS |
| TC-097 | Responsive | 768px viewport | Tablet layout | Two-column where appropriate | ✅ PASS |
| TC-098 | Responsive | 1024px viewport | Desktop layout | Sidebar visible, multi-column | ✅ PASS |
| TC-099 | Responsive | 1440px viewport | Large desktop | Proper spacing, no excess gaps | ✅ PASS |
| TC-100 | Responsive | Mobile sidebar | Hamburger menu works | Sidebar opens/closes on toggle | ✅ PASS |
| TC-101 | Responsive | Login page mobile | Form fills screen | Hero hidden, form centered | ✅ PASS |

## 12. Accessibility Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-102 | A11y | Focus states visible | Outline on focused elements | Blue outline on focus-visible | ✅ PASS |
| TC-103 | A11y | Form labels present | Labels for inputs | All form inputs have labels | ✅ PASS |
| TC-104 | A11y | Button labels | Descriptive text | All buttons have text labels | ✅ PASS |
| TC-105 | A11y | Color-independent status | Text accompanies color | Status badges have text labels | ✅ PASS |

## 13. Data Consistency Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-106 | Data | Student name consistent | Same across pages | Matches on Dashboard, Profile, ID Card | ✅ PASS |
| TC-107 | Data | Roll number consistent | Same across pages | Matches on Dashboard, Profile, ID Card, Exam Form | ✅ PASS |
| TC-108 | Data | Attendance calculation | Present/Total × 100 | No NaN%, no Infinity% | ✅ PASS |
| TC-109 | Data | 0 classes edge case | Shows 100% (default) | Default baseline applied | ✅ PASS |

## 14. Error/Loading/Empty State Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-110 | States | Empty notifications | "No notifications found" | Empty state message shown | ✅ PASS |
| TC-111 | States | Empty attendance sessions | "No attendance sessions" | Empty state with icon shown | ✅ PASS |
| TC-112 | States | Invalid route | 404 page | Professional 404 with "Return to Dashboard" | ✅ PASS |

## 15. Firebase Verification

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-113 | Firebase | No Firebase SDK loaded | No Firebase imports | No Firebase script tags in index.html | ✅ PASS |
| TC-114 | Firebase | No Firebase initialization | No Firebase init calls | Mock auth only | ✅ PASS |
| TC-115 | Firebase | No Firebase references in UI | No "Firebase" text | "Session Active" instead of "Firebase Auth Verified" | ✅ PASS |

---

## 16. QR Digital ID System & Verification Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-116 | QR/DigitalID | Student QR Generation | Format `PAMS\|STUDENT\|REG-2026-001` | Unique scannable SVG QR Code generated | ✅ PASS |
| TC-117 | QR/DigitalID | Faculty QR Generation | Format `PAMS\|FACULTY\|EMP-FAC-101` | Unique scannable SVG QR Code generated | ✅ PASS |
| TC-118 | QR/DigitalID | Admin ID Card Switcher | Toggle between Student and Faculty | Renders correct ID card for selected tab | ✅ PASS |
| TC-119 | QR/DigitalID | QR Scanner Launch | Camera stream or test simulation buttons | Scanner modal opens with fallback options | ✅ PASS |
| TC-120 | QR/DigitalID | Valid Student QR Verification | Displays `✓ USER VERIFIED` modal | Shows photo, name, reg no, department, library status | ✅ PASS |
| TC-121 | QR/DigitalID | Valid Faculty QR Verification | Displays `✓ FACULTY VERIFIED` modal | Shows photo, name, faculty ID, department, designation | ✅ PASS |
| TC-122 | QR/DigitalID | Invalid QR Rejection | Displays `✕ INVALID QR CODE` modal | Rejection message shown, app does not crash | ✅ PASS |
| TC-123 | QR/DigitalID | Inactive Account Rejection | Displays `⚠️ ID INACTIVE` modal | Inactive warning shown, operation restricted | ✅ PASS |
| TC-124 | QR/DigitalID | Library Book Issue via Scan QR | Scans student QR -> opens issue form | Pre-fills borrower info & library status, issues book | ✅ PASS |
| TC-125 | QR/DigitalID | Library Book Return via Scan QR | Scans student QR -> lists active books | Processes return and updates fine calculation | ✅ PASS |
| TC-126 | QR/DigitalID | Manual Search Fallback | `[Search User]` option available | Both `[Search User]` and `[Scan QR]` functional | ✅ PASS |
| TC-127 | QR/DigitalID | Digital ID Print | Vector QR code visible in print dialog | High-res vector SVG QR code rendered | ✅ PASS |
| TC-128 | QR/DigitalID | Digital ID Download | High-resolution PDF/Print prompt | Clean printable layout generated | ✅ PASS |

## 17. Final Notification System Testing

| ID | Module | Test | Expected | Actual | Status |
|----|--------|------|----------|--------|--------|
| TC-129 | Notifications | Role Isolation (Student) | Student notifications only | `USR_STU_01` notifications loaded strictly | ✅ PASS |
| TC-130 | Notifications | Role Isolation (Faculty) | Faculty notifications only | `USR_FAC_01` notifications loaded strictly | ✅ PASS |
| TC-131 | Notifications | Role Isolation (Admin) | Admin notifications only | `USR_ADMIN_01` notifications loaded strictly | ✅ PASS |
| TC-132 | Notifications | Navbar Bell Badge Count | Exact unread count pill | Shows exact number (e.g. 5), `99+` for 100+ | ✅ PASS |
| TC-133 | Notifications | Navbar Bell Zero Unread | Badge hidden when 0 unread | Badge element hidden cleanly | ✅ PASS |
| TC-134 | Notifications | Navbar Dropdown Toggle | Preview menu opens on bell click | Shows top 5 notifications with priority pills | ✅ PASS |
| TC-135 | Notifications | Dropdown Outside Click | Closes dropdown when clicking outside | Dropdown hides on document click | ✅ PASS |
| TC-136 | Notifications | Notification Center Tabs | `[ALL]`, `[UNREAD]`, `[READ]` | Filtering works as expected | ✅ PASS |
| TC-137 | Notifications | Priority Indicators | High (Red), Medium (Amber), Low (Slate) | Priority badges display accurately | ✅ PASS |
| TC-138 | Notifications | Rejection Reason Display | Shows `Reason: <remark>` for rejected forms | Highlighted rejection box displayed | ✅ PASS |
| TC-139 | Notifications | Mark as Read | Single item becomes read | Card updates, unread badge count decreases | ✅ PASS |
| TC-140 | Notifications | Mark All as Read | Current user unread count becomes 0 | Isolated to logged-in user, count resets to 0 | ✅ PASS |
| TC-141 | Notifications | Open Module Navigation | Navigates to related page | `[Open Module]` redirects to target view | ✅ PASS |
| TC-142 | Notifications | Domain Event (Attendance) | Emits notification on save | `ATTENDANCE_MARKED` notification created | ✅ PASS |
| TC-143 | Notifications | Domain Event (Exam Form) | Emits approved/rejected alert | Approved / Rejected alert created with reason | ✅ PASS |
| TC-144 | Notifications | Domain Event (Library Issue) | Emits due reminder alert | `LIBRARY_DUE_REMINDER` created | ✅ PASS |
| TC-145 | Notifications | Duplicate Prevention | No duplicate notifications in 60s | Duplicate system alerts blocked | ✅ PASS |

---

## Summary

| Category | Total | Passed | Failed |
|----------|-------|--------|--------|
| Authentication | 10 | 10 | 0 |
| Student Navigation | 15 | 15 | 0 |
| Faculty Navigation | 13 | 13 | 0 |
| Admin Navigation | 19 | 19 | 0 |
| Role-Based Access | 4 | 4 | 0 |
| Student Dashboard | 8 | 8 | 0 |
| Library | 6 | 6 | 0 |
| Exam Form | 9 | 9 | 0 |
| Digital ID Card | 6 | 6 | 0 |
| Profile | 4 | 4 | 0 |
| Responsive | 7 | 7 | 0 |
| Accessibility | 4 | 4 | 0 |
| Data Consistency | 4 | 4 | 0 |
| Error/Loading/Empty | 3 | 3 | 0 |
| Firebase Verification | 3 | 3 | 0 |
| QR Digital ID & Verification | 13 | 13 | 0 |
| Final Notification System | 17 | 17 | 0 |
| **TOTAL** | **145** | **145** | **0** |
