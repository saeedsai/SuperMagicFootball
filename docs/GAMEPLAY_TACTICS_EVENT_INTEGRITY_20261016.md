# Gameplay tactical-event correctness — Issue #7

**Date:** 16 October 2026
**Feature/lock:** `GAMEPLAY-TACTICS-EVENT-INTEGRITY-ISSUE7` / `gameplay-engine`
**Owner:** `gameplay-review-20261016-gpt6-event-integrity`

## Bug and scoped correction

`GameEngine.applyPlan` emitted a `substitution` event even for valid style-only or formation-only tactical changes with no actual player replacement. New pause/half-time quick tactics exercised this branch and could send misleading `count:0` events to diagnostic and integration listeners. Quota and saved state had not been consumed or altered; the problem was the event contract.

Now only **real positive substitutions** emit a substitution event. The existing payload (`team`, `count`, `used`, `max`) is unchanged. Style/formation changes continue applying to game AI and existing tactical toast, without a new event type or adding a consumer contract. This minimizes risk to previously subscribed listeners.

## Tests and compatibility

- New `tests/tactics_event_integrity.test.cjs` directly executes the real extracted `GameEngine.applyPlan` in Node: attack/defence-only changes, formation-only changes, no-op, real bench substitution, continued quota/count and paused-only validation.
- New `tests/tactics_event_integrity_browser_qa.py` boots the actual modular playable fixture in desktop and simulated-touch Chromium, calls live quick ATTACK/PROTECT LEAD presets, ensures no phantom substitution or saved-team mutation, makes a true outfield reserve change through the real game engine, verifies exactly one event, then resumes play.
- The standard auto-discovery full regression runner includes both files, without editing common QA infrastructure or CI workflows. Triggered by the owned `src/modules/engine.js` source change.
- Protected: four controls, six formations, team/player identities, goalkeeper/shot calculations, local storage and historical rosters.

**Exact-commit QA:** report GitHub Actions preflight, full four Node + four Chromium shards, hosted PC/touch smoke and Pages deployment after push. Do not assume success before checking actual results.

## Remaining five bounded iterations

1. Add pressure-aware first-touch cushioning to real teammate receptions with short bounded effect and deterministic shot/pass parity.
2. Evaluate organic human/CPU keeper save/goal fairness versus Super Shots before tuning any goalkeeper radius/reach.
3. Complete direction-correct goalkeeper ball grip and release artwork under the graphics claim.
4. Improve career/halftime coaching and substitution advice under the UI claim.
5. Triage original penalty human-keeper participation and classic mode parity; leave remote multiplayer and full physical mobile/PWA certification deferred.

Do not delete versioned QA reports, graphics provenance, archived test fixtures or templates without dependency inspection and a green complete census. No cleanup deletions in this isolated engine patch.
