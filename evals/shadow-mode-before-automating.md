# Shadow mode before you automate a human step

> Before an AI takes over a decision a person makes, run it silently next to that person, compare every call it would have made, and count the mistakes nobody would have noticed. Hand over control only when that count stays at zero.

## The problem

My open-source video pipeline, [pokepipe](https://github.com/cshipleygit/pokepipe), finds every Pokémon card pulled in a pack-opening video. Then it stops and waits for a person to review: confirm each card, fix wrong matches, add missed ones, mark reverse holos. That review was the only manual step left, and on a 9-pack video it meant checking about 90 cards.

I wanted an auto-reviewer that settles what the evidence clearly supports and only asks a person about the rest. The risk is the obvious one: an auto-reviewer that's confidently wrong publishes the wrong card in a video, and nobody finds out.

## The setup

- **Detection:** CLIP image embeddings matched against every card in the set, on a local GPU
- **Recovery agent:** a Claude agent (LangGraph tool loop) that suggests cards detection missed
- **Auto-reviewer:** plain rules, no model. It runs after detection and recovery, before the review page.
- **The review page:** where a person confirms or corrects every card. Their decisions are saved as JSON.
- **Me:** the reviewer, and the person deciding when the auto-reviewer gets more control

## The rules it uses

A **card** is trusted only if its match confidence clears a threshold *and* it beats the best different card by a clear margin. The margin came from a real near-miss: two versions of the same Pokémon with near-identical art scored 0.007 apart.

A **pack** is auto-confirmed only if it has exactly the expected number of cards, they fit the known slot layout of a booster pack, and every card in it is trusted. Anything else stays with the person, with a note saying why. When two suggested cards came from the same stretch of footage, their order is a guess, so the whole pack goes to the person.

## The loop: four modes, one at a time

| Mode | What the auto-reviewer does | What the person sees |
|---|---|---|
| `always` | Nothing | A normal review |
| `shadow` (the default) | Records what it *would* decide, to a separate file | A normal review, **not pre-filled**, so their labels stay unbiased |
| `exceptions` | Applies its decisions; finishes the review alone if nothing is left | Only the packs it couldn't settle |
| `off` | Never pauses; anything unresolved is marked UNCHECKED | Nothing |

1. **Shadow.** The person reviews as normal. The auto-reviewer's choices are saved but never shown.
2. **Replay.** A replay command re-runs the auto-reviewer on each finished human review and compares the two, decision by decision.
3. **Count silent errors.** A silent error is anything the auto-reviewer would have confirmed that the person changed: rejected the card, switched it to a different card, flipped reverse holo, moved it to another pack, or added a card to a pack it called complete. These are the mistakes nobody would catch.
4. **Promote only on evidence.** Once replay shows zero silent errors over several videos, switch to `exceptions`. Later, `off`.

## What happened

I built the auto-reviewer before recording any new footage, so the first real test was replaying it against a review I'd already finished by hand. On that video:

- It would have settled **50 of 91** card decisions by itself, with **0 silent errors**.
- It sent the other 41 to a person, each with a reason. **40 of those needed no change.** It was cautious, not wrong.
- **It caught a mistake of mine.** Replay flagged a card where the auto-reviewer disagreed with my review. I checked the footage, and the auto-reviewer was right: I'd missed a reverse holo. I fixed my review before freezing it as test data.

## Making it stick

- **Every finished review becomes a test.** An export command freezes finished human reviews (JSON only, no footage) into the test suite. A test replays the auto-reviewer on each one and **fails if silent errors go above a baseline** stored in the repo. The baseline only ever moves down as the rules improve.
- **Calibrate on real labels.** A small logistic regression, fitted only on human decisions, sets the confidence cut-off just above the highest-scoring card that a person rejected. It refuses to run without at least 3 known-wrong labels.
- **Replay refuses bad ground truth.** A review that still contains untouched auto-decisions isn't a human label, so replay won't score against it.

## What works

- **Blind labels.** If shadow mode pre-filled the review, I'd have agreed with it more often, and the comparison would flatter the model.
- **Name the error that matters.** "Accuracy" mixes harmless caution with dangerous mistakes. Silent errors are the dangerous ones, so they get their own count.
- **Send whole packs, not single cards.** A pack with one doubtful card goes to the person in full, with its context.
- **Disagreement goes both ways.** Replay is also an audit of the human. Here it found my mistake.
- **A ratchet, not a target.** The test fails when silent errors rise, and the baseline only ever gets stricter.

## Gotchas

- **One video isn't enough.** The 50/91 result comes from a single real review. The default is still `shadow` until several more videos replay clean.
- **Rules tuned on the data they're tested on.** The recovery agent's tools were partly designed on the same video. New footage is the real test.
- **Caution has a cost.** Sending 41 decisions to a person when 40 were fine is safe, but it's still 41 decisions. The calibrator is how that number comes down.

## When not to use this

- When the human step is cheap and rare. Shadow mode only pays off when the step is repeated often.
- When you can't get honest labels, because the person always sees the model's answer first or nobody reviews at all.
