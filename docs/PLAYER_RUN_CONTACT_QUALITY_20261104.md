# In-game running animation quality — 4 November 2026

## Scope

Improve the existing match player's running presentation without changing player identities, art assets, locomotion physics, input, hitboxes, stamina or saved data. The Home/menu character is untouched.

The procedural fallback now paints an alternating stance/swing gait. During stance, the support boot travels beneath the body and gets a soft contact shadow; the other leg recovers with bounded knee and toe flex. Stride length follows movement speed, while a small torso counter-swing gives the upper body a weight response. The phase path is render-only and continuous at toe-off and touchdown. Player-specific pace now drives the body oscillator and foot phases together, avoiding arm/foot cadence drift. Existing jump, tackle, knockdown, special-action and stationary paths retain their own poses.

## Validation

- `tests/run_gait_contact.test.cjs`: **5/5** — alternating support legs, continuous phase joins, stationary stability, bounded output, identical samples at 30/60/120 Hz, and matched personalized body/foot cadence.
- Focused player art and grounded shot-recovery regressions: **9/9** in `tests/player_art_rework.test.cjs` and `tests/shot_impact_recovery_legs.test.cjs`; combined focused run **14/14**.
- `tests/run_gait_contact_browser_qa.py`: actual production `renderer.drawPlayer()` capture, **288 samples (12 phases × 8 headings × three movement speeds: 140, 260 and 330 world units/second)**. Each heading/speed pair has 12 unique frames, at least 380 painted pixels per cell and at least 700 changed pixels in each adjacent phase. Player and ball state snapshots are identical before and after; no page errors.
- Build fixture created with `python -X utf8 scripts/build.py` before browser capture.
- `npm run test:node`: **1,948/1,948** passed, including release/cache contracts and the 32-club/384-player fixture.

## Visual evidence

- [Eight-heading, three-speed, twelve-phase contact sheet](PLAYER_RUN_CONTACT_GALLERY_20261104.png)
- Per-heading 260-speed animated previews: [front](PLAYER_RUN_CYCLE_20261104/front_run.gif), [front-right](PLAYER_RUN_CYCLE_20261104/front_right_run.gif), [right](PLAYER_RUN_CYCLE_20261104/right_run.gif), [back-right](PLAYER_RUN_CYCLE_20261104/back_right_run.gif), [back](PLAYER_RUN_CYCLE_20261104/back_run.gif), [back-left](PLAYER_RUN_CYCLE_20261104/back_left_run.gif), [left](PLAYER_RUN_CYCLE_20261104/left_run.gif), [front-left](PLAYER_RUN_CYCLE_20261104/front_left_run.gif).

These captures show the procedural renderer only. The source-specific three-module AssetStudio running art remains unapproved and is not loaded as replacement production artwork. Owner visual acceptance, physical-device appearance/performance, exact-head CI and hosted deployment remain open.
