# Live local penalty goalkeeper control — gameplay implementation and QA

**Date:** 16 October 2026  
**Feature:** `GAMEPLAY-PK-HUMAN-GOALKEEPER`  
**Owner / lock:** `gameplay-review-20261016-gpt6-pkkeeper-r3` / `gameplay-engine`  
**Issue:** [#5 — human goalkeeper control during penalty shootouts](https://github.com/saeedsai/SuperMagicFootball/issues/5)

## Problem and delivered mechanic

The previous modular `GameEngine.updatePK` set `keeper=null` for all modes, so the existing defending `input.just(team,'jump')` and goalkeeper steering branches were unreachable. A two-human shooter could aim, but the opposing human could not physically defend. The goalkeeper's destination was always CPU-selected, making local penalty Versus one-sided.

**New behavior:** when both teams are human-controlled (`humans>=2`), whichever side is defending owns its goalkeeper. Their existing movement input raises/lowers keeper `pk.saveY`, and the existing `jump` action activates a short, cooldown-limited dive that increases lateral mobility both before and during a live shot. The defending side automatically alternates each kick. Shooter direction/shoot input remains separately owned. During two-player penalties the code **never replaces the human keeper's position with an AI prediction at shot release**; the existing saved/goal criterion is unchanged.

When `humans=1`, no goalkeeper input is accepted from a phantom second player. The previous CPU keeper's preflight committed guess, skill-based prediction error and shot-time fairness behavior are retained exactly. The ordinary live-match keeper and shot/rebound physics were not changed.

**Inputs:** P1 uses the normal W/S or on-screen joystick and Jump (default Space), P2 uses Arrow Up/Down and Jump (default Right Control), with existing gamepad/key remapping. On touch devices only the existing P1 touchscreen surface exists; P2 requires an external keyboard or controller, not a new second touchscreen joystick.

## Owned code and compatibility

- `src/modules/engine.js`: replace the always-null PK defender input with a guarded side-specific human source; skip only the CPU keeper guess for the human, preserve the historical CPU route otherwise. Clamp the defender steering input to [-1,1], retaining goal-post limits, existing `pk.diveCooldown` and jump edge detection.
- `tests/penalty_keeper_control.test.cjs`: eight deterministic Node tests execute **current real extracted modular engine methods** for both side ownership, no shooter interference, single dive/cooldown, movement during shot, no teleport at release, marginal goal-versus-save, CPU keeper parity, six-pair sudden death/regulation scoreboard invariants and invalid input bounds.
- `tests/penalty_keeper_control_browser_qa.py`: independent browser acceptance enters real Versus match and penalty mode in desktop and simulated-touch Chromium; P2 keyboard movement/jump, P1 keyboard/virtual joystick, shot commitment, alternating sides, identity/saves/four-button integrity.
- This specialist checkpoint, short milestone addendum and **only this chat's** agent-memory update. No edits to UI, Input, renderer, graphic assets, data, release workflows or shared QA runner.

## Acceptance matrix

| Acceptance | Evidence |
|---|---|
| Two-human keeper moves for either defending side | Focused Node PASS |
| Jump event / cooldown / live shot tracking | Focused Node PASS |
| Human positioning determines goal or save | Focused Node PASS |
| Keeper not overwritten at shot release | Focused Node PASS |
| One-player automatic keeper unchanged | Focused Node PASS |
| Existing after-draw score and sudden-death pair | Focused Node PASS |
| Original four controls/squad IDs/save untouched | Source boundary + planned browser assertions |
| Chromium desktop/simulated-touch actual keyboard/joystick | Script committed; exact-source browser run needed |
| Full 4 Node + 4 Chromium regression | Blocked by independent memory-validation failure |
| GitHub Pages hosted live PC/touch verification | Deploy may succeed; dedicated new-mechanic hosted smoke still needed |
| Physical Android/iOS/local dual touchscreen | Not certified |

## Test commands and GitHub evidence

```sh
python3 scripts/build.py
node --test tests/penalty_keeper_control.test.cjs
node --test tests/*.test.cjs
python3 tests/penalty_keeper_control_browser_qa.py
python3 tests/full_regression_runner.py --category node --shard-index 0 --shard-count 4
python3 tests/full_regression_runner.py --category browser --shard-index 0 --shard-count 4
```

- [Gameplay code `d0adf651`](https://github.com/saeedsai/SuperMagicFootball/commit/d0adf651e7af4b5f2fdff7b9d61d148e4098edb6).
- [Node tests `0a20dba1`](https://github.com/saeedsai/SuperMagicFootball/commit/0a20dba1415f0a3012bf229dbce0cb75240f0450), marginal save lane corrected in [`c61631b8`](https://github.com/saeedsai/SuperMagicFootball/commit/c61631b81920c100eba773eddc7ff3889bcb6f0a).
- [Browser test `0e9cfeff`](https://github.com/saeedsai/SuperMagicFootball/commit/0e9cfeff9eee4344bd5c7169d09ea081003b9edb).
- [Modular QA #38945791129](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38945791129) on `0e9cfeff`: **193/194 Node subtests passed**, including all new eight live-keeper cases; only `project_memory_contract.test.cjs` failed because a *different* chat's newly indexed `gameplay-pk-20261016` memory file lacked its exact agent identity token. The earlier `game-developer-6` identity failure was already resolved. Do not read/edit someone else's memory or weaken the contract.
- [Issue #8](https://github.com/saeedsai/SuperMagicFootball/issues/8) follows the separately owned CI identity blocker. Full census fails preflight before browser shards, so **no false browser PASS** should be reported.

## Next five small deliveries

1. Have the owning `gameplay-pk-20261016` chat or project-context maintainer repair its own memory identity; then secure exact-source green CI and full 4+4 census.
2. Run and review the dedicated real desktop/simulated-touch keeper-versus-browser acceptance and publicly hosted PC/touch Quick Match; resolve any relevant defects within a fresh claim.
3. Evaluate balanced player-vs-player penalty keeper movement at 30/60/120 fps and both shot lanes; only tune with reproducible evidence.
4. Implement pressure-aware first-touch reception in one separately claimed engine slice, preserve GK exclusions and fair kick outcomes.
5. Continue directional glove/release and first-touch/pass animations under graphics owner, then improve coaching, career and classic-mode parity. Physical iOS/Android touch, full PWA offline upgrade and network multiplayer remain separately scoped.

**File cleanup:** no archived historical QA or art assets deleted without a dependency audit. No generated screenshots/fixtures committed. Reuse the repository's existing game input and browser fixtures rather than adding templates.