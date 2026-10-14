# v0.8.24.8 Alpha — Changelog
Date: 2026-10-14

- Fixed repeated impact-friction loss when a ball rests on the turf; consistent ground-ball speed at 30/60/120Hz.
- Bounded 1.8-second normal-shot flight coefficient to restore credible scoring reach; passes, clearances and transformed Super Shots keep distinct behavior.
- Cleared shot flight flags on possession, heading and keeper deflections; preserved all gameplay actions and historic team identities.
- Added `tests/v08248_ordinary_shot_range.mjs`, 500 controlled fixtures, and three rolling rate checks.
- Rebuilt offline `play.html`, bumped PWA cache, save-export version and release-test assertions.
- Passed 64/64 `npm test` scripts, separate master contract, and 40/40 Chromium scripts across eight shards.
- Added five QA acceptance requirements (424 cataloged total), new calibration report, gap register, gameplay physics specification, status and roadmap updates.
- Cleaned temporary Python caches and generated browser screenshots; retained historical specifications and release evidence.

No new Super Defense/Tricks, online modes or roster corrections are enabled.
