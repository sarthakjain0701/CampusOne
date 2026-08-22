# POORNIMA ATTENDANCE SYSTEM (PAS)
## PHASE 5 — BATCH 1: ACADEMIC SERVICES DOCUMENTATION

---

### OVERVIEW

Batch 1 implements the complete **Academic Services Layer** for the Poornima Attendance System (PAS). It seamlessly extends the core ERP system with five new academic modules while preserving all existing authentication, role-based controls, dashboard widgets, attendance tracking capabilities, styling tokens, and responsive user interfaces.

---

### 1. DIGITAL LEARNING MODULE

#### Requirements
- Centralized digital learning portal for notes, book suggestions, assignments, tutes, and study materials uploaded by faculty/admin.
- Subject-wise resource categorization with item counts.
- Search and multi-criteria filtering by semester, subject, and resource type (`NOTES`, `BOOK`, `ASSIGNMENT`, `TUTE`, `OTHER`).
- File upload handling with validation for title, subject, resource type, file size, and file type.

#### Workflow
1. **Student Flow**: Student navigates to "Digital Learning" -> Views subject cards -> Clicks "Open Subject" -> Browses categorized material (Notes, Assignments, Tutes, Books) -> Opens or downloads resource.
2. **Faculty Flow**: Faculty navigates to "Digital Learning" -> Views assigned subjects -> Clicks "+ Upload Resource" -> Fills resource metadata & attaches file -> Manages/edits/deletes own uploaded materials.
3. **Admin Flow**: Admin views global learning resources table across all departments -> Adds, edits, deactivates, or deletes any learning material.

#### Roles
- **STUDENT**: View and download active learning resources.
- **FACULTY**: Upload, edit, and delete learning resources for assigned subjects.
- **ADMIN**: Global CRUD and status management for all resources.

#### Data Model (`learningResources`)
```typescript
interface LearningResource {
  id: string; // e.g. RES001
  title: string;
  description?: string;
  subjectId: string; // e.g. SUB001
  facultyId: string; // e.g. FAC001
  resourceType: 'NOTES' | 'BOOK' | 'ASSIGNMENT' | 'TUTE' | 'OTHER';
  fileName: string;
  fileUrl?: string;
  semester: number;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
  uploadedAt: string;
  updatedAt: string;
}
```

#### Services
- `LearningResourceService`:
  - `getAllResources()`
  - `getResourcesBySubject(subjectId)`
  - `getResourcesByType(subjectId, type)`
  - `getFacultyResources(facultyId)`
  - `createResource(data)`
  - `updateResource(id, data)`
  - `deleteResource(id)`

---

### 2. SEMESTER TIMETABLE MODULE

#### Requirements
- Complete semester teaching timetable display for students and faculty.
- Dual view modes: **Week Grid View** and **List View**.
- Dynamic search and filters: Semester, Section, Academic Year, Day.
- Conflict detection validation preventing schedule overlaps for the same class or faculty slot.

#### Workflow
1. **Student Flow**: Student views class timetable in Week Grid or List mode, filtered strictly to their registered section.
2. **Faculty Flow**: Faculty views personal teaching schedule across assigned sections and rooms.
3. **Admin Flow**: Admin adds or modifies timetable entries with time range and room assignments -> System validates time overlap for section and faculty before persisting.

#### Roles
- **STUDENT**: View own section timetable.
- **FACULTY**: View personal teaching timetable.
- **ADMIN**: Full CRUD and schedule collision validation.

#### Data Model (`timetables`)
```typescript
interface TimetableEntry {
  id: string; // e.g. TT001
  academicYear: string;
  semester: number;
  sectionId: string; // e.g. CLS001
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  subjectId: string;
  facultyId: string;
  room: string; // e.g. "LT-101"
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}
```

#### Services
- `TimetableService`:
  - `getStudentTimetable(studentId)`
  - `getFacultyTimetable(facultyId)`
  - `getClassTimetable(sectionId)`
  - `validateTimeOverlap(entry, excludeId)`
  - `createTimetableEntry(data)`
  - `updateTimetableEntry(id, data)`
  - `deleteTimetableEntry(id)`

---

### 3. EXAMINATION RESULTS MODULE

#### Requirements
- View published semester exam results with subject-wise marks, grades, and credits.
- Semester selector dropdown for historical grade card inspection.
- Automated summary calculations: Total Marks, Percentage, SGPA, and Result Status (`PASS` / `FAIL`).
- Status visibility control (`DRAFT` vs `PUBLISHED`).

