# Candidate 0.12.70 validation — 3 November 2026

## Change

Player Studio’s eight-direction motion gallery scrubber exposes the selected animation frame with `aria-valuetext="Frame N of 4"`. The accessible value remains synchronized when the user changes frames through the range control, keyboard input, or Previous/Next buttons. This supplements the visible frame label and lets assistive technology identify the pose position.

## Focused validation

- Motion-gallery frame-step unit suite: **3/3 passed**.
- Desktop and simulated-touch Chromium gallery checks passed.
- Integrated `.70` local Node passes **1,854/1,854** plus the club fixture; data passes (223 teams, 2,676 players, 84 presets); release/version contracts pass **21/21**.
- The preceding `.69` source passed the four-shard Chromium census **202/202** (0 failures/timeouts/errors); reports are in [the census folder](qa_runs_012690_browser_20261103/). The `.70` specific gallery browser check passed desktop and simulated touch.
- The broad census was not rerun after the `.70` accessibility-only gallery change; targeted desktop/touch coverage passed on `.70`.

## Acceptance limits

Physical screen-reader/device acceptance, hosted verification and owner visual approval remain open. No production deployment is claimed.