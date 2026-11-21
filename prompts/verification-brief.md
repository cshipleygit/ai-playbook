# Verification brief

Use this to hand a fix drafted in a chat to an agent that can see the real system. Have the chat fill it in. It should stand on its own, because the agent doesn't have the chat history.

Used in: [From plausible to verified](../workflows/plausible-to-verified.md)

```
Context
We're fixing [what], in [which record or component, with its ID], on [sandbox environment].

Problem
[What goes wrong, for whom, and why, as far as we know.]
[Constraints that can't change, e.g. "many existing flows read these variable
names, so the names can't change."]

How it works today
- [Component]: [what it does]
- [Component]: [what it does]

Proposed fix
[The fix, in a few sentences, and why it should avoid known problems.]

What I need from you
1. [Check guess #1 against the real records. Report what you find.]
2. [Check guess #2.]
3. [Find anything else that depends on what we're changing.]
4. [Check edge cases: e.g. what happens when the user is ordering for themselves.]
5. Propose the final code. [Where shared logic should live.]
6. Tell me whether you think this is the right approach, or whether there's
   a better option given what you find.

Constraints
- Read-only. Don't modify anything. Give me the proposed changes and I'll
  review them.
- Cite record IDs and the specific script lines your findings are based on.
- Finish with a short test plan.
```

## Why each part is there

- **Self-contained context:** the agent starts cold.
- **"How it works today":** stops the agent from re-deriving what you already know.
- **Numbered checks:** turn the chat's guesses into a checklist the agent can't skip.
- **"Tell me whether there's a better option":** without it, agents tend to build what you described.
- **Read-only + cite evidence:** the first pass is investigation, and findings should be checkable.
