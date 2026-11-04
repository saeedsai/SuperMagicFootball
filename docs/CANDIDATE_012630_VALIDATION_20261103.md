# Candidate 0.12.63 local integration — 3 November 2026

## Changes

- Shot-impact recovery holds the downed pose until its existing knockdown timer expires, then eases through a short arm-braced get-up using the existing recovery action.
- Keeper roll release uses a neutral start and a four-plus-phase visual follow-through matched to the existing 0.42-second roll duration.
- Reduced-motion weather stops visual movement/flashing while preserving static warning cues and game event timing.
- Career fitness reports reject malformed rows before state mutation in both modular and standalone APIs.
- Career transfer keeps a valid jersey number or selects an unused fallback if malformed legacy data cannot provide one.

## Validation

- Full local Node suite: **1,814/1,814 passed**, followed by the club fixture.
- Data validation: **223 teams, 2,676 players, 84 avatar presets; zero errors**.
- Versioning policy contract: **16/16 passed**.
- Career suite: **179/179 passed**; the 83-club Career scenario passed through training, transfer, Cup, league and season rollover.
- Focused Chromium galleries passed: shot impact has nine distinct phases with unchanged simulation state; keeper roll has 5/4 nonblank player-pixel phases across both directions; reduced-motion weather passes 10 scenarios with steady, visible cues and unchanged event/FPS contracts.
- Scoped `git diff --check` is clean for the integrated files.

A complete four-shard browser census was not rerun for `.63`. The preceding `.62` census attempt was blocked by unrelated page-load timeouts; focused `.63` browser checks use a commit-stage fixture load followed by an explicit game-ready wait.

Focused evidence: [shot recovery](SHOT_RECOVERY_AND_CAREER_INTEGRITY_20261103.md), [keeper roll release](KEEPER_ROLL_RELEASE_POSE_20261103.md), [reduced-motion weather](WEATHER_REDUCED_MOTION_20261103.md), and [Career transfer jersey fallback](CAREER_TRANSFER_JERSEY_FALLBACK_20261103.md).

## Release limits

The previous `.62` four-shard Chromium census remains unaccepted because local app navigation repeatedly timed out during page setup ([attempt report](qa_runs_012620_final_20261103/README.md)). Do not infer exact-head CI, hosted deployment, physical-device, screen-reader hardware, or owner visual acceptance from local checks.
