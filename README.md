# Chance's AI Playbook

I'm Chance Shipley, a software developer who builds AI agents, MCP servers and LLM integrations for enterprise systems. This is how I actually work with AI, written up so other people can copy what works.

These aren't tips. Each entry is one real way of working: the setup, who does what (me or the AI), where it breaks, and when not to use it. Every entry comes from real work.

## Entries

### Workflows
End-to-end ways of getting work done with AI.

- [From plausible to verified: the chat drafts the fix, an agent checks it](workflows/plausible-to-verified.md)

### Habits
Small practices that make the workflows hold up.

- [Have the agent keep a living implementation plan](habits/living-implementation-plan.md)

### Prompts
Reusable prompts pulled out of the entries.

- [Verification brief](prompts/verification-brief.md): hand a drafted fix to an agent that can see the real system
- [Implementation plan instruction](prompts/implementation-plan-instruction.md): make an agent keep a living plan as it works

### Coming later
- **Thinking patterns:** feasibility reviews, having AI argue against my plan
- **Tool setup:** MCP server, Copilot instructions, which model for which job
- **Guardrails:** what agents can touch, sandbox vs. production, keeping track of changes
- **Lessons learned:** times AI was confidently wrong

## My setup

- **Platform:** ServiceNow (catalog, Virtual Agent, Flow Designer, integrations)
- **Editor:** VS Code with GitHub Copilot
- **Models:** Claude for planning, feasibility reviews and critiquing my ideas; agents for building and verifying
- **Instance access:** a custom MCP server that lets an agent read records, run scripts and make changes in a sandbox instance

## About me

- **MCP server for ServiceNow.** I built a custom MCP server that lets AI assistants work directly in ServiceNow, and took it from a personal prototype on my own time to production, where teammates use it every day. In a before-and-after review of my own work, it cut story effort 6x and incident triage time 6–10x.
- **Agents on top of it.** A Demand agent in production that turns customer requests into scoped, estimated stories for human review; a human-in-the-loop Problem Triage agent; and an agent gateway that lets other teams launch agents from their own systems with per-run role enforcement and audit logging.
- **On my own time.** [pokepipe](https://github.com/cshipleygit/pokepipe), an open-source computer-vision and LLM pipeline that turns raw Pokémon pack-opening videos into narrated vertical shorts.
- **Background.** BS in Computer Engineering from Drexel, and co-author of [Plagiarism Deterrence for Introductory Programming](https://arxiv.org/abs/2206.02848).

Find me on [LinkedIn](https://www.linkedin.com/in/chanceshipley/) and [GitHub](https://github.com/cshipleygit).

## How entries are written

Every entry follows [TEMPLATE.md](TEMPLATE.md). Every entry starts as a team version with internal details and is sanitized before it's published here.
