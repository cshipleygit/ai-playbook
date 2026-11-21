# From my personal MCP server to an agent platform

> How my side project, an MCP server that lets AI assistants work inside ServiceNow, became a production tool for my team, and then the base of an agent gateway where ServiceNow decides what every agent may do.

## Where it started

It started as a personal project, on my own time and my own PC, against a personal developer instance. The goal was simple: let an AI assistant do the work I actually do in ServiceNow, directly. Building catalog items, writing and running automated tests, triaging incidents and problems.

At first it was a side project with no place at work yet. Once I could show it working end to end, my manager approved a move to our QA instance, and later to production.

## Taking it to production

What worked on my own instance broke against enterprise reality: shared environments, real permissions, other people's work in flight. The work that got it to production:

- **Every user authenticates as themselves.** Least-privilege OAuth, so the AI can only do what that person can do, and the audit trail names the real person.
- **Team rules, written where the agent reads them.** Always use the MCP tools instead of ad-hoc scripts. Confirm QA or Production before any write. Never write to Production without explicit approval. Don't create files nobody asked for.
- **Tools that can't touch someone else's work.** For example, [test records go into an exactly named update set per piece of work](../setup/mcp-tools-never-guess-context.md), never "the first one in progress".
- **A repeatable setup.** A Windows PowerShell setup flow and VS Code configuration so teammates could install it themselves.
- **New tools where the work needed them.** For example, tools to build Automated Test Framework suites from acceptance criteria, which [taught me to distrust passing tests](../lessons/ai-tests-that-test-nothing.md).

**Result:** teammates use it every day. In a before-and-after review of my own work (14 stories and 9 incidents), it cut story development effort about 6x and incident triage time 6–10x. I co-presented it to the whole company at a town hall, with a live build of a familiar catalog request and Q&A.

## The first agent: Problem triage

The next step was taking the human out of the loop for the investigation, but not for the decision.

1. A checkbox on a Problem record triggers a Flow.
2. The Flow starts a GitHub-hosted agent.
3. The agent investigates through the MCP server, with **read-only tools** and prompt-injection safeguards.
4. It posts its evidence, confidence, unknowns and next steps back to the Problem as a work note for a person to review. It never fixes anything itself.

It worked, but every new use case would have meant another Flow, another set of credentials in a GitHub job, and another way in.

## The Agent Gateway

So I designed a gateway: **one ServiceNow API that any system or team can call, with its own service account, to run an agent.** The core design rule:

> ServiceNow is the only place access is decided. The GitHub workflow and the MCP server configuration only shape what the model sees. They are never trusted for security.

