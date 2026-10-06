# CAMPUSONE — SPARK PLAN

# PHASE 2: STUDENT ATTENDANCE INTELLIGENCE + WHAT-IF SIMULATOR

Phase 1 has been completed successfully.

Existing implementation:

```text
js/services/campusIntelligenceService.js
index.html
js/views/dashboardStudent.js
```

Phase 1 provides deterministic:

* attendance percentage
* future-present projection
* future-absent projection
* target achievement calculation
* attendance signals
* explainable evidence

Now implement **Phase 2: Student Attendance Intelligence + What-If Simulator**.

---

# CRITICAL RULE

This phase is a **Student UI + deterministic calculation enhancement only**.

DO NOT modify or replace existing backend architecture.

DO NOT modify:

* Firebase Authentication
* Firestore security rules
* RBAC
* Cloud Functions
* Cloudflare Worker
* Firestore collections
* attendance records/schema
* attendance marking logic
* attendance assignment logic
* timetable logic
* existing Attendance History
* existing Faculty Attendance
* existing Admin Attendance
* existing Student Attendance functionality

Do not introduce Blaze-only services.

Everything must remain compatible with the **Firebase Spark plan**.

---

# 1. USE PHASE 1 SERVICE

Reuse:

```text
js/services/campusIntelligenceService.js
```

Do NOT create another attendance intelligence service.

Extend the existing service only when necessary.

Keep calculations deterministic.

No external AI API.

No machine-learning model.

No Cloud Function.

No new Firestore collection.

---

# 2. STUDENT DASHBOARD

Improve the existing Student Dashboard Attendance Projection area.

Do NOT redesign the entire dashboard.

Keep the existing CampusOne UI style and existing layout.

Add a clearly separated:

```text
Campus Intelligence
```

section.

Suggested structure:

```text
┌──────────────────────────────────────────────┐
│ Campus Intelligence                          │
│ Attendance Projection                        │
│                                              │
│ Current Attendance                           │
│ 68%                                          │
│                                              │
│ Best Case                                    │
│ 75%                                          │
│                                              │
│ Worst Case                                   │
│ 64%                                          │
│                                              │
│ Target                                       │
│ 75%                                          │
│                                              │
│ [ What-If Simulator ]                        │
└──────────────────────────────────────────────┘
```

Use the existing visual design.

Do not introduce a completely new dashboard design.

---

# 3. WHAT-IF SIMULATOR

Create a student-accessible What-If Simulator.

It can open as:

* modal
* expandable panel
* dedicated section

Choose whichever fits the existing UI architecture best.

Do not create a new route unless necessary.

---

# 4. SIMULATION CONTROLS

The simulator should allow the student to enter:

```text
Number of future classes
```

and choose:

```text
Attend all
Miss all
```

Example:

```text
Upcoming Classes

[ 5 ]

Scenario

(•) Attend all
( ) Miss all

Target Attendance

[ 75% ]

[ Calculate ]
```

Use proper validation.

Allowed:

```text
0 or greater
```

Do not allow:

* negative numbers
* NaN
* invalid strings
* extremely unreasonable values

Use a reasonable upper limit such as:

```text
100
```

unless the existing project has a better established limit.

---

# 5. RESULT

After calculation show:

```text
Current Attendance
68%

Projected Attendance
75%

Change
+7 percentage points
```

For missed classes:

```text
Current Attendance
68%

Projected Attendance
56%

Change
-12 percentage points
```

Do not display misleading language such as:

```text
You WILL get 75%
```

Use:

```text
Projected attendance
```

because this is a mathematical scenario.

---

# 6. TARGET CALCULATOR

Allow the student to enter a target:

```text
Target Attendance

[ 75 ]
```

Calculate:

```text
How many consecutive classes must I attend
to reach this target?
```

Example:

```text
Current attendance: 68%

Target: 75%

Required future present classes: 7
```

If the target is already reached:

```text
Target already achieved.
```

If the target is mathematically impossible under the current scenario:

Explain why.

Do not simply return:

```text
0
```

without explanation.

---

# 7. IMPORTANT MATHEMATICS

Use actual attendance counts.

For:

```text
P = present classes
A = absent classes
N = future classes
```

