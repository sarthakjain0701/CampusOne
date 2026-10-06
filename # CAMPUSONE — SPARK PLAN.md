# CAMPUSONE — SPARK PLAN

# PHASE 1: CAMPUS INTELLIGENCE FOUNDATION

We are now starting implementation of the new **CampusOne Campus Intelligence** layer.

## PRIMARY REQUIREMENT

CampusOne must remain compatible with the **Firebase Spark / no-cost architecture**.

The Campus Intelligence layer MUST NOT depend on:

* Firebase Cloud Functions
* Cloud Run
* BigQuery
* Pub/Sub
* Firebase scheduled functions
* paid Google Cloud services
* Blaze-only Firebase functionality
* any server-side AI infrastructure

Use the existing Firebase client + Firestore data wherever possible.

---

# IMPORTANT — PRESERVE EXISTING SYSTEM

This is an enhancement to the existing CampusOne application.

DO NOT break or redesign existing functionality.

DO NOT modify:

* Firebase Authentication architecture
* Firestore security rules
* RBAC
* ADMIN / FACULTY / LAB_ASSISTANT / LIBRARIAN / STUDENT roles
* existing routes
* existing Firestore collections
* attendance logic
* timetable logic
* assignment logic
* examination logic
* mid-term marks logic
* library logic
* laboratory problem-report logic
* Digital Learning logic
* notification logic
* existing Firebase configuration
* Cloudflare provisioning implementation
* desktop UI
* mobile UI
* existing navigation

Do NOT remove existing features.

Do NOT migrate existing functionality.

Do NOT introduce mock data.

Do NOT use localStorage as a replacement for Firestore.

Do NOT create duplicate copies of existing Firestore data.

---

# PHASE 1 GOAL

Create the **foundation architecture** for Campus Intelligence.

The first implementation should focus on:

1. Campus Intelligence service foundation
2. Deterministic analytics utilities
3. Attendance analytics
4. Attendance forecasting calculations
5. Attendance What-If calculations
6. Explainable evidence model
7. Role-safe intelligence data access
8. Performance-safe Firestore reads

Do NOT implement the complete AI assistant yet.

Do NOT add external AI APIs yet.

---

# 1. INSPECT EXISTING PROJECT FIRST

Before editing:

Inspect the active project and identify:

* Firebase initialization
* Firestore service
* current attendance service
* assignment service
* examination service
* timetable service
* student service
* faculty service
* library service
* laboratory/problem-report service
* Digital Learning service
* notification service
* current role resolver
* current dashboard views

Use the existing service architecture.

Do not create duplicate services when an existing service can safely provide the required data.

---

# 2. CREATE CAMPUS INTELLIGENCE SERVICE

If the existing architecture supports it, create:

```text
js/services/campusIntelligenceService.js
```

The service must initially contain only deterministic/local calculations.

It must NOT call an external AI API.

It must NOT require Cloud Functions.

It must NOT write intelligence results to Firestore.

Intelligence should initially be calculated from existing data at runtime.

---

# 3. ATTENDANCE ANALYTICS

Implement reusable deterministic functions for:

### Current Attendance

Calculate:

```text
attendancePercentage =
presentClasses / totalMarkedClasses * 100
```

Handle:

* zero classes
* missing values
* invalid values
* not-marked records

Do not modify existing attendance records.

---

# 4. ATTENDANCE WHAT-IF ENGINE

Implement calculations such as:

### Scenario A

```text
Current attendance
+
N future present classes
```

### Scenario B

```text
Current attendance
+
N future absent classes
```

### Scenario C

```text
Classes required to reach target percentage
```

Default target may be:

```text
75%
```

BUT:

Do not hardcode this into existing attendance business logic.

Keep it as a Campus Intelligence calculation parameter.

Example:

```text
Current = 68%
Target = 75%

Required future present classes = X
```

Return structured data, not UI HTML.

Example structure:

```js
{
    currentPercentage,
    targetPercentage,
    projectedPercentage,
    additionalPresentClasses,
    scenarioType
}
```

---

# 5. ATTENDANCE FUTURE FORECAST

Create a deterministic forecast based only on known upcoming timetable/attendance information.

Example:

```text
Current attendance: 72%

Upcoming classes: 5

If all attended:
75%

If all missed:
66%
```

Display this as:

```text
Current
72%

Best-case projection
75%

Worst-case projection
66%
```

Do NOT call this machine-learning prediction.

Label it:

```text
Attendance Projection
```

because it is a mathematical scenario.

---

# 6. ATTENDANCE TREND

Where historical attendance data supports it, calculate:

```text
Improving
Stable
Declining
```

Use actual historical records.

Do not invent trend data.

Use a simple deterministic comparison.

Example:

```text
Recent period: 76%
Previous period: 82%

Trend: Declining
Change: -6 percentage points
```

---

# 7. EARLY SIGNAL FOUNDATION

Create a reusable signal structure.

Example:

```js
{
    type: "ATTENDANCE",
    severity: "INFO",
    title: "...",
    evidence: [],
    suggestedAction: "...",
    generatedAt: ...
}
```