<figure class="diagram" role="img" aria-label="Agent Gateway architecture: callers start a run through ServiceNow, which checks their roles, records the run and dispatches GitHub Actions with only the run ID. The agent runs with one read-only runtime account and the run ID, and returns structured findings, which ServiceNow writes back.">
<svg viewBox="0 0 680 620" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" class="d-arrowhead"/>
    </marker>
  </defs>
  <rect x="140" y="10" width="400" height="70" rx="10" class="d-box"/>
  <text x="340" y="38" class="d-title">Callers</text>
  <text x="340" y="60" class="d-sub">Flows, UI actions, Jenkins, other teams — each with its own service account</text>
  <line x1="340" y1="80" x2="340" y2="118" class="d-line" marker-end="url(#arrow)"/>
  <text x="352" y="104" class="d-label">POST /runs</text>
  <rect x="60" y="120" width="560" height="170" rx="12" class="d-box d-key"/>
  <text x="340" y="150" class="d-title">ServiceNow: Agent Gateway</text>
  <text x="340" y="170" class="d-sub">one Scripted REST API in a scoped app</text>
  <rect x="80" y="186" width="160" height="88" rx="8" class="d-inner"/>
  <text x="160" y="210" class="d-small-title">Roles decide</text>
  <text x="160" y="230" class="d-small">which agents a caller</text>
  <text x="160" y="246" class="d-small">may run, and which</text>
  <text x="160" y="262" class="d-small">tools its runs may use</text>
  <rect x="260" y="186" width="160" height="88" rx="8" class="d-inner"/>
  <text x="340" y="210" class="d-small-title">Run record</text>
  <text x="340" y="230" class="d-small">who asked, which agent,</text>
  <text x="340" y="246" class="d-small">which record, which</text>
  <text x="340" y="262" class="d-small">tools, status, expiry</text>
  <rect x="440" y="186" width="160" height="88" rx="8" class="d-inner"/>
  <text x="520" y="210" class="d-small-title">Audit log</text>
  <text x="520" y="230" class="d-small">every run and every</text>
  <text x="520" y="246" class="d-small">decision, allowed</text>
  <text x="520" y="262" class="d-small">or denied</text>
  <line x1="250" y1="290" x2="250" y2="348" class="d-line" marker-end="url(#arrow)"/>
  <text x="120" y="324" class="d-label">dispatch: run_id only</text>
  <line x1="430" y1="348" x2="430" y2="290" class="d-line" marker-end="url(#arrow)"/>
  <text x="442" y="314" class="d-label">start · authorize</text>
  <text x="442" y="332" class="d-label">complete / fail</text>
  <rect x="60" y="350" width="560" height="160" rx="12" class="d-box"/>
  <text x="340" y="380" class="d-title">GitHub Actions: one generic agent workflow</text>
  <text x="340" y="400" class="d-sub">validates the run ID, loads the agent's prompt file, runs it, returns findings.json</text>
  <rect x="80" y="418" width="250" height="76" rx="8" class="d-inner"/>
  <text x="205" y="444" class="d-small-title">Agent (Copilot CLI)</text>
  <text x="205" y="464" class="d-small">one prompt file per agent,</text>
  <text x="205" y="480" class="d-small">shared findings schema</text>
  <rect x="350" y="418" width="250" height="76" rx="8" class="d-inner d-planned"/>
  <text x="475" y="444" class="d-small-title">MCP server</text>
  <text x="475" y="464" class="d-small">one read-only runtime account;</text>
  <text x="475" y="480" class="d-small">per-tool checks: planned</text>
  <line x1="340" y1="510" x2="340" y2="548" class="d-line" marker-end="url(#arrow)"/>
  <rect x="140" y="550" width="400" height="60" rx="10" class="d-box"/>
  <text x="340" y="576" class="d-title">ServiceNow writes the result</text>
  <text x="340" y="596" class="d-sub">a labelled work note on the record, for a person to review</text>
</svg>
</figure>

**How a run works**

1. **A caller asks.** It calls `POST /runs` with the agent name, the record to work on and an idempotency key, using its own service account.
2. **ServiceNow decides.** It checks the caller may run that agent, works out the tools the run may use (the agent's allowlist, limited to the tools the caller holds roles for), records the run and logs the decision.
3. **ServiceNow dispatches.** It starts the GitHub workflow and sends **only the run ID**. Callers can't inject anything into GitHub, and only ServiceNow holds the dispatch credential.
4. **The agent runs as one account.** It authenticates with a single read-only runtime account and sends the run ID with every call. A run can start only once, and only before it expires.
5. **Findings come back structured.** The agent returns findings in a shared schema: summary, hypotheses with confidence, evidence, next steps. **ServiceNow** writes the work note, not the model.

**Why the run ID isn't a password.** A call is honoured only when it comes from the runtime account, for a run ServiceNow created, while that run is running and unexpired. A leaked run ID is useless to anyone else.

**Adding an agent** is a prompt file plus a few registry rows, not a new pipeline. The [Demand agent](../guardrails/agent-permissions-by-addition.md), which turns customer requests into scoped, estimated Stories for human review, was added this way, with its write permissions granted one explicit rule at a time.

## Where it stands

| Piece | Status |
|---|---|
| MCP server with per-user OAuth and team standards | In production, used daily by my team |
| Problem triage agent | Working, now running through the gateway |
| Demand agent | In production |
| Agent Gateway: caller API, role checks, run records, dispatch, audit logging | Built in QA, with agents onboarded |
| Per-tool authorization inside the MCP server ("proxy mode") | Designed, not built yet |
| A separate identity for each agent | Designed, not built yet |

## What I'd point to

- **Security is decided in one place.** Everything outside ServiceNow is treated as untrusted, including my own workflow and my own MCP config.
- **Least privilege at three layers.** Which agent a caller can run, which tools a run can use, and which data those tools can read.
- **The model never writes the record.** Agents return structured findings; deterministic code does the write-back.
- **Built to be tested.** The plan includes an authorization test matrix: a caller without the role, a second start of the same run, a tool outside the run's list, a role removed mid-run, a run after expiry.
- **Honest about what's left.** Per-tool checks and per-agent identities are designed but not built, and the case study says so.
