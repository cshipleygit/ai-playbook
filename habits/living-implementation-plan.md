# Have the agent keep a living implementation plan

> Have the agent maintain one plan document that it updates as the work changes, so the current state, the findings and the reasons for each decision are always in one place.

## The problem

On any non-trivial fix, the plan changes. Testing turns up a different root cause, an approach gets rejected, a first version has a bug. That history ends up scattered across a chat, the agent's session, and my head. When the agent's context resets, or I come back on Monday, or someone reviews the change, the reasons are gone.

## The setup

- An agent doing the build and verification work (see [From plausible to verified](../workflows/plausible-to-verified.md))
- One plan document the agent owns and updates. I use HTML so it prints and reads well, but markdown is fine.

## The loop

1. **Agent:** write the plan before building: goal, prerequisites, open questions, numbered steps, test plan, promotion and rollback.
2. **Agent:** after each step, update its status (DONE plus the date) and record what was found, with record IDs.
3. **Agent:** when the approach changes, say so at the top and record what was rejected and why.
4. **Me:** read the top section to know where things stand. Read the rest when I need the reasons.
5. **Me:** before promotion, work through the plan's checklist.

## What goes in it

- **A status line at the very top:** "built and verified in sandbox, not yet promoted"
- **"Current state and final approach (read this first)":** a short summary that's always current, even when the steps below describe earlier attempts
- **A findings table:** what was discovered and the evidence for it
- **Rejected alternatives and why:** "leaving the variable inactive: Flow Designer only lists active variables, so flows couldn't select it." This is the section that saves the most time later.
- **Steps with status:** each one marked DONE, PASSED or not yet run, with the date
- **Test results with evidence:** which test records, what values, pass or fail. Include failures and what fixed them.
- **Open questions:** marked as blocking or not
- **Before-promotion checklist:** cleanup, renames, test data to delete, what owners need to confirm
- **Rollback:** how to undo it

## A real example

On the Virtual Agent fix in [From plausible to verified](../workflows/plausible-to-verified.md), the plan changed during testing. The first approach (switching to a standard variable set) broke Virtual Agent support entirely. The plan's top section was rewritten to "the plan changed during testing," with the actual root cause, the fix, the three alternatives that were rejected, and the test records that proved it worked. The original steps stayed below with dated updates, so the reasoning wasn't lost.

By the end, the plan was also the code review document, the QA handoff, and the source for this write-up.

## What works

- **Put "read this first" at the top.** The steps below accumulate history. The top is always the current truth.
- **Date every update.** "Update 2026-11-20" next to a change makes it clear which version is current.
- **Make the agent cite evidence in the plan,** not just in chat. The chat disappears; the plan doesn't.
- **Record failures.** "The first version left the field blank because…" is the most useful line in the document six months later.

## Gotchas

- **Plan rot.** Old code blocks stay in the document after the live version changes. Mark them clearly ("the code above is the original version; the live version adds…").
- **Sensitive data piles up.** Test results contain real users' names, emails and phone numbers. Strip them before sharing the plan outside the team.
- **The plan isn't the source of truth for the system.** Before promotion, confirm against the actual records, not just against what the plan says.

## Prompts I use

- [Implementation plan instruction](../prompts/implementation-plan-instruction.md)

## When not to use this

- One-step changes. A plan for a single field update is overhead.
- When a ticket or story already holds this well. Don't keep two plans in sync.
