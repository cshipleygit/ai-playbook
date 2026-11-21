# Chance's AI Playbook

I'm Chance Shipley. I build AI agents, MCP tools and LLM pipelines, and I don't trust them until they've been tested against real data. This playbook is how I do it, written up so other people can copy what works.

These aren't tips. Each entry is one real way of working: the setup, who does what (me or the AI), where it breaks, and when not to use it. Every entry comes from real work.

## Start here

- [From my personal MCP server to an agent platform](case-studies/mcp-agent-platform.md): the case study, with the architecture of an agent gateway where ServiceNow decides what every agent may do
- [Shadow mode before you automate a human step](evals/shadow-mode-before-automating.md): how an auto-reviewer earned control by counting the mistakes nobody would notice
- [Grow an agent's permissions one rule at a time](guardrails/agent-permissions-by-addition.md): least privilege for a production agent, one explicit rule at a time

## Building AI systems

### Case studies
Whole projects, end to end.

- [From my personal MCP server to an agent platform](case-studies/mcp-agent-platform.md)

### Evals and rollout
Measuring AI output against people before handing it control.

- [Shadow mode before you automate a human step](evals/shadow-mode-before-automating.md)

### Agents and guardrails
What agents are allowed to touch, and how the tools they use are built.

- [Grow an agent's permissions one rule at a time, and never let it borrow a human's name](guardrails/agent-permissions-by-addition.md)
- [MCP tools must never guess their working context](setup/mcp-tools-never-guess-context.md)

### Coming later
- **Every human correction becomes a test:** turn review decisions into a regression set that only gets stricter
- **Grounded generation with a cheap critic first:** facts with IDs in, deterministic checks before an AI judge
- **Guardrails in code, not prompts:** budgets, turn limits, what the model is allowed to see
- **Measured, not adopted:** every idea earns its place with a number; the rejects get written down

## Working with AI agents

### Workflows
End-to-end ways of getting work done with AI.

- [From plausible to verified: the chat drafts the fix, an agent checks it](workflows/plausible-to-verified.md)
- [AI as an exploratory tester that reproduces bugs but never fixes them](workflows/ai-exploratory-tester.md)
- [Mining my own AI chat history for playbook entries, on a read budget](workflows/mining-chat-history.md)

### Thinking patterns
How I decide whether to believe what the AI tells me.

- [Test every claimed fix on the next real record](thinking/test-on-the-next-real-record.md)

### Lessons learned
Times AI was confidently wrong, and what fixed it.

- [Three confident fixes for a CI hang, then one measurement](lessons/ci-hang-confident-fixes.md)
- [AI-written tests that pass with nothing tested](lessons/ai-tests-that-test-nothing.md)

### Habits
Small practices that make the workflows hold up.

- [Have the agent keep a living implementation plan](habits/living-implementation-plan.md)
- **Coming later: CLAUDE.md as the project's lab notebook:** measured results, decisions and limits in one place

### Prompts
Reusable prompts pulled out of the entries.

- [Verification brief](prompts/verification-brief.md): hand a drafted fix to an agent that can see the real system
- [Implementation plan instruction](prompts/implementation-plan-instruction.md): make an agent keep a living plan as it works

## My setup

- **Coding agents:** Claude Code to build and verify, often in parallel worktrees with a branch and PR per feature
- **Planning and critique:** Claude in chat for design, feasibility reviews and arguing against my plans
- **Tool access:** MCP servers that give agents scoped access to real systems, read-only until I've reviewed what they found
- **Building blocks:** Python, TypeScript, the Anthropic SDK, LangGraph for orchestration, evals against human-labelled data

## About me

- **pokepipe.** An open-source [computer-vision and LLM pipeline](https://github.com/cshipleygit/pokepipe) that turns raw Pokémon pack-opening videos into narrated vertical shorts. It has a LangGraph agent that recovers cards detection missed, a writer–critic loop for scripts, an auto-reviewer rolled out in shadow mode, and evals against human-reviewed data.
- **My MCP server and agent platform for ServiceNow.** It started as a personal project on my own time, and I took it to production for my team, with per-user OAuth and team standards. In a before-and-after review of my own work, it cut story effort 6x and incident triage time 6–10x. [Read the case study](case-studies/mcp-agent-platform.md).
- **Agents on top of it.** A Demand agent in production that turns customer requests into scoped, estimated stories for human review; a human-in-the-loop Problem Triage agent with read-only tools; and an agent gateway I designed, where ServiceNow enforces each caller's roles on every run and logs every decision.
- **Background.** BS in Computer Engineering from Drexel, and co-author of [Plagiarism Deterrence for Introductory Programming](https://arxiv.org/abs/2206.02848).

Find me on [LinkedIn](https://www.linkedin.com/in/chanceshipley/) and [GitHub](https://github.com/cshipleygit).

## How entries are written

Every entry follows [TEMPLATE.md](TEMPLATE.md). Entries from work are sanitized before they're published here; entries from my own projects link to the real code.
