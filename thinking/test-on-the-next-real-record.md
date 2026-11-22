# Test every claimed fix on the next real record

> An AI diagnosing a live system will sound equally sure when it's right and when it's wrong, including when it takes back an earlier mistake. The only reliable check is the next real record.

## The problem

When I troubleshoot platform behaviour with an AI agent, it reads configuration, forms a root cause and says it with confidence: "the smoking gun", "that confirms it", "that is the right fix". Often it's right. But across months of chat history, I found the same pattern again and again: a confident diagnosis, a fix, and then the next real record behaving exactly as before.

The AI's confidence never changed between its right and wrong answers. So confidence can't be the signal.

## The setup

- **Agent with access to the system:** reads configuration, records, flows and audit history through my MCP server, and proposes changes
- **Me:** makes or approves changes, creates the next real record, and checks what actually happened

## The loop

1. **AI:** diagnoses the problem and proposes a fix.
2. **Me:** apply the fix (or have the agent apply it in a sandbox).
3. **Me:** create the next real record that should now behave differently, and hand it to the agent.
4. **AI:** check that record end to end, and say plainly whether the fix worked.
5. If it didn't: treat the earlier diagnosis as disproved, including any retraction, and go back to step 1 with the new evidence.
6. Don't accept "almost certainly", "likely" or a familiar default explanation. Ask the agent to confirm it.

## A real example: four confident fixes in a row

**The goal:** automatically created changes should skip approval. Instead, every one landed in the Authorize state with 37 approvers.

| # | The AI's confident claim | What disproved it | What happened next |
|---|---|---|---|
| 1 | The approval policy "is not the control point for this model" | My pushback: there had to be a way to bypass approvals without editing the flow | "You're right." It found two matching rules at the same order. |
| 2 | Give the custom rule a lower order (−1) | The next change still went to Authorize | "I was wrong to recommend `-1`; this record gave us the clean proof." It switched to +1. |
| 3 | +1 fixes it: "the configuration is now positioned correctly" | The next change "did **not** auto-approve [...] This disproves my priority conclusion" | It proposed excluding these changes from the high-risk rule. |
| 4 | "Yes. That is the right fix." | The next change still created 37 approvals | "My earlier claim [...] was incorrect." It advised rolling the policy edits back. |

The retraction in row 2 sounds like the moment the AI finally got it right. It wasn't. The "clean proof" was wrong too.

**Resolution:** the AI next proposed cloning the whole change model, which wasn't what I was asking for. Skipping the Authorize state for these changes was then approved, and I edited the model's transition condition. The third test record after that change confirmed it: no approval requested, and the change moved on without an approval group.

In all, about 6 test records disproved 4 confident claims before the real fix.

## Two shorter cases

**A list that showed blank names, except for admins.** The AI's explanation moved from a missing display value, to a field-level ACL added in May ("a strong candidate"), to the `name` field not being marked as Display ("the shared defect"). I brought two facts: the May ACL didn't exist in Production, where the bug also happened, and admins could see the names. Asked "But why does it not show for Admins then", the AI first doubled down, saying the Display setting affected admins too. When I asked again, it retracted: "Please do not change that dictionary setting based on my earlier suggestion." When I asked it to just find the cause, it mapped every read ACL against a regular user's roles and found a platform "Deny Unless" read ACL blocking users who can't grant the role. Its debug trace had misled it because the trace ran without a real record. It proposed a targeted allow ACL for the 8 affected roles, leaving the platform ACL untouched.

**A change stuck in New after deployment.** The AI's first root cause was the auto-close setting. Its second was "the smoking gun [...] in the **pipeline itself**", based on a pipeline file that happened to be open in my editor: the GitHub workflow, when the failing pipeline was Jenkins. ("STOP LOOKING AT CI 1.") Its third was a timing race, which drew: "You keep defaulting to timing when I have you troubleshoot issues." The decisive fact came from me: "We installed the plugin in Prod recently would that be why". QA and Production were on different major versions of the plugin, and the vendor documentation mapped the change to one system property. When the AI said other changes would "almost certainly" be unaffected, I asked it to confirm instead, and it checked the trigger conditions and the backlog. Along the way it offered to change the setting in Production right then; I declined.

## What works

- **The next record is the test.** Every claimed fix gets checked against a real record created after the change, not against the configuration the AI just read.
- **Retractions get the same test.** "I was wrong, here's the real answer" is just another claim.
- **Bring counterexamples, not opinions.** "Admins can see it" and "that ACL doesn't exist in Production" ended wrong theories faster than any argument.
- **Ban hedges.** "Almost certainly" means "I haven't checked". Ask the agent to check.
- **Notice its favourite explanation.** If the AI reaches for the same cause (timing, caching, a race) across different problems, make it prove that cause before accepting it.

## Gotchas

- **The AI reads whatever is in front of it.** An open file in the editor became "the pipeline" in one case. Name the exact component you mean.
- **Debug tools can mislead the AI too.** A trace run without a real record pointed it the wrong way.
- **Don't let it fix production mid-diagnosis.** A confident agent will offer to "just set it now". Say no until the cause is proven.
- **Some fixes are policy, not configuration.** The approval case ended with a human decision about process, not a cleverer rule.

## Prompts I use

```
Before we change anything else: what record will prove this fix worked?
When I create it, check it end to end and tell me plainly whether the fix
worked. If it didn't, treat your earlier diagnosis as disproved, including
any correction you made, and start again from the evidence.
```

## When not to use this

- When the change is cheap to test locally. Run the test instead of reasoning about it.
- When creating the next real record has side effects you can't undo (notifications, approvals to real people). Use a sandbox record instead.
