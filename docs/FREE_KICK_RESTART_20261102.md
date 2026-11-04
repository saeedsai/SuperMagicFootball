# Direct free-kick restart — 2026-11-02

## Acceptance criteria

- Award a direct free kick only after a successful grounded slide contact from behind on a moving opposing ball carrier.
- Give possession to the fouled team at the contact location, use its configured on-field free-kick taker when available, and preserve the existing four-action controls.
- Cancel the slide, clear temporary hazards/shot state, and use a short restart lock to prevent the foul animation from immediately re-triggering an action.
- Preserve ordinary front/lateral slide-tackle outcomes and the existing corner/goal-kick restart behavior.

## Implementation

`GameEngine.startFreeKick(team,x,y)` places the configured active outfielder at the bounded contact location, or falls back to an available outfielder. It resets the ball into possession, clears temporary field hazards, sets a 0.45-second input lock, and emits `freeKickRestart` plus the standard `FREE KICK` toast. A successful slide contact on a grounded, moving carrier is a foul when the tackler is more than 12 world units behind the carrier's movement vector. Other slide contacts continue through the existing tackle path.

The rule is intentionally bounded to this unambiguous foul case. It does not introduce card rules, penalty-award logic, or additional controls; penalty-area foul handling remains future work.

## Validation

- `node --test tests/free_kick_restart.test.cjs tests/corner_restart.test.cjs tests/penalty_shootout_lifecycle.test.cjs tests/ct20_defensive_shoot_slide.test.cjs` — **19 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — modular QA fixture built successfully.
- `python -X utf8 tests/free_kick_restart_browser_qa.py` — **desktop and simulated-touch Chromium passed**; both verified the foul event, configured taker, contact position, slide cancellation, four controls, and ordinary PASS after the restart lock was released. No page errors.
- Scope test/build artifacts do not establish physical-device, hosted, or owner visual acceptance.
