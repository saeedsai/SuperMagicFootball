# Candidate 0.12.80 validation — 3 November 2026

## Delivered

- Local LAN host recovery: guest leave clears the stale peer session, keeps the hosted room available, restores the visible host lobby, and requires fresh approval/new channel before play resumes.
- Wide camera now applies centered zoom margins to camera bounds and penalty framing; the 0.86 zoom remains unchanged and both goals/end stands stay visible at mobile aspect ratios.
- Career Transfer Market 320×568 acceptance verifies quote stability, accessible touch controls, exact no-op Cancel, and persisted confirmed transfer with 12 unique player IDs.

## Focused validation

- VIZ-04 mobile crop: **300 live-render samples** (20 venues × five framing scenarios × three viewports), with no clipping, horizontal overflow, page errors or simulation mutation. See [evidence/contact sheets](VIZ04_MOBILE_STADIUM_CROP_20261103.md).
- Career 320×568 browser test and existing market/quote browser checks passed; Confirm/Cancel are 45px/44px, Cancel preserves exact storage bytes, and a confirmed transfer retains 12 unique player IDs. Career Node suites: **16/16**. See [evidence/screenshots](CAREER_MARKET_320_TOUCH_20261103.md).
- Version-aligned `.80` LAN leave/rejoin Chromium/WebRTC passed. Old channels close; a second request receives fresh approval and peer/channel; guest movement replicates while the host-controlled player is unchanged; no page errors. Focused LAN suites: **434/434** ([evidence](LAN_BROWSER_LEAVE_REJOIN_20261103.md)).
- Fixture build: passed. Complete Node suite: **1,928/1,928**; club fixture passed (32 clubs, 384 player slots, 2/3/4/3). UTF-8 data validation passed (223 teams, 2,676 player slots, 84 presets). Release/version contracts: **21/21**. Super Shot live-CPU diagnostic: **180 scenarios**, zero persistent writes ([test/report](../tests/super_shot_live_balance_calibration.mjs), [JSON](SUPER_SHOT_LIVE_BALANCE_CALIBRATION_20261103.json)).
- Full four-shard portable-Chromium census: **215/215** passed with zero failures, timeouts or errors; manifest audit passed. The separately run LAN leave/rejoin test is outside the census filename-discovery contract. See the [census summary](qa_runs_012800_browser_utf8_20261103/README.md).
- `git diff --check` passed after integration.

## Remaining acceptance gates

Physical-device/touch/controller acceptance, owner visual approval, exact-head CI, hosted deployment, hosted load and real-network/two-device acceptance remain separate.
