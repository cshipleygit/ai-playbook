# Chance's AI Playbook

I'm Chance Shipley, an engineer who builds AI agents, MCP servers and LLM pipelines, and tests them against real data. This is how I actually build with AI, written up so other people can copy what works.

These aren't tips. Each entry is one real way of working: the setup, who does what (me or the AI), where it breaks, and when not to use it. Every entry comes from real work.

## Entries

### Workflows
End-to-end ways of getting work done with AI.

- [From plausible to verified: the chat drafts the fix, an agent checks it](workflows/plausible-to-verified.md)
- [AI as an exploratory tester that reproduces bugs but never fixes them](workflows/ai-exploratory-tester.md)
- [Mining my own AI chat history for playbook entries, on a read budget](workflows/mining-chat-history.md)

### Thinking patterns
How I decide whether to believe what the AI tells me.

- [Test every claimed fix on the next real record](thinking/test-on-the-next-real-record.md)

### Guardrails
What agents are allowed to touch, and how that gets decided.

- [Grow an agent's permissions one rule at a time, and never let it borrow a human's name](guardrails/agent-permissions-by-addition.md)

### Lessons learned
Times AI was confidently wrong, and what fixed it.

- [Three confident fixes for a CI hang, then one measurement](lessons/ci-hang-confident-fixes.md)
- [AI-written tests that pass with nothing tested](lessons/ai-tests-that-test-nothing.md)

### Habits
Small practices that make the workflows hold up.

- [Have the agent keep a living implementation plan](habits/living-implementation-plan.md)

### Tool setup
How the tools agents use are built.

- [MCP tools must never guess their working context](setup/mcp-tools-never-guess-context.md)

### Prompts
Reusable prompts pulled out of the entries.

- [Verification brief](prompts/verification-brief.md): hand a drafted fix to an agent that can see the real system
- [Implementation plan instruction](prompts/implementation-plan-instruction.md): make an agent keep a living plan as it works

### Coming later
- **Shadow mode before automating a human step:** run the AI blind next to the person, count its silent errors
- **Every human correction becomes a test:** turn review decisions into a regression set that only gets stricter
- **Measured, not adopted:** every idea earns its place with a number; the rejects get written down
- **Guardrails in code, not prompts:** budgets, turn limits, what the model is allowed to see
- **Grounded generation with a cheap critic first:** facts with IDs in, deterministic checks before an AI judge
- **CLAUDE.md as the project's lab notebook:** measured results, decisions and limits in one place

## My setup

- **Coding agents:** Claude Code to build and verify, often in parallel worktrees with a branch and PR per feature
- **Planning and critique:** Claude in chat for design, feasibility reviews and arguing against my plans
- **Tool access:** MCP servers that give agents scoped access to real systems, read-only until I've reviewed what they found
- **Building blocks:** Python, TypeScript, the Anthropic SDK, LangGraph for orchestration, evals against human-labelled data

## About me

- **pokepipe.** An open-source [computer-vision and LLM pipeline](https://github.com/cshipleygit/pokepipe) that turns raw Pokémon pack-opening videos into narrated vertical shorts. It has a LangGraph agent that recovers cards detection missed, a writer–critic loop for scripts, an auto-reviewer rolled out in shadow mode, and evals against human-reviewed data.
- **An MCP server for enterprise systems.** I built a custom MCP server that lets AI assistants do development and triage directly in ServiceNow, and took it from a personal prototype on my own time to production, where teammates use it every day. In a before-and-after review of my own work, it cut story effort 6x and incident triage time 6–10x.
- **Agents on top of it.** A Demand agent in production that turns customer requests into scoped, estimated stories for human review; a human-in-the-loop Problem Triage agent with read-only tools; and an agent gateway with per-run role enforcement and audit logging.
- **Background.** BS in Computer Engineering from Drexel, and co-author of [Plagiarism Deterrence for Introductory Programming](https://arxiv.org/abs/2206.02848).

Find me on [LinkedIn](https://www.linkedin.com/in/chanceshipley/) and [GitHub](https://github.com/cshipleygit).

## How entries are written

Every entry follows [TEMPLATE.md](TEMPLATE.md). Entries from work are sanitized before they're published here; entries from my own projects link to the real code.
