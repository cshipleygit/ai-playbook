# Three confident fixes for a CI hang, then one measurement

> When an agent keeps fixing a bug by reasoning about an environment it can't see, stop it and make it measure. One probe on the real machine beat three well-argued guesses.

## The problem

After a change to how my video pipeline rendered audio, every CI run hung in the test step until GitHub Actions cancelled it at 20 minutes. Locally, everything passed. The agent had written the change, so it went looking for the cause.

Each fix it proposed was specific and plausible, and came with a clear explanation. It also didn't work, and each failed attempt cost a 20-minute push.

## The setup

- **Agent (Claude Code):** wrote the render code, the fixes and the commits
- **CI:** GitHub Actions on a GPU-less Ubuntu runner, with whatever ffmpeg build the runner image ships
- **Local machine:** Windows, NVIDIA GPU, a newer ffmpeg
- **Me:** pushed, watched CI, and called time on the guessing

## What happened

1. **Fix 1: three plausible causes.** The agent pointed at three things the change had added that were "fine locally but risky on a GPU-less runner with ffmpeg 6.1": hardware acceleration on every shot, an audio pad with no end, and ffmpeg listening on stdin. It fixed all three and added a per-test timeout. CI still hung.
2. **Fix 2: "the real CI hang."** The new timeout named the stuck test, which was real progress. The agent then explained the hang as an ffmpeg 6.1 quirk and made every audio stream end on its own. CI still hung.
3. **The wrong premise.** Both fixes assumed the runner had ffmpeg 6.1. Nobody had checked. The runner had **ffmpeg 8.0.1**.
4. **The probe.** After the second miss, I told the agent to stop proposing fixes and measure instead. It added a temporary diagnostic to CI. The diagnostic timed each shot of the stuck test on the runner's own ffmpeg, then reran the hung shot with one ingredient removed at a time, and reported the results as annotations readable without the job log.
5. **What the probe showed.** Every sped-up shot hung when its audio went through `atempo` plus padding in the same ffmpeg run as the video. Picture alone and sound alone each finished in under a second.
6. **One more miss, then the fix.** Reordering the audio filters didn't help ("whatever the filter order"). Because the probe had shown each part finishing alone, the final fix rendered picture and sound in separate ffmpeg runs, then combined them with a plain copy. CI went green.
7. **Making it stick.** The probe was removed, and the project's CLAUDE.md now records why a shot takes three ffmpeg runs, so a future agent doesn't "simplify" it back into one.

In total, 13 pushes were cancelled at 20 minutes each before the probe found the cause.

## What works

- **Check the environment before reasoning about it.** "What version is actually on the runner?" would have saved most of the 13 pushes.
- **Call time on guessing.** After two confident misses, I stopped asking for fixes and asked for a probe. That one change found the bug.
- **Ask for a probe, not a fix.** Removing one ingredient at a time on the real machine turns guesses into a result.
- **Make hangs fail by name.** A per-test timeout turned "the job was cancelled" into "this test, inside this function."
- **Put results where you'll see them.** Annotations on the run beat digging through a 20-minute log.
- **Write down why the code is strange.** If the fix looks odd, record why in the project's AI instructions, or the next agent will undo it.

## Gotchas

- **A good explanation isn't evidence.** Every wrong fix came with a convincing story about the cause.
- **"Works locally" hides version differences.** Different OS, no GPU and a different ffmpeg build meant different behaviour.
- **Remove the temporary diagnostics.** A probe left in CI becomes noise. Remove it, but keep what it found.

## What I asked for (roughly)

```
CI is still failing and we've guessed twice. Don't propose another fix.
Write a temporary diagnostic that runs on the CI runner: print the exact
versions of every tool involved, time each step of the failing test, then
rerun the failing step with one ingredient removed at a time. Report the
results as annotations. We'll fix it once we know.
```

## When not to use this

- When the failure reproduces locally. Debug it there; it's faster.
- When the first fix is cheap to try and fails fast. A probe is worth it when each wrong guess costs a long CI run.
