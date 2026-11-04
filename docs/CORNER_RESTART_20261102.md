# Corner and goal-kick restarts — 2026-11-02

## Behavior

When a non-goal ball crosses an end line, the game now awards a corner if the defending side touched it last. The configured corner taker is used when on the pitch; if that player is unavailable or benched, an available on-field outfielder takes it. Restart position and attacking direction mirror correctly across both ends and both corners. The team is given ball possession and the ordinary four controls restart play.

If the attacking side touched the ball last, the defending goalkeeper receives a goal kick. Goals still score normally, and active ricochet shots retain their authored wall bounces before end-line restart handling. Ball last-touch team is tracked through possession, kicks, headers, aerial kicks, goalkeeper deflections, and ball lifts.

## Files

- `src/modules/engine.js`
- `tests/corner_restart.test.cjs`
- `tests/corner_restart_browser_qa.py`

## Validation

- `node --test tests/corner_restart.test.cjs tests/penalty_shootout_lifecycle.test.cjs` — **11 passed, 0 failed**.
- `python -X utf8 scripts/build.py` — modular browser fixture built successfully.
- `python -X utf8 tests/corner_restart_browser_qa.py` — **desktop and simulated-touch Chromium passed**, including mirrored corner cases, configured taker possession and Pass restart, goal kick, goal preservation and ricochet preservation.
- `node tests/v0819_goalkeeper.mjs` — **PASS**.
- `node tests/active_pursuit_ground_shots.mjs` — **PASS**.
- `git diff --check` — clean.

Direct free kicks remain unimplemented because the match currently has no foul/restart trigger. Sideline out-of-play remains the existing boundary-bounce behavior. Physical-device and hosted acceptance were not run. The current Team Command Center text still says both corner and free-kick restarts are unavailable; integration should update that copy to describe the newly playable corner restart.
