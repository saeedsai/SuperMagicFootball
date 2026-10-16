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
