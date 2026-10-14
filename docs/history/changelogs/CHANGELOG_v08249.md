# Supermagic Football — v0.8.24.9 Alpha — Changelog

**Date:** 14 October 2026. **Baseline:** v0.8.24.8 Alpha.

- Fixed **zero-human AI-vs-AI control ownership**: the home side's designated player is no longer flagged as user-controlled when there are no human players. Corrected the related control auto-switch and penalty shooter paths.
- Added `v08249_zero_human_control.mjs` automated 0/1/2-human ownership regression.
- Added `v08249_single_player_calibration.mjs` and JSON evidence for 120 seeded player-initiated shots against moving CPU keepers and defenders across five difficulty presets and three team pairings.
- No change to keeper save radius, shot power, or gameplay combos, as the calibration is not statistically conclusive.
- Updated release metadata, PWA cache identity, 45 test release expectations and Node/browser regression suites.
- Updated active roadmap, gap register, QA catalog and documentation. Historical specs and user-approved deferred ability backlog preserved.

**Regression:** `npm test` 66/66; master contract 1/1; Chromium 40/40 across eight sequential completed shards (one initial shard 2 execution interrupted, completed rerun passed). QA catalog 430 documented requirements, not 430 executed tests. See `docs/TEST_REPORT_v08249.md`.
