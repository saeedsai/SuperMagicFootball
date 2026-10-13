# Supermagic Football v0.8.4 — test and validation report

**Date:** 2026-10-13. **Baseline:** v0.8.3 preserved, with input modifications and new versioned build. **Environment:** Node.js v22, Chromium headless/Playwright desktop and simulated Android landscape.

## Verification and regressions

- **14/14 Node suites** (13 original + `four_button_controls.mjs`): gameplay/simulation, original twelve Japan special shots, 216 teams and rosters, continent campaigns, career, AI difficulty, stamina, morale, kit selection, substitutions, super defenses, aerial moves, teammate combos and four-button actions.
- **14/14 browser scripts**, including all 13 existing desktop/mobile QA scripts plus `four_button_browser_qa.py`, pass. The initial combined 13-suite run passed. The final 14-suite combined command reached the environment timeout after seven clean suites; the seven remaining scripts were each run separately after packaging and passed on desktop/simulated mobile. No skipped test is counted as passed solely because a command timed out. See `tests/RESULTS_BROWSER_v084.log` and `tests/RESULTS_NODE_v084.log`.
- Explicit: real Android and iPhone, physical controllers, network multiplayer, reload/installed PWA, and performance on low-end devices **not verified**.

## New dedicated assertions

1. Four visible mobile action buttons arranged in diamond/cross (real Chromium multi-touch dispatch).
2. Contextual dribble/switch, tap-vs-hold passing, Jump+Pass crossing, and second-jump + Shoot transformation.
3. No toast event on super-shot activation, while existing animated projectile effects continue.
4. High-accuracy keeper-aware open-corner aim, with broader randomized targeting for low accuracy.
5. Auto-switch picks much nearer teammate after ~0.48s; cancels during steering, sprinting and own possession.
6. Existing human/CPU aerial combos, GK saves, hyperdash, header, morale, fitness, and save export remain functional.

## Issues found and fixed

- Legacy AI shot test assumed better shooting always aims toward goal center. Updated it to check error relative to the player's intended goalkeeper-uncovered corner.
- Player auto-switch initially interrupted keyboard hyperdash tests; fixed with steering/sprint lock and brief hysteresis.
- Four-button Jump+Shoot initially entered a tackle in a valid heading scenario; fixed by checking flip kicks and headers before defense.
- Keeper super needed priority over field defense when the ball threatened the GK; corrected and retested on desktop/mobile.
- Adapted historical touch regression tests to the four visible buttons without reintroducing Super/Run/Swap controls.

## Known incomplete acceptance criteria

- Full pairwise player-player contact and symmetric pushback/stun not yet implemented.
- 10 distinct dribble types, double Dribble tricks, Jump+Dribble bicycle, defending double-jump bicycle are missing.
- Jump-hold run still starts with a jump, unlike desired press/hold separation; some header animations remain approximations.
- Defensive non-super Jump+Shoot is a tackle fallback, not a distinct flying-kick animation.
- Full user-remappable keyboard/gamepad maps and complete GK contextual inputs are not yet implemented.
- Shooting corners do not yet predict the goalkeeper's dive trajectory or perform advanced sight-line collision checks.
