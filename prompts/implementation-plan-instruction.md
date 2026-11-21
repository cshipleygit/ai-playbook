# Implementation plan instruction

Add this to the agent's brief, or to your Copilot custom instructions so every non-trivial task gets a plan.

Used in: [Have the agent keep a living implementation plan](../habits/living-implementation-plan.md)

```
For any change that takes more than a couple of steps, keep one implementation
plan document and update it as you work.

Structure:
- A status line at the top (e.g. "built and verified in sandbox, not yet promoted").
- "Current state and final approach (read this first)": always reflects the
  current approach, even if the steps below describe earlier attempts.
- Findings: what you discovered and the evidence (record IDs, script lines).
- Rejected alternatives and why each was rejected.
- Numbered steps, each marked with a status and date when it changes
  (DONE 2026-11-20, PASSED, not yet run).
- Test results: which test records, the values checked, pass or fail.
  Include failures and what fixed them.
- Open questions, marked blocking or not blocking.
- Before-promotion checklist and rollback steps.

Rules:
- When the approach changes, update the top section first and say what changed.
- Don't delete earlier steps; mark them as superseded and date the update.
- Every claim about the system needs evidence you actually checked.
```
