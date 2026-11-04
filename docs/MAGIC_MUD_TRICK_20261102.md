# Mud Trick Runtime Acceptance

Mud was already wired as a verified Gold+ outfield trick. This increment adds runtime and browser acceptance coverage without changing game code, player assignments, or shared planning files.

## Behavior checked

- The carrier must have verified Gold-or-higher canonical forward stats and hold the ball. Missing verification, lower tiers, lost possession, and an active cooldown fail closed.
- The nearest grounded rival inside 100 units receives a 0.52-second slow and matching cue. Its movement speed is multiplied by 0.62, with no stun, push, or possession change.
- Grounded SHOOT-slide counters the effect; airborne rivals are excluded from Mud's target candidates. An already slowed player is not selected again until the current slow ends.
- The shared six-second trick cooldown and 0.045 fatigue apply on cast. Cue and slow timers decay through the existing field-trick update.
- The readable Mud cue appears in the browser while the four-action-button layout remains intact.

## Validation

- `node --test tests/magic_mud_trick.test.cjs tests/studio_wind_mud_trick_policy.test.cjs` — 7/7 passed.
- `python3 scripts/build.py` — modular fixture built successfully.
- `python3 tests/browser_runner_compat.py tests/magic_mud_trick_browser_qa.py` — desktop and simulated-touch passed; both measured the 0.52-second slow, 0.62 speed multiplier, zero displacement, rendered cue (5,761 opaque pixels versus 5,314 without it), and four action buttons; no JavaScript errors.
- `git diff --check -- tests/magic_mud_trick.test.cjs tests/magic_mud_trick_browser_qa.py docs/MAGIC_MUD_TRICK_20261102.md` — clean.

## Limits

These automated runs use a simulated touch context. Physical-device acceptance and human balance review remain separate gates.
