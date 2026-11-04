# Candidate 0.12.81.12 — browser regression census, 4 November 2026

## Result

**227/227 browser scripts passed** in four disjoint local Windows/Playwright Chromium shards: **57, 57, 57 and 56**. The independent shard audit passed exact coverage with no duplicates, failures, timeouts, errors, or unrun scripts.

Two initial failures exposed stale assertions after the live match roster switched from FIT wording to Energy and the formation OVR tooltip gained Energy context. The tests were updated to the current interface and independently rerun through the portable Chromium wrapper. Desktop and simulated touch both passed. Each initial attempt and successful retry is retained in shard 1 and shard 3 JSON/Markdown reports.

After the shard census, the focused shot-reaction capture was expanded to sample the launch pose from all eight match headings. The direct Chromium rerun passed nine distinct reaction phases, all eight heading/view-side pairs, unchanged player/ball state and zero page errors. QA coverage changed; game code did not. Details are in shard 3's `post_census_followup` record and the [leg-flail visual report](../../SHOT_IMPACT_LEG_FLAIL_QUALITY_20261104.md).

## Reports

- `browser_shard_1_of_4.json` / `.md` — 57/57, including Energy assertion retry.
- `browser_shard_2_of_4.json` / `.md` — 57/57.
- `browser_shard_3_of_4.json` / `.md` — 57/57, including OVR tooltip assertion retry.
- `browser_shard_4_of_4.json` / `.md` — 56/56.
- `audit.json` — independent exact-coverage audit, PASS.

This records a local working-tree census, not immutable exact-commit CI, hosted deployment, physical-device/screen-reader acceptance, or owner visual approval.
