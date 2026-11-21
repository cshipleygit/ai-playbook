# AI as an exploratory tester that reproduces bugs but never fixes them

> Give an agent a real browser, read-only access and a list of stories, and it makes a patient exploratory tester. Keep it out of production and out of the fix.

## The problem

I needed acceptance and exploratory testing for 5 stories about our Virtual Agent (the platform's chatbot): search, ordering through the chat, and handoff. Testing a chatbot by hand is slow and repetitive, and every bug needs reproducing several times before anyone believes it. But an agent that can click around a real instance can also submit requests, contact live agents or "helpfully" fix things.

## The setup

- **Agent (Copilot in VS Code):** drives a real browser with Playwright, and reads records through my MCP server
- **Production:** the source of the story requirements only, read-only
- **A sandbox instance:** where all testing happens
- **Me:** log in, set the rules, approve any write, and own the bug tracker

## The loop

1. **Me:** give a structured brief with the environment rules (below).
2. **AI:** read the stories, build a checklist mapping each one to expected behaviour and tests, and keep "explicit requirements" separate from its own usability expectations.
3. **AI:** confirm the sandbox host and the logged-in user's role before testing. "Do not assume Sandbox is QA."
4. **AI, round 1, read-only:** test the real UI, cross-check records, and repeat each finding to count reproductions. Stop before anything that writes.
5. **Me:** approve a small, bounded set of writes, or not.
6. **AI, round 2:** run the approved tests, clean up after itself, and report by story.
7. **AI:** map the defects against the existing tracker and draft rows for me to paste in. I file them.

## A real example

**The brief's rules, in my words:**
- "Do not test or change anything in Prod." Production was only the source of requirements.
- "Pause for me when authentication is required; do not ask me to share credentials in chat."
- Test the real UI, "not API calls as a substitute".

**Round 1.** The agent read the 5 stories from Production read-only and switched back to the sandbox. It noticed the logged-in account had admin rights, which bypass permissions, so one story's permission checks couldn't be tested with it. It drove the chatbot in the browser and isolated causes by comparing the chatbot's results with the portal's own search. Then it stopped: "Live agent handoff and any test that submits a catalog item or incident need your approval first." It proposed a bounded batch: at most 2 test requests for a free item, labelled "TEST – please ignore".

**Round 2.** I approved and asked for a retest as a regular user. The agent impersonated one, submitted 1 test request, tried blank mandatory fields, checked that Cancel created nothing, ended the impersonation, and asked me whether to cancel the test request.

**Result: none of the 5 stories passed.** Defects included:
- **A privacy bug.** After ordering through the chat, the confirmation card showed a different user's old request, including their name and a link. The agent rated it High or Critical. It appeared 3 times out of 3 in the agent's runs, plus once in a separate submission I'd logged earlier.
- **Requested For left blank.** The chat form didn't fill in the requester, a script error showed in the browser console, and the request was saved without a manager even though manager approval was required (2/2).
- **A VPN question answered with a password-reset link**, after which the chat ended (2/2).
- **Two near-identical "did this resolve your issue?" questions** in a row (3/3), with ordering hidden behind them (3/3).
- **Exact-name search** showing the wrong items or missing the item (2/2), plus weak ranking and link-only topics.

It didn't try live-agent handoff (no agents were online), and it didn't fix anything: "I didn't fix anything."

## What works

- **Write the environment rules into the brief.** Where requirements come from, where testing happens, and what never to touch.
- **Make the agent confirm where it is.** Host and role first. Admin rights hide permission bugs.
- **Read-only first, then a bounded write batch.** "Up to 2 labelled test requests" is easy to approve and easy to clean up.
- **Count reproductions.** "3 out of 3" turns an observation into a bug report.
- **Separate requirements from opinions.** The agent's usability notes are useful, but they're not acceptance criteria.
- **Testing and fixing are different jobs.** An agent that fixes what it finds also changes what it's testing.

## Gotchas

- **Mixed counts creep in.** A later summary turned "3/3 plus one earlier human report" into "4/4". Keep the agent's runs and human reports separate.
- **Some things can't be tested in a sandbox.** No live agents were online, and some topics were inactive.
- **Test data stays behind.** The approved test request needs cleaning up, or a decision to leave it.
- **Browser setup is fiddly.** The first browser tab was invisible to me and took two retries.

## When not to use this

- Production. Never.
- When the stories need judgement calls about business rules the agent can't see. Test those yourself.
