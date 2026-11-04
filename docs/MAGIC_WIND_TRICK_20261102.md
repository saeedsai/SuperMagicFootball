# Wind Trick Runtime Acceptance

Wind was already available as a verified Gold+ outfield trick. This increment adds direct gameplay and browser acceptance coverage; it changes no runtime files or player assignments.

## Behavior checked

- A carrier with a verified Gold-or-higher forward profile can activate Wind while holding the ball. Missing verification, lower tiers, lost possession, and an active cooldown fail closed.
- The nearest grounded rival inside 120 units is pushed 28 units away. A successful cast keeps possession, adds the established 0.045 fatigue, and starts the shared six-second trick cooldown.
- A grounded defensive SHOOT-slide or a facing, closing defender with stronger defense counters the push. Jumping rivals are excluded from Wind's target candidates, so a jump avoids the effect without selecting that rival.
- The 0.35-second Wind cue expires through the runtime update and remains visible in reduced-flash rendering.
- The game still exposes the same four action buttons.

## Validation

- `node --test tests/magic_wind_trick.test.cjs tests/studio_wind_mud_trick_policy.test.cjs` — 7/7 passed.
- `python3 scripts/build.py` — modular fixture built successfully.
- `python3 tests/browser_runner_compat.py tests/magic_wind_trick_browser_qa.py` — desktop and simulated-touch passed; both measured a 28-unit push, a visible cue (868 colored pixels versus 370 without it), and four action buttons; no JavaScript errors.
- `git diff --check -- tests/magic_wind_trick.test.cjs tests/magic_wind_trick_browser_qa.py docs/MAGIC_WIND_TRICK_20261102.md` — clean.

## Limits

These are local automated checks, including simulated touch. They do not establish human balance approval or physical-device acceptance.
