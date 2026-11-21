# AI Playbook

How I actually work with AI as a developer on an enterprise platform (mostly ServiceNow), written up so other people can copy what works.

These aren't tips. Each entry is one real way of working: the setup, who does what (me or the AI), where it breaks, and when not to use it. Every entry comes from real work. Details specific to my employer have been removed.

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

## How entries are written

Every entry follows [TEMPLATE.md](TEMPLATE.md). Every entry starts as a team version with internal details and is sanitized before it's published here.
