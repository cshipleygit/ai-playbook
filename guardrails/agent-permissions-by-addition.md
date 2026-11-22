# Grow an agent's permissions one rule at a time, and never let it borrow a human's name

> Start a new agent with almost no write access and add one explicit rule each time it needs more. And give each agent its own identity, because rewriting who did something is falsifying the record.

## The problem

I build agents that work inside ServiceNow through my MCP server: a Problem triage agent, and later a Demand agent that turns customer requests into estimated Stories. Each one needs to write something, and every write is a risk. Two questions came up again and again:

- **How much can this agent change?** A broad "can create and update records" is easy to grant and hard to take back.
- **Whose name is on the change?** If an agent writes as me, the audit trail says I did it.

## The setup

- **Agents** call the platform through my MCP server
- **Each agent's instructions** live in the repo, including an explicit list of what it may write
- **Me:** approve every new permission, and check what the agent actually did in the platform

## The loop

1. **Me:** start the agent with the smallest write it needs, written down as an explicit rule in its instructions.
2. **AI:** when a task needs more, stop and say so, instead of finding a way around the rule.
3. **Me:** decide. If yes, add one rule, as narrow as possible.
4. **AI:** update the instructions and agent definition, then work within the new rule.
5. Repeat. The agent's permissions become a short, readable history of decisions.

## A real example: building a Demand agent in about 10 steps

I asked for a "story agent" triggered by a button on a Demand, using the same engine as the Problem agent. The agent first checked the existing request engine and found that a new use case "does not require a new flow or engine changes". It added the button but left it inactive until the agent file was merged.

Then the permissions grew, one at a time:

1. **Create one linked Story and add one review note.** Nothing else, in QA only.
2. **Tool access.** The agent run exposed a fixed tool list, but that list is shared: "This is used for the Problem agent too tho, I can't restrict it here as this will restrict the tools for all agents." So scope lives in each agent's definition, not in the server's tool list.
3. **Check the instance.** The agent refused to write when the instance URL came back masked. I relaxed this for testing only.
4. **One Story type only.** The target became one specific Story table, through a dedicated tool instead of generic record creation. When a stale prompt asked for another type, the agent refused: it was "authorized to create only an `sn_safe_story`; I can't substitute a different record type."
5. **Failure reporting.** A dedicated error write to the matching request row that "does not expose generic record updates."
6. **Field mapping.** Copy who opened the Demand onto the Story.
7. **An AI-only estimate field.** The team's own points field stays untouched for people to fill in.
8. **Attachment copy.** The agent asked for authorization first, noting that "passing files changes the agent's permitted writes, not just what it can read."
9. **One rationale note on the new Story.** The agent first refused: "Not under the current workflow authorization." I replied: "Well explicitly expand it is!"
10. **Exact note text only.** Its first note added environment and tool lines I didn't want: "I don't want the xtra stuff appended into here". The rule now bars any extra text.

The final note format, from the agent's instructions:

```text
AI Story Point Rationale

1. AI-estimated effort: <N> developer workdays.
2. Rationale: <concise scope-grounded basis>.
3. Human review is required.
```

## A second example: the agent that wouldn't fake an author

I wanted the triage agent's work notes to show a dedicated service user as the author, without the agent using that user's credentials. The AI proposed a workaround: write the note, then overwrite its "created by" field. It ran the test in QA and reported "The test worked", adding: "I didn't open the Problem form to check how the activity stream displays it."

My screenshot still showed me as the author. "Hard refresh still shows me." The agent traced the display to the audit log and stopped: "I'm not going to edit `sys_audit` to change the author. It's the audit log, and changing it would falsify who made the change."

Instead it proposed the clean design: "Each agent would get its own ServiceNow identity", through an OAuth client-credentials grant and one MCP server entry per agent. That design hasn't been built yet: the agents don't have their own identities so far, and one test note with a rewritten field is still on the QA record, because the tools can't delete it.

## What works

- **Narrow tools beat broad permissions.** A dedicated "create this one Story type" tool is easier to reason about than generic record creation plus a promise.
- **The agent's refusals are the feature.** "Not under the current workflow authorization" is exactly what you want to hear. Expanding the rule should take a deliberate decision.
- **Write every permission down where the agent reads it.** The instructions file becomes the record of what it may do and why.
- **Scope per agent, not per server.** A shared tool list can't express "this agent only".
- **Never edit an audit trail to make the UI look right.** If attribution is wrong, the identity design is wrong.
- **Check the result in the real UI.** The "created by" workaround passed its own check and failed on screen.

## Gotchas

- **Relaxed checks get forgotten.** "I don't care about the redacted URL for now" needs a note to put it back.
- **Workarounds leave residue.** The test note from the failed approach is still on the record.
- **Designed isn't built.** A per-agent identity on paper doesn't change who the audit log names today.

## When not to use this

- One-off scripts you run yourself and review line by line.
- Read-only agents. Scope still matters, but the stakes are much lower.
