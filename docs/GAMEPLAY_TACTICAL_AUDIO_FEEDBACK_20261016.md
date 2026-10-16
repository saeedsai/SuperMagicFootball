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
