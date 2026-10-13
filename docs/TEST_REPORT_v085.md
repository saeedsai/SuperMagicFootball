# Supermagic Football v0.8.5 — test and validation

**Date:** 2026-10-13. **Baseline:** v0.8.4, new physical contact; no intentional team or career-data migration. **Environment:** Node 22, Playwright/Chromium on Linux, desktop and simulated Android-landscape devices.

## Test results

- **15/15 Node suites passed**, `npm test`: 14 previously available gameplay/regression suites plus new `tests/player_collisions.mjs` (see `tests/RESULTS_NODE_v085.log`).
- **15 browser QA scripts passed when run in batches**: tactics, kits, v0.6 tournament navigation, manager career, save export/import, AI settings, stats UI, fitness, morale, defensive/keeper abilities, aerial/GK, teammate combos, AI combos, four-button controls and new physical collisions. Each supported desktop and emulated-mobile checks; see test scripts for assertions. The entire batch was NOT independently established as one uninterrupted successful invocation, so these are individual-script results.
- Dedicated `collisions_browser_qa.py` passed on desktop and simulated Android, and rendered screens without page errors. Touch controls still displayed precisely four actions.
- Crowded collision test disperses twelve simultaneously coincident actors to about 49.5/50 world units separation using bounded 72-sweep relaxation. In less-crowded pairs the separation is at least 50 world units immediately.

## New assertions

Symmetric physical separation; both struck actors have short positive stun; strength-dependent reaction; repeated frames do not trigger repeated impact events during cooldown; ally spacing without continuous stuns; airborne actions excluded; release ball on heavy opposing impact; zero-distance robust fallback; crowded twelve-player test; 600-frame simulation with no invalid state.

## Regression issues discovered and addressed

1. An older sprint test assumed the runner could accelerate through opposing players. The fixture now moves opponents away when isolating acceleration; collisions are independently tested with actual opponents.
2. A mobile GK dive test fired a ball so fast that an asynchronous touch could arrive after the ball crossed the goal. The fixture now provides a longer **legal reach and reaction window**; keyboard, touchscreen and existing rare saves passed.

## Known limitations

This is a 2D circle/pairwise contact system, not detailed sprite-per-limb hit detection. It does not add fouls, bookings, advantage, or goalkeeper body checks. A large clustered pile may retain a fractional world-unit overlap for one frame; dense scene performance on low-end Android is not benchmarked. Stun feedback is the existing `hurt` reaction with small particles rather than fully authored new HD animations. Physical phones/gamepads, iOS Safari, true browser-hosted reload, exact 1993 parity and online mode remain unverified.

**Conclusion:** v0.8.5 adds functional collision physics and preserved all tested existing systems, with explicit historical and device validation gaps.
