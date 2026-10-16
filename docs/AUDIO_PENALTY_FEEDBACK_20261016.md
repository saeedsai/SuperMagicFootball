# AUDIO-PENALTY-OUTCOME-CUES — original procedural sound feedback for shootouts

**Date:** 16 October 2026  
**Feature claim:** `audio-feedback` — `audio-penalty-cues-20261016-gpt6-session14`  
**Claim source baseline:** `a56eb3d1f14839212a886cb6659087c8b86f580a`  
**Ownership:** new independent audio scope; source `src/modules/audio.js` had no audio-specific active claim or intervening edits in its pre-feature git history. All other existing static locks (gameplay-engine, UI, graphics, integration, QA, release) were held by different concurrent agents. Neither their files nor their claims were edited.

## User-visible gameplay feature delivered

**Penalty shootouts now sound different when the shot scores versus when a keeper saves it.** The existing live modular event bridge already forwards real `GameEngine.emit` events to `ArcadeAudio.cue`. Before this batch `penaltyKick` always mapped to one ordinary kick tone, regardless of its boolean `goal` result, while `penaltyStart` and `penaltyDive` had no dedicated sound.

Only the current playable `src/modules/audio.js` cue router was changed:
- `penaltyStart`: subtle two-note invitation on the existing **UI** bus.
- `penaltyDive`: a short low whoosh tone on the existing **SFX** bus.
- `penaltyKick` with `goal: true`: ascending three-note **SFX** cue.
- `penaltyKick` with `goal: false`: descending three-note **SFX** cue.
- String-only or malformed `penaltyKick`: retains the original kick tone for backwards compatibility.

All sounds are newly generated in real time by the existing Web Audio oscillator; no licensed music, samples, downloads, new control button, setting key, persisted data or external dependency was introduced. Existing gesture-to-unlock, master/mute, independent SFX and UI faders, page-visibility suspension, event deduplication, and context disposal continue to apply. Existing global goal/save audio, match physics, penalty scoring, keeper AI, input, teams, tactical styles and save format are untouched.

## Changed and deliberately excluded paths

| Path | Change |
|---|---|
| `src/modules/audio.js` | Four distinct penalty event/outcome cues in the playable modular audio implementation |
| `tests/penalty_audio_feedback.test.cjs` | Six dedicated Node contracts, including genuine engine-to-UI event wiring assertion |
| `tests/penalty_audio_feedback_browser_qa.py` | Desktop and simulated mobile real Chromium Quick Match kickoff + engine event routing through actual playable UI audio listener; oscillator interception for deterministic assertions |
| `docs/AUDIO_PENALTY_FEEDBACK_20261016.md` | Owner handover, evidence, limitations and next-five plan |

No changes to `src/audio.js` (archived legacy implementation), `src/modules/engine.js`, `src/modules/ui.js`, `src/modules/input.js`, `scripts/build.py`, `sw.js`, graphics, roster/source shards, `docs/NEXT_MILESTONES.md` (currently claimed by other agents), memory registry, or CI workflow files. No valid reference, QA file, documentation, artwork or template was deleted because no unused asset could be proven safe.

## Regression evidence and acceptance status

