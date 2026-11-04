# Shot stun, downed animation, and volume accessibility — 3 November 2026

## Changes

- Clamp shot stun at zero as it expires. A focused real-engine test confirms strong ordinary shots produce bounded stun, a second shot cannot refresh confusion/stun while the player is incapacitated, and control returns when the timer completes.
- Add a subtle torso breathing motion to the existing shot-down pose. It is derived only from the existing knockdown timer/state and is reduced in reduced-flash mode; it does not alter simulation, recovery timing, save data, or controls.
- Mirror the host-authoritative stun timer into the LAN guest confusion cue and clear it on recovery/legacy pose snapshots, without adding a wire field or protocol revision.
- Give each Settings sound range an explicit percentage-valued accessible value and keep it synchronized with keyboard/input changes and the visible percentage.

## Validation

- Full local Node suite: **1,803/1,803**, plus the club fixture; `npm run test:node`.
- Data validation: **223 teams, 2,676 players, 84 avatar presets; zero errors**.
- Focused impact, stun-reaction, recovery-breathing and volume-accessibility Node tests: **70/70** across the combined LAN, animation, accessibility, Cup and version-contract subset.
- Chromium browser runner: downed breathing checked in normal and reduced-flash states (3,154 and 2,344 changed pixels respectively), simulation state unchanged, no page errors; settings slider checks ran on desktop and simulated touch and verified keyboard changes update both visible and accessible percentage values. Both browser scripts completed successfully.
- Scoped `git diff --check` passed for the changed source and tests.

## Limits

These are local code and browser checks. Candidate .61 integrated local Chromium census passes 200/200 scripts with zero failures/timeouts/errors ([reports](qa_runs_012610_final_20261103/README.md)). Exact-head CI, hosted deployment, physical-device/screen-reader hardware review, and owner visual acceptance remain separate. A parallel AssetStudio bald-scalp cleanup trial was rejected: it added a hair tuft/extra layer and slightly worsened full-size source fit. Its isolated files and report are preserved under `references/analysis/player_master_pilot/animation_three_module_pilot/run00_three_module/iterations/run00_source_local_scalp_v01/`; no master/source art was changed.
