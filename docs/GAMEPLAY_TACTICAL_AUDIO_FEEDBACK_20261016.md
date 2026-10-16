# Tactical coaching and substitution audio — bounded gameplay feedback

**Date:** 2026-10-16 · **Feature ID:** `AUDIO-COACHING-SUBSTITUTION-FEEDBACK`  
**Owner:** `gameplay-tactical-audio-20261016-gpt6-s16` · **Exclusive lock:** `audio-feedback`

## Implemented in the playable game

The live modular audio bridge already receives GameEngine events via `game.onEvent=e=>{audio.cue(e)...}`. This batch adds distinct original oscillator tones to `src/modules/audio.js`:

- **Real substitution:** `{type:'substitution',count:1..12}` plays a short rising two-note confirmation `330/494 Hz`. Formation-only/style changes with `count:0`, malformed data and string-only events remain silent; no phantom substitution is implied.
- **Team talk — morale boost:** authoritative `positive>backfires` gives rising `440/554/659 Hz` response.
- **Team talk — morale setback:** `backfires>positive` gives a descending `294/220 Hz` warning.
- **Team talk — balanced:** equal counters give a neutral `392 Hz` cue. Invalid count data are ignored.

All four outcomes use the existing **UI** fader, master/mute/visibility gate, audio-unlock requirement and 170 ms repeated-event debounce. No extra AudioContext, media file, gameplay event, stored setting, save change, new touch button, physics/goal/AI change or player data is introduced. The existing kick, dribble, penalty and pass-reception cues remain intact.

## Tests added

`tests/tactical_audio_feedback.test.cjs` executes the production `AUDIO.ArcadeAudio` under a fake WebAudio context: six tests cover actual substitution, false zero count, three coaching outcomes, malformed payloads, mute/unlock/UI-vs-SFX/visibility/debounce, and regression of goals/penalties/passes and the real engine-to-audio bridge.

`tests/tactical_audio_feedback_browser_qa.py` starts the genuine modular Quick Match in Chromium **desktop** and **simulated touch**, feeds actual `GameEngine.emit()` through the real UI audio bridge (with an isolated tone recorder), confirms each procedural outcome and checks original score, lineups, plans, talks, substitution allowance and four controls unchanged. It does not claim human ear/physical speaker testing or successful team-talk scoring through the synthetic event injection.

## Coordination and versioning

