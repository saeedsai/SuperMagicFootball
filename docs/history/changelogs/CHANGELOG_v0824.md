# Supermagic Football — v0.8.24 Alpha — Changelog

- Fixed per-frame 14% auto rare goalkeeper Super Save probability (formerly repeated while a transformed ball remained nearby). Eligible approaching transformed shots now receive **one** roll after entering rare skill reach; cooldowns and normal saves unchanged.
- Excluded balls moving away, misses beyond the goal-mouth envelope, and already evaluated shots from automatic rare-save consideration.
- Added goalkeeper recovery landing contact ripple (render-only).
- Added `tests/v0824_keeper_fairness.mjs`, `tests/v0824_keeper_browser_qa.py` and `docs/KEEPER_FAIRNESS_MATRIX_v0824.json` with 3,450 synthetic mirrored fixed-lane shot trials and bounded seeded simulation benchmark.
- Added six acceptance requirements, new active spec, gap register, test report and roadmap updates; versioned standalone HTML and PWA cache.
- Passed **58/58 Node** and **38/38 Chromium browser** scripts in six shards. 389 requirement catalog items, not independently executed 389 cases.
- Open: physical mobile/audio/gamepad and Safari/Firefox, browser-origin persistence, realistic moving-GK difficulty statistics and device performance.
- All existing four buttons, six formations, seven BPW squads, music/crowd, saves and aerial attack rules preserved.