Possible initial signals:

### Attendance below target

```text
Attendance below 75%
```

### Attendance declining

```text
Attendance decreased during recent period
```

Do NOT implement AI risk scores.

Do NOT use arbitrary percentages like:

```text
Risk = 83%
```

unless there is a mathematically defined calculation.

---

# 8. EXPLAINABILITY

Every intelligence signal must have evidence.

Example:

```text
⚠ Attendance Signal

Current attendance: 68%

Evidence:
• 17 present
• 8 absent
• Attendance below 75% target

Suggested action:
Attend upcoming classes.
```

Do not create unexplained AI conclusions.

---

# 9. ROLE SECURITY

Campus Intelligence must respect existing RBAC.

### STUDENT

Only their own data.

### FACULTY

Only authorized students/classes.

### LAB_ASSISTANT

Only authorized laboratory information.

### LIBRARIAN

Only authorized library information.

### ADMIN

Institution-level information permitted by existing rules.

Do not bypass Firestore rules.

Do not create privileged client access.

---

# 10. FIRESTORE PERFORMANCE

This is extremely important.

Do NOT introduce:

```js
collection.get()
```

for large collections without appropriate constraints.

Avoid unbounded reads.

Reuse existing service methods where they already use:

* userId filters
* subject filters
* class filters
* department filters
* limits
* pagination

Do not create realtime listeners for intelligence unless genuinely required.

Campus Intelligence should preferably calculate from already-loaded/authorized data.

---

# 11. NO FIRESTORE INTELLIGENCE COLLECTION YET

Do NOT create:

```text
campusIntelligence
intelligenceSignals
studentRisk
aiPredictions
```

collections in this phase.

The first version should calculate intelligence at runtime.

This avoids:

* duplicated data
* stale intelligence
* unnecessary writes
* unnecessary Firestore costs

---

# 12. DASHBOARD INTEGRATION

Add only a small foundation UI where appropriate.

For Student Dashboard, if the existing architecture allows it without redesign:

```text
Campus Intelligence

Attendance Projection
Current: 72%
Best case: 75%

[Explore]
```

For other roles, do not redesign dashboards yet.

Keep the existing UI.

The purpose of Phase 1 is functionality foundation, not visual redesign.

---

# 13. MOBILE COMPATIBILITY

Any new UI must work with the existing responsive/mobile CSS.

Do not create a separate mobile application.

Do not change desktop styling unnecessarily.

---

# 14. ERROR HANDLING

Campus Intelligence must never break the main application.

If intelligence calculation fails:

```text
Campus Intelligence unavailable
```

The existing dashboard must continue working.

No uncaught errors.

No infinite loading.

---

# 15. DATA SAFETY

Never:

* expose another student's private information
* bypass authorization
* expose Firebase secrets
* store passwords
* store ID tokens
* write sensitive intelligence data unnecessarily

---

# 16. TESTING

Perform static/local validation only.

Test deterministic calculations with representative cases:

### Case 1

```text
Present = 18
Absent = 2
Expected = 90%
```

### Case 2

```text
Present = 17
Absent = 8
Expected = 68%
```

### Case 3

```text
Present = 0
Absent = 0
Expected = safe zero/undefined handling
```

### What-if

Verify:

```text
current = 68%
future present = 7
```

against the mathematical result.

Also test:

```text
future absent
target percentage
zero-data case
invalid/missing fields
```

---

# 17. BUILD VALIDATION

After implementation:

Run the project's existing validation commands.

At minimum:

```text
JavaScript syntax validation
TypeScript validation if applicable
Production build
```

Do not deploy.

Do not modify Firebase.

Do not deploy Cloudflare.

---

# 18. FILE CHANGE LIMIT

Keep changes minimal.

Expected new/modified areas:

```text
Campus Intelligence service
Relevant Student Dashboard integration
Tests/utilities if the project already has a test structure
```

Do not modify unrelated modules.

---

# 19. FINAL REPORT

Return:

## Implementation Status

PASS / PARTIAL / BLOCKED

## Campus Intelligence Service

Explain what was implemented.

## Attendance Analytics

List implemented calculations.

## What-If Simulator

List supported scenarios.

## Attendance Projection

Explain how it works.

## Early Signals

List implemented signals.

## Explainability

Explain how evidence is represented.

## RBAC

Confirm role isolation.

## Spark Compatibility

Explicitly confirm:

```text
Firebase Cloud Functions: NOT REQUIRED
Cloud Run: NOT REQUIRED
BigQuery: NOT REQUIRED
Pub/Sub: NOT REQUIRED
External AI API: NOT REQUIRED
Blaze plan: NOT REQUIRED
```

## Performance

Report whether any unbounded Firestore reads were introduced.

## Files Changed

List exact files.

## Validation

Report:

* syntax
* tests
* build

## Live Testing

```text
NOT PERFORMED
```

The user will perform live testing manually.

## Backend Changes

Must say:

```text
NONE
```

## FINAL RULE

STOP after Phase 1.

Do not automatically start Phase 2.

Do not redesign the UI.

Do not add additional features beyond this phase.