**Direct feature commits:**
- [`59ee8b59` — modular audio outcome cues](https://github.com/saeedsai/SuperMagicFootball/commit/59ee8b59df353e9c7ca763d4a0cbd34e9b7a02c4)
- [`d0be65de` — six automated audio contracts](https://github.com/saeedsai/SuperMagicFootball/commit/d0be65dea053eecb2eead19a3379fd16059c2ecb)
- [`3175c0f5` — real desktop and mobile event/audio bridge acceptance](https://github.com/saeedsai/SuperMagicFootball/commit/3175c0f57c903d6fe1bb29d0fc768f2ac0671fdc)

The exact code [Modular Game Dev QA #38914713421](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914713421) compiled and ran all **six new penalty audio Node tests PASS**. It reported **164/165 active Node tests PASS** and separate **20/20 Python merge**, **10/10 feature-claim** contracts PASS. Data validation, 165-club roster/history checks and Python script compilation were successful. The **one failed test** is `tests/project_memory_contract.test.cjs` (“one unique, short per-chat file per indexed agent with no unregistered extras”); this is a concurrent project-memory/index issue under `project-context`, not a cue assertion, and it is not acceptable to claim the overall job green. Earlier runs were also red while another agent edited `tests/penalty_shootout_lifecycle.test.cjs` (syntax and then scenario assertions); they are outside this audio claim and may evolve concurrently.

**Real browser audio acceptance:** the new `tests/penalty_audio_feedback_browser_qa.py` is discoverable by the common full-regression runner on the current source. It checks actual `GameEngine.emit` to `game.onEvent` to `audio.cue` through a Quick Match on desktop Chromium and simulated-touch Chromium. It intercepts oscillator tone scheduling, **not audible speaker output**. Browser execution remains **not verified** until one full 4×Node + 4×Chromium census containing this code completes.

**Hosted play:** https://saeedsai.github.io/SuperMagicFootball/ . The web fetch of the public URL was unavailable in this session. Historical [PC + simulated-touch hosted Quick Match](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) passed on prior source, but does not prove this exact sound change. A Pages deploy can confirm publication but cannot verify speaker behavior or physical phones. Do not claim current live-site, Android/iOS hardware or offline/PWA certification.

To reproduce after building the QA fixture:
```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/penalty_audio_feedback.test.cjs
node --test tests/*.test.cjs
python3 tests/penalty_audio_feedback_browser_qa.py
python3 tests/v0823_audio_browser_qa.py
python3 -m unittest discover -s tests -p test_parallel_data_merge.py -v
```

## Remaining requirements, risks and next five iterations

1. **Clear concurrent QA gate:** Have the `project-context` owner reconcile its indexed agent files and the `qa-framework` owner finish penalty lifecycle regression; rerun exact-code Modular QA and the full eight-shard census with no unrelated failures. Include new audio browser script's precise PASS/FAIL in the evidence.
2. **Penalty keeper gameplay:** After `gameplay-engine` and needed `ui-controls` ownership are available, implement genuine human control of a defending PK goalkeeper for Versus without affecting single-player auto goalkeeper. [Issue #5](https://github.com/saeedsai/SuperMagicFootball/issues/5).
3. **Android rainbow-dribble reliability:** Reproduce the original actual-match emulated-touch trick failure with controlled possession and frame-state logs; protect the previous input buffering fix and [issue #3](https://github.com/saeedsai/SuperMagicFootball/issues/3).
4. **Gameplay and art polish:** Add pressure-aware first touch / pass reception with measured physical impact only under gameplay ownership; direction-safe pass/catch/keeper animations under graphics ownership.
5. **Playable delivery:** Certify the production Pages desktop + simulated-touch Quick Match, goal/save sound scheduling, physical device speakers and gesture/audio resume, saved-game stability and PWA offline/restart behavior. Existing shot-telemetry/keeper fairness and sourced FC27 data verification continue under separate specialist claims.

**Checkpoint and coordination:** This one owned audio-only feature can be released after the source, tests and this handover are committed. It does not claim that exact-source full regression or new-hosted interaction passed when they did not. Retain the original match and audio tests for historical parity.

### Latest tested integration and owner handoff (final checkpoint)

[Modular Game Dev QA #38914959661](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38914959661) on report commit `d854f1960c36ed9bee4b057083a807bc23c40420` ran **170 active Node tests: 169 PASS / 1 FAIL**. All six penalty-audio tests passed. The sole failing assertion was the existing project-memory identity/index contract, now explicitly tracked as [issue #8](https://github.com/saeedsai/SuperMagicFootball/issues/8), with a source-SHA evidence comment for its `project-context` owner. No one in this audio feature edited the shared memory or global index. 20 Python merge tests and 10 feature claim protocol tests were also successful.

A full Chromium acceptance on this exact source, production speaker audio, physical Android/iPhone and offline/PWA still need separate QA once the memory blocker is repaired. Any full regression currently failing at preflight is not proof the new browser test failed. Preserve separate gameplay-engine and UI feature claims.
