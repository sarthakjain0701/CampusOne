# Phase 3 - Security & Performance Stabilization

## Implementation Pass 1 Verification

**Temp Password Security**: PASS
- `functions/index.js` returns only the required fields securely without logging.
- `UIService.openModal` correctly displays the password for the Admin to copy, does not persist it, and is destroyed on close.

**Firestore Performance**: FAIL
- Some `.limit()` additions are unsafe for functionality. 
- The unbounded read in `libraryBackendService.js` (searchMembers) was missed and remains completely unfixed.

**Library Backend Reads**: FAIL
- `libraryBackendService.js` still executes an unbounded `authorizedUsers.get()` and `faculties.get()` during `searchMembers()`.

**Listener Lifecycle**: PASS
- `app.js` now cleanly stops `LibraryService` real-time listeners when navigating away from `library-circulation`.
- Re-entry does not create duplicates as `LibraryService` cleans its own array before instantiating a new listener.

**Error Handling**: PASS
- Removed silent `catch(e => { return { docs: [] } })` blocks in `adminService.js`, `libraryService.js`, and `libraryView.js`.
- Queries now fail cleanly and propagate the error so the UI can accurately present a failure state instead of "no data".

**Security Regression**: PASS
- No modifications were made to `firestore.rules`.
- `provisionUser` Cloud Function retains its internal admin verification and rollback mechanisms.
- RBAC logic remains untouched.

**Step 2 Regression**: PASS
- Step 2 modules (`referenceMigrationService.js`, `timetableService.js`, `attendanceAssignmentService.js`, etc.) remain fully intact. No overlapping code was removed.

### Query & Limit Safety Evaluation

| FILE | QUERY | LIMIT | SAFE? | REASON |
|------|-------|-------|-------|--------|
| `libraryService.js` | `getBooks()` | `100` | NO | Used in the UI (circulation modal) to populate a dropdown. Limiting to 100 truncates the catalog, breaking the issue-book workflow for books beyond the limit. Requires server-side search or pagination. |
| `attendanceService.js` | `getAttendance()` | `100` | NO | Used to fetch attendance. The client-side logic then filters by `studentId`. An initial fetch limit of 100 causes the client to receive 100 random records and filter them, resulting in virtually 0 records for any given student. Needs a `where('studentId', '==', user.uid)` clause directly instead of a blind limit. |
| `assignmentService.js` | `getAssignments()` | `200` | NO | Used by Faculty dashboards to list their classes. A flat limit risks truncating assignments in a large system. It should either be unbounded if treated as a small reference dataset, or properly paginated/filtered by `facultyId`. |
| `libraryBackendService.js` | `searchMembers()` | `None` | NO | Still performs an entirely unbounded read on `authorizedUsers` and `faculties`. |
