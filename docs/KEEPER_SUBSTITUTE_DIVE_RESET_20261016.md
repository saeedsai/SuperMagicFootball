# Goalkeeper substitution resets outgoing dive state

**16 October 2026 — scoped gameplay bug fix**

## Reproducible gap

The modular match engine updates player objects in place when a paused-match lineup substitutes a new goalkeeper. Before this checkpoint, `applyPlan` reset `diveDy`, `diveDx` and `diveElapsed`, but omitted `diveIntentPending`, `diveIntentCooldown` and `diveAdvanceTravel`. A new goalkeeper could therefore inherit the outgoing keeper's dive state. An inherited `keeperDive` action and pending flag can activate the defensive AI hold branch, temporarily freezing normal positioning.

## Minimal correction

On **actual player-ID replacement only**, clear pending keeper dive intent, accumulated physical lunge travel and its intent cooldown. If the replaced slot was displaying `keeperDive`, `keeperDiveCatch` or `keeperRecover`, clear that obsolete pose, timer and jump elevation. A keeper retaining the same player ID through a formation change keeps their normal state.

No modification to keeper physical reach, lunge speed, ball/shot physics, goalkeeper contact, fatigue model, player stats, team indices, saved progress, controls, UI, art, or service worker.

## QA acceptance and next checkpoint

Dedicated `tests/keeper_substitute_dive_state.test.cjs` exercises the **actual extracted engine applyPlan method** with a paused lineup, goalkeeper replacement, ball release, substitution count, preserved unchanged keeper and stale catch/recovery pose. The standard Node suite and GitHub full regression are required on the integrated commit.

**Test status at creation:** not yet executed against exact published commit; update after GitHub Actions completes. No claim of real-device certification or local web browser interaction.

## Next five small gameplay-focused iterations

1. Review real keeper-AI versus human-shot cohorts for reproducible fairness gaps before retuning movement.
2. Advance keeper glove release/grip poses under the separate graphics lock.
3. Polish first-touch and pass reception transitions without touching ball speed or four controls.
4. Improve halftime reserve/captain suitability suggestions, respecting UI/QA ownership.
5. Revisit original-game special-move and match-rule parity with grounded acceptance scenarios; network and full device certification remain deferred.

Coordination: feature `GK-SUB-DIVE-STATE-RESET`, lock `gameplay-engine`; this checkpoint does not overwrite the parallel touch input, modular concept art, QA harness, roster or context-memory workstreams.
