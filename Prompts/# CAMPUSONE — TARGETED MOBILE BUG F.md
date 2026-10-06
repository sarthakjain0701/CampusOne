# CAMPUSONE — TARGETED MOBILE BUG FIX

Fix ONLY the mobile issues listed below that were found during actual user testing.

## USER-REPORTED ISSUES

[PASTE THE ACTUAL ISSUES HERE]

---

## RULES

For each issue:

1. Reproduce/trace the issue in the source code.
2. Identify the exact root cause.
3. Fix only the affected functionality/UI.
4. Do not redesign unrelated screens.
5. Do not change Firebase architecture.
6. Do not change Firestore collections/schema.
7. Do not change Authentication.
8. Do not change RBAC/security rules.
9. Do not change existing business logic unless the reported bug specifically requires it.
10. Preserve desktop UI above 900px.
11. Preserve existing mobile design system.
12. Do not introduce mock data.
13. Do not introduce localStorage as a data source.
14. Do not add duplicate authentication logic.
15. Do not use client-side account provisioning.

---

## ASYNC SAFETY

For loading-related bugs specifically inspect:

* `App.renderCurrentView()`
* `App.postRenderView()`
* `View.render()`
* `View.afterRender()`

Ensure the relevant lifecycle is actually executed.

Every async screen should properly handle:

```text
Loading
Success
Empty
Error
```

---

## FIREBASE SAFETY

Do not modify Firebase configuration unless the reported issue actually requires it.

Verify:

* no duplicate Firebase initialization
* no hardcoded credentials
* no plaintext passwords
* no unnecessary Firestore reads
* no unbounded listeners
* listeners cleaned up correctly
* authenticated user UID used where required

---

## MOBILE UI

For visual/mobile issues:

* preserve the existing CampusOne mobile design
* maintain touch-friendly controls
* maintain 44px+ interactive areas where practical
* prevent horizontal overflow
* preserve readable typography
* preserve responsive tables
* preserve modal scrolling
* preserve safe-area behavior

Do not redesign the entire page.

---

## VALIDATION

After fixes:

```bash
git status
git diff --stat
```

Run syntax checks on every modified JavaScript file.

Check for:

* broken imports
* undefined globals
* missing view exports
* duplicate Firebase initialization
* invalid CSS
* broken routes

Report:

### Issue

### Root Cause

### File Changed

### Fix Applied

### Static Validation

### Desktop Regression Check

Do NOT claim live/mobile testing.

The user will retest the fixes on the actual device.

STOP after these targeted fixes.