Current attendance:

```text
P / (P + A) × 100
```

If all future classes are attended:

```text
(P + N) / (P + A + N) × 100
```

If all future classes are missed:

```text
P / (P + A + N) × 100
```

For target T:

Find the minimum integer N satisfying:

```text
(P + N) / (P + A + N) >= T
```

Do NOT approximate the result.

Use the smallest whole number that satisfies the target.

---

# 8. ZERO ATTENDANCE CASE

If:

```text
P = 0
A = 0
```

show:

```text
No attendance data available yet.
```

Do not show:

```text
0%
```

as though zero attendance has been recorded.

---

# 9. EARLY SIGNALS

Use Phase 1 signals.

Display them on Student Dashboard when relevant.

Example:

```text
⚠ Attendance needs attention

Current attendance: 68%

Target: 75%

Evidence:
17 present
8 absent

Suggested action:
Attend upcoming classes consistently.
```

For near-target:

```text
Attendance is close to the minimum target.

Current: 72%
Target: 75%

Suggested action:
Maintain regular attendance.
```

Every signal must contain factual evidence.

Do not use unexplained AI-style scores.

---

# 10. EXPLAINABILITY

The simulator should explain results.

Example:

```text
Why is the projection 75%?

17 classes attended
8 classes absent
5 future classes attended

22 / 30 × 100
= 73.33%
```

Use the actual numbers.

Do not hardcode examples.

Keep explanations concise.

---

# 11. ATTENDANCE TREND

If Phase 1 trend calculation already exists, display it.

Example:

```text
Attendance Trend

↓ Declining

Previous period: 82%
Recent period: 76%
Change: -6 percentage points
```

If insufficient historical data exists:

```text
Not enough data to determine a trend.
```

Do not invent a trend.

---

# 12. UPCOMING CLASSES

If existing timetable data is already available to the Student Dashboard, use it to provide context.

Example:

```text
Upcoming Classes
5

Best case
75%

Worst case
64%
```

Do not introduce an additional unbounded Firestore query just for this feature.

Prefer existing loaded timetable data/service methods.

If timetable data is not safely available, simply use the manually entered number in the simulator.

---

# 13. UI STATES

The intelligence section must support:

### Loading

```text
Loading attendance insights...
```

### No data

```text
No attendance data available yet.
```

### Normal

Show projection and simulator.

### Error

```text
Attendance insights are temporarily unavailable.
```

The rest of the Student Dashboard must continue working.

---

# 14. INPUT VALIDATION

Validate:

### Future classes

```text
0–100
```

### Target

```text
0–100%
```

Reject:

```text
NaN
Infinity
negative values
empty invalid values
```

Trim user input.

Do not allow malformed numeric input.

---

# 15. ACCESSIBILITY

Ensure:

* labels are associated with inputs
* buttons are keyboard accessible
* focus state is visible
* Enter key can trigger calculation where appropriate
* modal can be closed using Escape if modal is used
* text remains readable
* do not rely only on colors
* mobile touch targets remain approximately 44px or larger

---

# 16. MOBILE

The existing mobile UI must continue working.

At widths:

```text
320px
375px
430px
600px
768px
900px
```

the simulator must:

* fit inside the screen
* not cause horizontal page overflow
* keep inputs usable
* keep buttons touch-friendly
* keep result cards readable

Do not redesign the mobile UI.

Only make the new component responsive using existing styles/tokens.

---

# 17. DESKTOP

Desktop UI above the mobile breakpoint must remain visually consistent.

Do not redesign:

* sidebar
* header
* dashboard layout
* existing cards
* existing navigation

Only add the new intelligence functionality.

---

# 18. PERFORMANCE

Do not add new unbounded Firestore reads.

Do not add realtime listeners.

Do not repeatedly fetch attendance when existing data is already available.

Prefer:

```text
Existing attendance data
        ↓
CampusIntelligenceService
        ↓
Student Intelligence UI
```

Architecture:

```text
Firestore
   ↓
Existing Attendance Service
   ↓
Existing Student Dashboard data
   ↓
CampusIntelligenceService
   ↓
Projection / What-If / Signals
   ↓
UI
```

---

