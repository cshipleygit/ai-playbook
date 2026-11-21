# AI-written tests that pass with nothing tested

> I asked an agent to write automated tests for a catalog item. They passed. They were also testing nothing. A green result from AI-written tests is a claim, not evidence.

## The problem

I wanted Automated Test Framework (ATF) tests covering each acceptance criterion for an access-request catalog item: manager approval, an extra approval for the highest access level, group assignment and the task description. I asked the agent to "make sure that the steps are filled in within the cases as well and are correct".

The agent wrote the tests, reported "All done", and the tests passed. It took most of a 31-turn session to find out that the passes meant nothing.

## The setup

- **Agent with access to the system:** created and updated tests and test steps through my MCP server's ATF tools, and read records and run logs
- **Me:** looked at the tests in the platform, ran them, and checked whether the results made sense
- **A sandbox instance**

## What happened

1. **The tests weren't in the suite.** "okay so i dont see any of these tests." The tool that created tests never created the suite-membership records, so the 5 new tests existed but weren't part of the suite. The agent linked them by hand.
2. **The steps were empty.** I pointed at one step: "why is this not filled in?" The agent checked every step it had created: "Every step created via `create_atf_step` lost its inputs." It re-applied every input. That's two defects in the MCP tools it was using, which a green "All done" had hidden.
3. **The tests passed with nothing to test.** This was the turning point. The catalog item had no flow at all, so nothing could have created the approvals, yet the approval tests passed. "I ran the tests and they passed. How is this actively checking approvals [...] if there was never a flow?" The agent blamed a scripting detail ("almost certainly"). After I built the flow and asked it to confirm, it noticed "the step 6 script log is suspiciously bare".
4. **The same mistake, again and again.** For several turns the wrong option kept appearing in a variable step. I pushed: "You need to remember what you're doing for the future [...] you keep making the same mistakes." The agent wrote itself a rule in its memory file: "A passing test with bare Jasmine output is a false positive".
5. **Root cause.** The script steps wrapped their checks in Jasmine `describe`/`it` blocks, which the step runner never ran: "That's why the output is always just the library load line and the step vacuously passes." Later it found a second cause: the access-level variable was mandatory with no default, which "confirms previous "passing" runs were vacuous (no variable was being set)."
6. **Three versions of the check scripts.**
   - v1: checks inside `describe`/`it`. They never ran, so every run passed.
   - v2: top-level `expect()`. It threw an error. The agent: "The error reveals my fix was wrong in the opposite direction".
   - v3: no Jasmine at all. A plain `throw` on failure, so a failed check really fails.
   Separately, two steps stored a variable value in a different format from the one the UI uses. Once converted, the run log finally showed the value being set.
7. **An honest failure.** With the variable really set, the test failed: the item couldn't be added to the cart. I gave the agent a successful manual request by the same user to compare against. It found differences but couldn't explain the failure, and the session ended unresolved.

The tests didn't end up passing. They ended up telling the truth, which they hadn't done at the start.

## What works

- **Make a test fail on purpose before trusting its pass.** The approval tests passing with no flow in place was the giveaway. A test that can't fail isn't a test.
- **Look at the test, not the report.** "All done" hid missing suite links and empty steps. Open what the agent created.
- **Read the run log, not the result.** A bare log ("just the library load line") was the real signal.
- **Make the agent write its lessons down.** After the same mistake repeated, the agent recorded a rule in its memory file. That's cheaper than catching it a third time.
- **Give it a known-good comparison.** A manual request that worked was the fastest way to see what the tests were doing differently.

## Gotchas

- **Tool defects look like success.** Tools that silently drop inputs or skip a link step still return "created".
- **Fixes can overshoot.** v2 went from "never fails" to "always errors". Check that a fix produces a real pass and a real failure.
- **"Almost certainly" again.** The first explanation for the vacuous passes was a confident guess.

## Prompts I use

```
Before you report these tests as done: for each test, show me one run where it
fails because the thing it checks is broken, and one where it passes because it
works. If you can't make it fail, it isn't testing anything yet.
```

## When not to use this

- Trivial tests whose logic you can read at a glance. Just read them.
