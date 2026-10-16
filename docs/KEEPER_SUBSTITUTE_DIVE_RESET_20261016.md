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

## Exact-source verification checkpoint

**Gameplay source commit:** [`1decc48895a81ca3b2f87f84d49e478b0f736085`](https://github.com/saeedsai/SuperMagicFootball/commit/1decc48895a81ca3b2f87f84d49e478b0f736085). All tests below were scheduled against this exact commit rather than assumed from a previous release.

- [Modular Game Dev QA #38905337012](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905337012): **SUCCESS** — 137/137 active Node subtests, including all three new goalkeeper replacement tests; 20/20 Python merge safety tests; 10/10 feature-claim tests; JSON, club roster and Python compilation steps PASS.
- [Keeper Save Event Integrity #38905336953](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905336953): **SUCCESS** — real modular Chromium mirrored goalkeeper catch and save acceptance.
- [Full Regression Census #38905337000](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905337000): **preflight PASS and 123/123 historical/current Node scripts PASS** across four shards (31 + 31 + 31 + 30). Four Chromium shards started and were **in progress at this checkpoint**; do not claim browser census success until the workflow conclusion is confirmed.
- [Verify Deployed PC and Touch Game #38905336972](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905336972): **SUCCESS** — published site HTTP 200, desktop 1440×900 and emulated touch 844×390 launch menus, team selection and Quick Match with current baseline pitch/config. This hosted smoke is not proof that the new substitute-dive fix was deployed: the [Pages job for this exact source commit](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38905336737) was cancelled after newer concurrent pushes.
- Physical mobile devices, alternate browser engines and browser-restart save persistence were **not tested**.

**Checkpoint outcome:** gameplay correction committed without modifying other agents' files; full Chromium census and exact-source Pages deployment remain external QA gates. Continue by checking those linked jobs before any gameplay tuning.
