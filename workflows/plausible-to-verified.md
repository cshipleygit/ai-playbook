# From plausible to verified: the chat drafts the fix, an agent checks it

> A chat model reasoning about a system it can't see gives you a plausible fix. An agent that can see the system and has to show its evidence turns it into a correct one.

## The problem

Claude is good at reasoning through a platform problem, but in a chat it can't see my instance. It doesn't know which custom fields we use, which scripts already exist, or what the platform actually does at runtime. It will still give a confident, well-structured answer, and parts of that answer are guesses.

I could check every guess myself, but that's most of the work. I could also have an agent with instance access fix the problem from scratch, but then I lose the reasoning I did in the chat.

## The setup

- **Chat (Claude):** thinks through the problem with me, drafts a fix, and marks which parts are guesses
- **Agent with instance access:** runs in VS Code through my MCP server, can read records, run background scripts, and (once allowed) make changes in the sandbox
- **Me:** decides, makes the changes the agent can't, and tests from the front end

## The loop

1. **Me + chat:** work through the problem until there's a likely fix. Ask the chat to flag every assumption it made about my instance.
2. **Chat:** write a self-contained brief for the agent (see [verification brief](../prompts/verification-brief.md)). It covers the context, the problem, the proposed fix, a numbered list of things to check, and constraints.
3. **Agent:** checks each item against the real records and scripts and reports back with citations. It starts out read-only.
4. **Me:** review the findings. Decide the approach.
5. **Agent + me:** build it. The agent makes the changes it can; I make the ones it can't. The agent reads every change back to confirm it saved.
6. **Me:** test from the front end like a real user. **Agent:** check the back end, meaning the records that were created, the values that landed, and whether downstream flows read them.
7. Repeat steps 5 and 6 until front end and back end agree.

## A real example

**The bug:** in Virtual Agent, when someone ordered a catalog item on behalf of a coworker, the profile fields on the request (email, phone, manager, location, VIP) were filled with the details of the person chatting, not the coworker. The portal fills those fields with client scripts, which don't run in Virtual Agent. Many existing flows read those exact variable names, so renaming them wasn't an option.

**The chat's fix:** look up the selected user at checkout and overwrite the values before the request is created. Claude marked several field mappings as guesses.

**What the agent found:**
- Several guesses were wrong. Two fields came from custom fields on the user record, and the ID field was a different field than assumed.
- 18 existing workflow scripts compared the VIP value to the string "Yes", which settled how it had to be stored.
- **The real blocker wasn't in the draft at all.** A single active reference variable named `manager` made Virtual Agent mark the whole item as unsupported and end the conversation. Hiding it didn't help, and neither did making it read-only. The fix was a flag that leaves that one variable out of the conversation, plus writing its value onto the cart before checkout.

**The agent caught its own bug.** Its first version left `manager` blank on a test request. The platform creates an empty row for the variable first, and the code skipped rows that already existed. The agent saw this by reading the request back, then fixed it.

**What it couldn't do:** the Virtual Agent topic is a ~210 KB graph that the MCP server can only overwrite in one piece, and one table returned an insufficient-privileges error. I made those edits by hand, and the agent confirmed them by reading the saved records back.

**Result:** verified in the sandbox. Test orders for myself and for another user had values matching the user record, and a test flow confirmed the downstream flows could read every value.

## What works

- **Ask the chat to mark its guesses.** That list becomes the agent's checklist.
- **Make the brief self-contained.** The agent doesn't have the chat history, so the brief needs everything: record names, what the code does today, the proposed fix, and why.
- **Ask for evidence.** "Cite the record IDs and script lines your findings come from" stops the agent from agreeing with you based on vibes.
- **Explicitly invite disagreement.** End the brief with "tell me whether this is the right approach or there's a better one." Without that, agents tend to just build what you described.
- **Start read-only.** The first pass is investigation. Allow changes after you've reviewed the findings.
- **Read back every change.** Don't trust "done." Have the agent re-query the record and confirm the change is there.

## Gotchas

- **The agent can grade its own work.** If it built the fix and also verifies it, it can miss the same thing twice. Front-end testing by a human is what catches that.
- **Three sources of change.** My code, my manual edits, and the agent's edits all touch the same system. Keep track of which changes came from where (in ServiceNow, which update set each one landed in).
- **Tool limits are real.** Some records are too big or too locked down for the agent to write. Plan for "I make the edit, the agent verifies it."
- **Test data isn't config.** Test records the agent creates aren't part of the deployable change and need cleaning up separately.

## Prompts I use

- [Verification brief](../prompts/verification-brief.md)

## When not to use this

- Small, well-understood changes. The handoff costs more than just doing it.
- When the chat already has the real system's details (you pasted the scripts in). The agent's value is seeing what the chat can't.
- Production. The agent works in a sandbox; promotion goes through the normal process.