- Source commit: [`7f670f9c`](https://github.com/saeedsai/SuperMagicFootball/commit/7f670f9c7466efb825985e4373d966d9ad653492)
- Node test commit: [`53eed91e`](https://github.com/saeedsai/SuperMagicFootball/commit/53eed91e95c2437d3b8bcf6f1c0bd0a66edec5a7)
- Browser test commit: [`551e76f3`](https://github.com/saeedsai/SuperMagicFootball/commit/551e76f3923ffeeda420aaaff0dd11d7797651bb)
- All commits are visible in the game's About `Latest GitHub development commit` via the live `dev` SHA; the `0.8.25.32-integrated` bundle version remains a separate release identifier, not manually bumped. See `docs/VERSIONING_POLICY.md`.
- Live first-touch physics, Career scouting UI, graphical player artwork and release/deployment workflow paths were claimed by other agents and untouched. No unrelated history, graphics, tests or templates were deleted without dependency proof.

## Release checklist / handover

Run (1) active Node QA, Python merge and coordination safeguards; (2) complete 4xNode/4xChromium `Full Regression Census`, including new browser QA; (3) public Pages desktop and simulated touch smoke (separate from sound-hearing/physical handset); (4) capture SHA and results below. If frequent parallel commits cancel the census, report a bounded checkpoint with pending gates rather than making a green claim.

## Next five small iterations

1. Complete new tactical audio browser acceptance and the full historical regression; recheck Pages PC/touch.
2. Land independently owned pressure-aware first-touch mechanic, then run pass-audio and contact fairness regression on both teams.
3. Finish human penalty keeper desktop/touch dive and save balance under the gameplay-engine and UI owners.
4. Improve career opponent scouting and feedback with explicit ownership and no save migrations.
5. Continue direction-safe ball receive/pass/keeper glove animation and true offline/physical-device certification.

**Final test evidence:** to be appended after current CI verification.

## First integrated release checkpoint (16 October 2026)

- Feature source `7f670f9c7466efb825985e4373d966d9ad653492`; Node tests `53eed91e95c2437d3b8bcf6f1c0bd0a66edec5a7`; playable Chromium desktop/touch tests `551e76f3923ffeeda420aaaff0dd11d7797651bb`; docs `65935922188c9def261e1499158817eec40e6750`; roadmap `6b0b737e5630657a0d01160220bd30622a79d0cf`.
- [Modular Game Dev QA #38960659164](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960659164): **SUCCESS** with **228/228 Node tests**, including **6/6 new tactical-audio tests**, and existing Python data-merge, coordination, build and roster checks. [#38960714350](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960714350) descendant QA also **SUCCESS**. Automatic About per-commit SHA and stable bundled version are unchanged; the existing About/version regression is included in passing Node suite.
- [Full Regression Census #38960642802](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960642802) on `3395c6cf` descendant containing the new source and both tests had **IN_PROGRESS** at this checkpoint: preflight and all 4 historical Node shards passed, Chromium browser shards still running. The new `tactical_audio_feedback_browser_qa.py` must be verified as PASS from its actual job logs; neither physical mobile audio output nor actual speakers are certified by recorded WebAudio oscillator parameters.
- Hosted game: https://saeedsai.github.io/SuperMagicFootball/ . General live desktop/simulated-touch Quick Match [#38891468528 attempt 14](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) was **SUCCESS** before this session's final deployment; a fresh rerun was requested. A Pages deploy may be cancelled by fast concurrent pushes; claim only an actually successful deployment run for the feature descendant. 
- No irrelevant existing test, player-data or art files removed (referenced/ownership risk). Feature owner releases audio-feedback with explicit pending browser gate if needed.

**Next owner action:** inspect Full Regression Census #38960642802 Chromium shard where `tactical_audio_feedback_browser_qa.py` runs; fix any reproducible own-scope issue after fresh claim, then verify public hosted PC/touch game and sound faders. GameEngine first-touch and Career scouting are separately active and must not be edited.

## Follow-up: unrelated live-pass browser fixture failure and correction

- First [full census #38960642802](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960642802) on a source descendant contained the **new `tactical_audio_feedback_browser_qa.py` PASS (4.55 s)** in browser shard 1, as well as the About test PASS and all four Node shards. Shard 1 nevertheless **FAILED** because the *older* `pass_reception_audio_browser_qa.py` raised `Error: Game players unavailable` in its artificial filter `p.stun<=0` before exercising the pass sound. This uses naturally changing animation state as an irrelevant prerequisite for direct `GameEngine.take()` testing; the engine data and actual pass mechanics were not shown defective. See full run logs for [browser-regression (1)](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960642802).
- After releasing the initial feature claim, reacquired `audio-feedback` explicitly for `QA-PASS-RECEPTION-PLAYER-FIXTURE`; fixed **only** the existing test's player selection. [Commit `c4cce2bf`](https://github.com/saeedsai/SuperMagicFootball/commit/c4cce2bf044fecd2427d40745ae24d7f16b5c10f) selects live on-field outfield players by team and goalkeeper role, not by transient stun, and awaits all 12 instantiated players. It leaves engine physics, game audio, interface, scores and saved games untouched. The original sound paths (true accurate friend, unintended teammate, interception) are still asserted exactly.
- [Retest full census #38961632510](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961632510), exact fix source `c4cce2bf`, was **PENDING** at this documentation checkpoint. A passing green **all-shard** census is not yet established; confirm browser shard 1 and all other shards when workflow completes.
- General hosted Quick Match desktop and simulated touch [#38891468528 attempt 15](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **COMPLETED / success** after the audio feature. This generic smoke does not certify hearing sound on a physical phone, but it verifies public 224-team kickoff and match when green.
- Current game keeps its per-commit About `dev` SHA display and existing bundle version; neither module nor human-readable version was changed for this test-only correction.

**Owner handoff:** release `audio-feedback` after this checkpoint, with [new full census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961632510) pending, and do not repeat the fixture work if it passes. No old graphics/tests/saves deleted without identifying unused references.
