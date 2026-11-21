# Mining my own AI chat history for playbook entries, on a read budget

> A local script turns months of raw AI chat logs into small, redacted text files, and a model reads only a budgeted sample of them. The model never sees the raw data, and nothing it reads goes over the budget.

## The problem

The real examples for this playbook were sitting in five months of Copilot chat history: 363 sessions, 857 MB of JSON, with single files up to 101 MB. Pasting that into a model would be expensive and would push a lot of work data through it. Reading it myself would take days.

## The setup

- **A script, not a model, touches the raw data.** One Python script, written and run by the agent.
- **Copilot agent mode with Claude**, with lightweight subagents for the reading
- **Me:** set the budget and the rules, review the extraction before any analysis, and decide what gets published

## The loop

1. **Script:** rebuild each session from its saved snapshot plus later patches, and count its turns. The counter was tested on 3 sessions before the full run (0 → 3, 0 → 9 and 61 → 62 turns).
2. **Script:** drop templated automation sessions and sessions under 4 turns, and print how many survive at 3, 4, 6 and 8 turns so I can choose the cut-off.
3. **Script:** write one text file per session: my messages and the assistant's prose only, a one-line marker for each tool call, a 15 KB cap per session, and IDs, emails, tokens and instance URLs redacted. Plus an index with turns, size and a keyword score.
4. **Stop.** The model reports the numbers and waits until I say "continue".
5. **Model:** read the index, pick about 25–30 sessions and say why, then trim the list to fit a hard 400 KB budget.
6. **Subagents:** read the chosen sessions in parallel batches, each file once, and return short notes with quotes.
7. **Model:** rank candidate entries from the notes file only, without re-reading sessions.
8. **Second pass:** for the best candidates only, read the full stories and verify every quote against the source.

## Who does what

| Me | AI |
|---|---|
| Set the budget, the exclusion rules and the list of existing entries not to repeat | Wrote and ran the extraction script |
| Reviewed the extraction report before any analysis | Checked its own counters and clustering, then fixed them |
| Asked for the second, verifying pass | Picked sessions, ran subagents, merged notes, ranked candidates, verified quotes |
| Decide which candidates become entries; sanitize and publish | |

## Results

- 857 MB of raw JSON → 2.1 MB of redacted text → 26 sessions (about 385 KB) read in the first pass.
- 204 sessions kept out of 363 (24 empty, 3 templated, 132 too short).
- 8 ranked candidates and 6 near-misses, each tied to session files and quotes.
- The first pass cost 73 Copilot credits. The verifying pass read about 180 KB more.
- In the second pass, 14 of 16 quotes matched word for word, and the other 2 differed only in formatting. Several of the entries on this site came out of this run.

## Where it breaks

- **Prefix clustering lies.** The first run flagged 23 sessions as "templated". They were unrelated questions that all started with a pasted record URL. Stripping leading URLs cut that to 3. Always look inside the clusters you exclude.
- **Naive counters undercount.** Some sessions start with 0 turns in the snapshot and get all their turns from later patches. Counting only the snapshot would have dropped them as empty.
- **Keyword scores reward pasted text.** The top-scoring session scored 1,370 because of one pasted debug log of about 277,000 characters. "eval" also matched "evaluate". Use the score to sort, not to decide.
- **Summaries drift under a tight budget.** The first pass worked from subagent notes, not the source. It turned "3 out of 3, plus one earlier human report" into "4/4", and "compared against a manual run" into "confirmed the fix". The verifying pass caught both.
- **Truncation hides the middle.** A 15 KB cap per session can cut out the turn where the fix happened. "Not in the chats" sometimes means "not in the excerpt".
- **Redaction is pattern-deep.** It catches IDs, emails, tokens and URLs, but not names, team names or ticket numbers written in prose. Sanitize the final text by hand.

## When not to use it

- When you have only a handful of sessions. Just read them.
- When the logs may contain regulated personal data that shouldn't sit in plain text on disk, even temporarily.
- When you need audit-grade quotes from the first pass. Budgeted summaries trade exactness for cost, so verify before publishing.

## Prompts I use

The first-pass prompt is long. Its core rules:

```
Before reading any session in full, write a script that extracts only the user
messages and the assistant's text replies into one plain-text file per session.
Do the analysis on those text files only, never the raw JSON.
Stop after extraction, report the numbers, and wait for me to say "continue".
Every candidate must cite the session and date, with short quotes.
If a claim isn't visible in the chats, say "not in the chats".
```
