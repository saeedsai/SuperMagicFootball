# Goalkeeper save-event integrity — 16 October 2026

## Bug and bounded fix

The match engine previously emitted `save` after **every** loose-ball keeper collection, regardless of whether that ball was an opposing shot. Following a diving deflection, `tryKeeperDive` correctly recorded a save, converted the ball into the goalkeeper team's loose rebound (`attacker=keeper.t`, `ordinaryShot=false`), and could later `keeperCollect` it. The loose catch then emitted **another** `save`, inflating apparent intervention rates; opponent loose passes could also be misclassified.

`src/modules/engine.js` now snapshots `liveOpposingShot` **before** `keeperCollect` clears the ball flags. It emits a loose-catch `save` only for an opposing ordinary, transformed, or strike shot, and only after successful collection. `keeperCatch` still emits for all actual collections, including rebounds and loose balls. Diving contacts/save events, possession, ball flight, Super Shot energy, goalkeeper AI, controls, score and contact geometry remain untouched.

## Acceptance and compatibility

Run `python3 scripts/build.py && node --test tests/keeper_save_event_integrity.test.cjs && python3 tests/keeper_save_event_integrity_browser_qa.py`. The browser test drives actual modular `g.updateBall` at 30/60/120 Hz on mirrored goals and desktop/simulated touch. Every fixture requires true goalkeeper possession and one `keeperCatch`. It expects exactly one `save` for a live opponent shot, **zero extra** `save` for an already-deflected team-owned rebound, and zero for an opponent loose non-shot. It holds `diveCooldown` during collection to isolate the event semantics from separate diving contact.

The full CI regression census includes the new script and is triggered by all edited runtime/test files. **Final exact-commit results must be added after the workflow completes**; prior calibration coverage was 149/149 scripts on [38883629200](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38883629200). An actual match save now means a physical shot interception rather than every keeper recovery; historical match-event totals may differ while real goals/physics remain unchanged.

## Unfinished requirements and next five checkpoints

1. Validate real seed-matched match save/goal balances, ensure the other agent's bounded physical keeper lunge meets angle/pressure fairness, avoid expanding contact depth.
2. Eight-direction goalkeeper glove-grip and safe distribution visuals.
3. First-touch and pass-follow-through directional animation.
4. Source-aware parallel roster/graphics editor provenance.
5. Career/tactics substitution guidance without save migration.

Do not delete historical logs, graphics work products or roster data owned by other agents. Physical-device certification, offline PWA and multiplayer are deferred.

## Exact-source CI isolation while concurrent art integration runs

The first integrated source/data QA for this checkpoint stopped at **three unrelated concept-character art contract assertions** (raster reference / offline fixture expectations), and did not run the sharded browser census. A narrow [Keeper Save Event Integrity workflow](../.github/workflows/keeper-save-integrity.yml) therefore now runs real `scripts/build.py`, the new Node event contract and its headless desktop/touch browser acceptance without requiring unrelated art-matrix tests to complete first. The full regression gate is **still required**; this focused workflow does not replace it. Concurrent graphics/roster agent edits are not modified.


## Independent keeper correction verification (16 October 2026)

- Source fix: [`f62d688`](https://github.com/saeedsai/SuperMagicFootball/commit/f62d68871a6ce3c36f67dc68990d1a16bd19e712), carried forward into subsequent non-keeper `dev` commits.
- New dedicated CI workflow: [`173d76f`](https://github.com/saeedsai/SuperMagicFootball/commit/173d76f71a797e22ec17b87ead2bf19445aa46fa); its [exact-head run #38885906247](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885906247) **PASSED**: game fixture build, 1/1 keeper save-event Node contract, desktop **18/18** and simulated-touch **18/18** in-engine cases (36/36 browser checks across 30/60/120 FPS). No physical device was used.
- The graphics agent subsequently fixed the initial unrelated preflight failures; [integrated Modular QA #38886071884](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38886071884) **PASSED**, with **73/73 active Node** and **17/17 merge** cases.
- [Integrated Full Regression Census #38886072121](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38886072121), on descendant `55c4a21a`, had **101/101 historical Node scripts PASS** across four shards at last check. Four Chromium shards were **in progress**; do not infer complete 150+ script green status until their actual results are inspected. Any new commit can change exact-commit results.
- The gameplay-fix commit's [hosted PC/touch smoke #38885745096](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38885745096) passed, with successful Quick Match kickoff on both simulated devices. Subsequent Pages deployments should be verified with their own branch head; physical-phone certification remains deferred.

**Remaining limitation:** this corrects event labels, not necessarily the statistical goalkeeper save rate. The separate physical-lunge changes were authored by another developer. Avoid altering those changes or claiming their performance until the full regressions and seed-cohort evaluations pass.
