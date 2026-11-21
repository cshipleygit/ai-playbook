# MCP tools must never guess their working context

> A tool that quietly picks "the first matching thing" will one day pick someone else's work. Make the context explicit and exact, and never change shared defaults.

## The problem

In ServiceNow, configuration changes are captured in update sets so they can be moved between environments. I asked my MCP server's agent to put the automated tests it creates "in an update set that we can move from environment to environment" by default.

The first version worked and was dangerous.

## The setup

- **My MCP server:** tools to create test suites, tests and test steps
- **Agent (Copilot in VS Code):** wrote the helper that picks the update set
- **Me:** reviewed how the helper chose its context

## What happened

1. **First version.** Before each create, a helper looked for any update set in progress and used the first one it found. If there was none, it created a dated one and made it the instance default.
2. **The catch.** I asked: "how does it know which one to pick? I don't want it using other update sets that are used for other things". The agent agreed: "Good catch. Right now it just grabs the first `in progress` update set it finds — that could be someone's unrelated work."
3. **What could have gone wrong.** Test records landing in another developer's update set and being promoted with their unrelated work. And changing the instance default "could disrupt other developers' sessions".
4. **Second version.** Only update sets with "ATF" in the name are considered, and the default is never changed.
5. **Third version.** I added: "I don't want to create an ATF test suite for one catlaog item and then ask you to do the same for a different catalog item and you use the same one." Now each piece of work gets its own update set, `ATF - {label} - YYYY-MM-DD`, found by exact name: "The name match is **exact**."

## How it scopes now

- A suite uses its own name as the label.
- A test uses its name.
- A step looks up its parent test's name, "so steps always land in the same update set as the test they belong to".

## What works

- **Ask "how does it choose?"** of every tool that picks something for you. "The first one it finds" is never the answer you want.
- **Exact names, not patterns.** A pattern ("anything with ATF in it") is better than nothing and still shares context between unrelated work.
- **Derive the context from the thing being created.** Steps follow their test, tests follow their suite. Nothing is guessed.
- **Never change shared defaults from a tool.** An agent working for one person shouldn't change what everyone else's session does.

## Gotchas

- **The risky version works in testing.** On a quiet sandbox, "the first in-progress update set" is usually yours. The problem only appears on a shared instance.
- **Agents build the convenient version first.** It took two review rounds to get from "works" to "safe".

## When not to use this

- Single-user sandboxes where nothing else is in progress. Even then, exact naming costs almost nothing.