#### Workflow
1. **Student Flow**: Student selects semester -> Views grade card with marks, grades, credits, SGPA, and PASS status. Only results with `status = 'PUBLISHED'` are visible.
2. **Admin Flow**: Admin creates student exam records -> Enters marks and max marks -> System computes letter grade (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`) -> Toggles status between `DRAFT` and `PUBLISHED`.

#### Roles
- **STUDENT**: View published results only.
- **FACULTY**: View class academic information.
- **ADMIN**: Create, edit, publish, and unpublish student grade records.

#### Data Model (`examResults`)
```typescript
interface ExamResult {
  id: string; // e.g. RES_S1_01
  studentId: string;
  semester: number;
  academicYear: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
  grade: string;
  credits: number;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### Services
- `ExamResultService`:
  - `getStudentResults(studentId, semester)`
  - `getPublishedResults(studentId, semester)`
  - `calculateStudentSummary(studentId, semester)`
  - `createResult(data)`
  - `updateResult(id, data)`
  - `publishResult(id)`
  - `unpublishResult(id)`

---

### 4. HOLIDAY CALENDAR MODULE

#### Requirements
- Centralized college holiday calendar with monthly grid and list view options.
- Holiday category classification: `NATIONAL`, `COLLEGE`, `FESTIVAL`, `ACADEMIC`, `OTHER`.
- Interactive date cells with pop-up details modal for event descriptions.

#### Workflow
1. **Student & Faculty Flow**: Browse upcoming holidays in interactive August 2026 grid or list view -> Click holiday badge to view detailed holiday notes.
2. **Admin Flow**: Admin adds new holiday -> Sets title, date, category, description, and status -> Updates or deletes past entries.

#### Roles
- **STUDENT & FACULTY**: View active holiday calendar and details.
- **ADMIN**: Create, edit, publish, and delete holidays.

#### Data Model (`holidays`)
```typescript
interface Holiday {
  id: string; // e.g. HOL001
  name: string;
  date: string; // YYYY-MM-DD
  type: 'NATIONAL' | 'COLLEGE' | 'FESTIVAL' | 'ACADEMIC' | 'OTHER';
  description?: string;
  academicYear: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}
```

#### Services
- `HolidayService`:
  - `getHolidays(year)`
  - `getUpcomingHolidays()`
  - `createHoliday(data)`
  - `updateHoliday(id, data)`
  - `deleteHoliday(id)`

---

### 5. STUDENT FEE RECEIPTS MODULE

#### Requirements
- View fee payment records and summary metrics (Total Paid, Current Semester, Latest Payment).
- Detailed institutional fee receipt modal complete with Poornima Group branding, student roll number, course, department, semester, and itemized breakdown.
- Native browser print integration (`window.print()` + `@media print` CSS) for clean receipt downloading without external dependencies.

#### Workflow
1. **Student Flow**: Student opens Fee Receipts -> Reviews total paid summary -> Clicks "View Receipt" -> Inspects itemized modal -> Clicks "Print Receipt".
2. **Admin Flow**: Admin inputs student fee receipt details -> Selects student, semester, payment date, amount, payment method -> Issues official fee receipt.

#### Roles
- **STUDENT**: View own fee receipts and print copies.
- **ADMIN**: Issue, edit, track, and delete student fee records.

#### Data Model (`feeReceipts`)
```typescript
interface FeeReceipt {
  id: string; // e.g. FEE001
  receiptNumber: string; // e.g. FR-2026-001
  studentId: string;
  semester: number;
  academicYear: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Services
- `FeeService`:
  - `getStudentFeeReceipts(studentId)`
  - `getStudentFeeSummary(studentId)`
  - `createFeeReceipt(data)`
  - `updateFeeReceipt(id, data)`
  - `deleteFeeReceipt(id)`

---

### FUTURE FIREBASE MAPPING (PHASE 6)

In Phase 6, the decoupled service repository layer (`DataStore`) will map 1:1 to Firestore collections and Firebase Storage buckets without requiring UI component changes:

#### Firestore Collections Mapping
- `learningResources` -> `/learningResources/{resourceId}`
- `timetables` -> `/timetables/{timetableId}`
- `examResults` -> `/examResults/{resultId}`
- `holidays` -> `/holidays/{holidayId}`
- `feeReceipts` -> `/feeReceipts/{receiptId}`

#### Firebase Storage Paths Mapping
- `learning-resources/{subjectId}/{fileName}`
- `fee-receipts/{studentId}/{receiptNumber}.pdf`