# 19. DATA PRIVACY

Student intelligence must only use the currently authenticated student's authorized attendance data.

Never expose:

* another student's attendance
* faculty-private data
* admin data
* library-private data
* laboratory reports

Do not change Firestore rules.

---

# 20. NO PERSISTED SIMULATIONS

Do NOT save What-If calculations to Firestore.

They are temporary calculations.

Do NOT create:

```text
whatIfSimulations
attendancePredictions
studentRiskScores
```

collections.

This keeps the feature:

* Spark-friendly
* private
* fast
* inexpensive

---

# 21. NO AI CLAIMS

Do not label deterministic mathematical calculations as:

```text
AI Prediction
Machine Learning
AI Score
```

Use:

```text
Attendance Projection
What-If Simulator
Attendance Signal
Attendance Trend
```

Campus Intelligence is the overall product layer; individual calculations must remain accurately described.

---

# 22. ERROR SAFETY

Any Campus Intelligence error must not break:

* login
* dashboard
* attendance
* timetable
* navigation
* logout

Wrap calculations safely.

Do not create uncaught Promise rejections.

---

# 23. TEST CASES

Run deterministic tests for:

### Case 1

```text
Present = 17
Absent = 8
Current = 68%
```

### Case 2

```text
Present = 17
Absent = 8
Future = 5
All Present
```

Verify:

```text
22 / 30 × 100
```

### Case 3

```text
Present = 17
Absent = 8
Future = 5
All Absent
```

Verify:

```text
17 / 30 × 100
```

### Case 4

Target already reached.

### Case 5

Target not reached.

### Case 6

Zero attendance records.

### Case 7

Future classes = 0.

### Case 8

Target = 0%.

### Case 9

Target = 100%.

### Case 10

Invalid input.

### Case 11

Mobile width 320px.

### Case 12

Desktop dashboard.

---

# 24. STATIC VALIDATION

Run the existing project validation.

At minimum:

```text
node check_syntax.js
```

Also run any existing project test command if available.

If the project has no bundler, do not invent one.

---

# 25. FILE CHANGES

Keep changes minimal.

Likely files:

```text
js/services/campusIntelligenceService.js
js/views/dashboardStudent.js
```

and only additional CSS/JS files if genuinely required by the existing architecture.

Do not modify unrelated modules.

---

# 26. SPARK COMPATIBILITY CHECK

Explicitly verify:

```text
Cloud Functions: NOT USED
Cloud Run: NOT USED
BigQuery: NOT USED
Pub/Sub: NOT USED
External AI API: NOT USED
New Firestore collections: NONE
New Firestore writes: NONE
Unbounded Firestore reads: NONE
Blaze requirement: NONE
```

---

# 27. BACKEND SAFETY

Report:

```text
Firebase backend changes: NONE
Firestore rules changes: NONE
Authentication changes: NONE
RBAC changes: NONE
Cloud Functions changes: NONE
Cloudflare Worker changes: NONE
```

---

# 28. LIVE TESTING

Do NOT perform or claim live Firebase testing.

Report:

```text
Live Testing: NOT PERFORMED
```

The user will perform live testing manually.

---

# 29. FINAL REPORT

Return:

## Implementation Status

PASS / PARTIAL / BLOCKED

## Student Dashboard

What was added.

## What-If Simulator

Supported scenarios.

## Target Calculator

Supported behavior.

## Attendance Signals

Implemented signals.

## Explainability

How results are explained.

## Responsive Behavior

Desktop/mobile status.

## Performance

Firestore read impact.

## Security/RBAC

Confirm existing security was preserved.

## Files Changed

Exact list.

## Validation

* syntax
* tests
* build if applicable

## Spark Compatibility

Confirm no Blaze-only dependency.

## Backend Changes

Confirm NONE.

## Live Testing

Confirm NOT PERFORMED.

# STOP CONDITION

After Phase 2 is complete:

STOP.

Do not automatically implement:

* Knowledge Graph
* Campus Digital Twin
* Smart Assistant
* AI chatbot
* Faculty Intelligence
* Library Intelligence
* Lab Intelligence
* Admin Intelligence
* automated notifications
* Phase 3

Wait for the next instruction.
