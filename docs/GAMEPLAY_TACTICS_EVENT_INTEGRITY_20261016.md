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

## Exact-source regression outcome — accepted

**Gameplay source:** [`be78c92baef19231062190969454e5dee16c1736`](https://github.com/saeedsai/SuperMagicFootball/commit/be78c92baef19231062190969454e5dee16c1736).

- [Modular Game Dev QA #38913600436](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913600436): **SUCCESS**, 146/146 active Node subtests including four new `applyPlan` event checks, 20/20 merge tests, 10/10 feature-claim checks, 165 roster and JSON validation PASS, Python regression compilation PASS.
- [Full Regression Census #38913600419](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913600419): **COMPLETED SUCCESS, 192/192 scripts** — 125/125 historical/current Node scripts across four shards (32+31+31+31) and 67/67 actual Chromium scripts across four shards (17+17+16+17); zero failures, errors, timeouts or not-run scripts. The new `tactics_event_integrity_browser_qa.py` ran in 5.39 seconds in Chromium shard 3 with both desktop and simulated touch accepted.
- [Keeper Save Event Integrity #38913600270](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913600270): **SUCCESS** on the gameplay source; no goalkeeper mechanics changes.
- [Hosted PC/simulated-touch game smoke #38913600226](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913600226): **SUCCESS**, active match launched on the public Pages URL in desktop and emulated mobile touch Chromium. This smoke tests general public gameplay, **not the specific zero-count event on the deployed artifact**.
- [Pages deploy for this source #38913599737](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38913599737): was still **in progress at signoff** due to concurrent pushes. It must not be reported as a successful exact-source deploy until its conclusion is confirmed. Subsequent published descendants require an ancestry check. Physical phones, PWA offline/update/restart and Safari/Firefox remain untested.

### Release checkpoint

Acceptance for Issue #7's source regression criteria is complete. Shared `gameplay-engine` lock may be released after this QA handover; no new `tacticsChanged` listener contract, source mechanics tuning, squad changes or cleanup deletions were introduced. Next game-changing batch needs a new independent claim.
