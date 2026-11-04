# Career multi-season loop acceptance — 3 November 2026

## Result: local deterministic pass

`tests/career_multi_season_loop_integrity.test.cjs` runs the current Career APIs and Career save-slot module against an in-memory storage adapter. It completes two full 14-round league seasons, checks all three authored Cup interruptions per season, persists after every result, and reloads between seasons. The first season's Cup is completed before rollover; the season archive remains unavailable until explicit rollover and is then retained as a read-only record.

The test injects one quota error during rollover persistence. The active slot remains at the completed first season, without a published archive, and a retry from that preserved season saves season 2 with exactly one archive entry. After the second season, another rollover and reload retains both archive rows in order, resets the new season's Cup state, and begins at week zero.

Focused test: **1/1 passed**. This uses deterministic synthetic 2–0 match results to exercise the existing state transitions; it does not evaluate gameplay balance, player ratings, human play, browser UI, physical devices or hosted persistence. No production code, player identities or progression rules changed.
