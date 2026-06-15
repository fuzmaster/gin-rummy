---
description: Audit & fix gin-rummy gameplay for low-attention-span players
argument-hint: "[optional extra focus, e.g. 'just the CPU turn']"
---

# Role
You are a **game-feel auditor**. Make this gin rummy game maximally engaging and
frictionless for a player with a **LOW ATTENTION SPAN** — someone who bounces the
instant there is dead time, ambiguity, reading, or slow feedback. Audit the current
gameplay by actually playing it, then implement the highest-impact fixes.

# The player you are designing for
- Bounces within seconds if nothing is happening or it is unclear what to tap next.
- Will **not** read rules, long status text, or modals.
- Craves constant, immediate feedback and quick wins; loves "one more round" momentum.
- Wants short sessions and fast rounds.
- Hates waiting (CPU turns, unskippable animations) and decisions that require math
  (deadwood counting, when to knock).

# Audit rubric — score each 1–5 with concrete evidence from PLAYING the game
1. **Time-to-fun** — taps/seconds from load to first meaningful action.
2. **Dead time** — idle ms per turn where the player waits with no input (CPU
   "thinking" delay, blocking animations, modal waits). Measure it.
3. **Next-action clarity** — is the single best next tap always obvious without reading?
4. **Cognitive load** — how much thinking/math is required (which pile to draw, what to
   discard, whether to knock)?
5. **Feedback density** — does every tap produce instant visual + audio + state feedback?
6. **Reward cadence** — how often are wins/progress/juice moments delivered and celebrated?
7. **Session length** — how long is a round and a full game? Is there a fast option?
8. **Reading load** — count the words a player must read per turn.
9. **Failure/confusion states** — dead ends, ambiguous disabled buttons, soft-locks.
10. **Stickiness** — streaks, combos, progress toward target, "one more round" pull.

# Measurement protocol (do this, don't guess)
- Run the app (`preview_start`) and play **2–3 full rounds**.
- Count and record: taps to start a game; taps per turn; **ms of dead time per turn**;
  words read per turn; seconds per round.
- Note every single moment where you would lose a low-attention player.

# Grounding — this codebase
- State machine / rules: `src/game/engine.ts` (the `cpu-turn` phase flow).
- **The CPU turn is auto-triggered after an 800ms `setTimeout` in `src/App.tsx`** — that
  is pure dead time; combined with the discard/CPU flight animations it is longer.
- Round/game-over modal: `src/components/RoundResultModal.tsx` — requires a tap to continue.
- Table + controls: `src/components/GameTable.tsx` (deadwood chip + knock-ready pulse,
  Sort, draw/discard/knock buttons already exist).
- Settings: target score (50/100/250), difficulty, sound — `src/components/Settings.tsx`,
  persisted via `src/storage.ts`.
- Animations/SFX: `FlyingCard.tsx`, `styles.css` keyframes, `src/sfx.ts`.
- **Do not break** the gin-rummy rules engine or the 30 tests in `src/test/game.test.ts`.

# Candidate levers (validate by playing — don't assume; pick the biggest wins)
- Cut or make **skippable** the CPU turn delay + animations (a "Fast" toggle, shorter
  delays, or tap-to-skip).
- **Auto-advance** the round-result modal (timer + a huge pulsing "Next"), so a win/loss
  never stalls the loop.
- A clearly-labeled **"Quick Game"** (target 50) and/or make it the default.
- One-tap **Hint / suggested move** (which pile to draw, what to discard, when to knock)
  to remove the math.
- Proactive **"Knock for X points?"** call-to-action the moment deadwood ≤ 10.
- Replace wordy status text with **glanceable** cues / icons.
- Add **momentum**: streak counter, a progress bar toward the target score, a floating
  "+points" pop on a win.
- Make the **one obvious next action visually loud** (primary button) and dim the rest.

# Deliverable
1. A short **audit table**: dimension → score (1–5) → the specific friction observed.
2. A **prioritized fix list** (impact × effort); mark the top 3–5 as **DO NOW**.
3. **Implement the DO-NOW fixes.** Keep gin-rummy rules intact; keep all tests green; add
   tests for any logic you change.
4. **Verify**: `npm run build`, `npm test`, and play it in the preview to confirm the loop
   feels faster and clearer.
5. **Before/after summary** with the numbers that moved (dead time per turn, taps to start,
   words read, seconds per round).

# Constraints
- Don't sacrifice correctness or accessibility — keep `prefers-reduced-motion` support and
  aria labels.
- Keep changes focused and reversible; one concern per commit. Follow this repo's existing
  commit/deploy workflow (confirm before pushing to `main`, which auto-deploys to Vercel).
- Don't remove existing options — add fast-friendly **defaults** instead.

Extra focus for this run (optional): $ARGUMENTS
