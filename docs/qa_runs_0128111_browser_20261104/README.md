# Candidate 0.12.81.11 — browser regression census, 4 November 2026

## Result

**227/227 browser scripts passed** on the local Windows/Playwright Chromium environment. Four disjoint shards executed 57, 57, 57 and 56 scripts. The independent shard audit confirms exact coverage, no duplicate assignments, failures, timeouts, errors or unrun scripts.

One legacy `graphics_integration_v082522.py` exceeded the 70-second limit while all four shards were launching browsers concurrently. Its isolated portable-Chromium retry passed **19/19** desktop and simulated-touch checks, including game boot/version, the 12,096-case art sweep, Player Studio route, 17 selector families, eight distinct previews, editing/save, no uncaught errors and the contact sheet. The retry timestamp and details are included in shard 4's report; audit was run after the retry was recorded.

## Reports

- `browser_shard_1_of_4.json` / `.md`
- `browser_shard_2_of_4.json` / `.md`
- `browser_shard_3_of_4.json` / `.md`
- `browser_shard_4_of_4.json` / `.md`
- `audit.json` — independent exact-coverage audit.

This is local browser evidence for the uncommitted candidate. It does not establish exact-head CI, hosted deployment, physical-device/screen-reader acceptance, owner visual approval, or real-network service readiness.
