# Candidate 0.12.79 validation — 3 November 2026

## Delivered

- Keeper dive animation now extends both gloves from ready stance to full reach over the existing 0.60-second dive timer. Catch timing, collision, physics and keeper state are unchanged.
- The existing one-second Dribble hold for equipped Magic Tricks is exercised through production keyboard, touch and gamepad input paths. Release rearms the move; possession, cooldown and the four-action scheme are preserved.

## Validation

- Fixture build: `python -X utf8 scripts/build.py` — passed.
- Focused Node: keeper arm/reach and dive silhouette plus Magic Trick all-input tests — **6/6 passed**.
- Deterministic live-defense Super Shot calibration passed **180 scenarios**: five CPU difficulties × three frame rates × two attack directions × ordinary/trial Silver Carp × three seeds. Mirrored outcomes match; match/source rosters stay unchanged and there are zero persistent storage writes. Frame-rate outcome counts are recorded as diagnostics rather than forced into exact parity. These 2.5-second scripted runs produced no goals, so the matrix is not a whole-match balance verdict ([test](../tests/super_shot_live_balance_calibration.mjs), [report](SUPER_SHOT_LIVE_BALANCE_CALIBRATION_20261103.json)).
- Complete Node suite: **1,928/1,928 passed**; club fixture passed (32 clubs, 384 player slots, 2/3/4/3).
- UTF-8 data validation: passed, **223 teams, 2,676 player slots, 84 avatar presets, zero errors**.
- Release/version contracts: **21/21 passed**.
- Actual game-renderer Chromium gallery: desktop (1040×390) and simulated touch (844×390), 12 samples per profile; both dive lanes have five distinct animated phases, no clipping or page errors, and keeper/ball state is unchanged ([evidence](KEEPER_DIVE_GLOVE_REACH_20261103.md)).
- Full four-shard portable-Chromium census: **213/213 passed**, zero failures/timeouts/errors; all four shard manifests pass the regression-shard audit ([reports](qa_runs_012790_browser_utf8_20261103/README.md)). The included Player Studio 320×568 check verifies 17 named, 44px+ selectors within their fieldsets, no page overflow, and no browser errors ([evidence](PLAYER_STUDIO_320X568_TOUCH_20261103.md)).
- `git diff --check`: passed (only existing mixed-line-ending warnings).

## Remaining acceptance gates

Physical-device controller/touch checks, owner visual approval, exact-head CI, hosted deployment, and real-network/two-device online acceptance were not performed by these local checks.
