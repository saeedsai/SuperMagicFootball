# Candidate 0.12.69 validation — 3 November 2026

## Changes

- Wind and Mud one-second trick windups now have difficulty-timed CPU jump counters that use the nearest eligible field defender and preserve authored range, existing human counters, and Mud slow eligibility.
- Spin Bumper CPU keepers no longer jump-counter a pulse that explicitly excludes keepers; stale reaction state is cleared, and eligible field defenders still counter.
- LAN consumes the sequence number for a valid input that arrives after its target host frame while dropping the stale controls. The next ordered packet recovers instead of becoming a permanent sequence gap; forged sequence jumps remain fail-closed.
- Career season rollover stages a detached next season, persists the active slot, and only then publishes the new state. Failed slot persistence leaves the finished-season state reviewable and retryable.
- Fullscreen help now connects its dynamic browser guidance to the named dialog. Chromium CDP accessibility-tree inspection confirms both name and description; focused fullscreen accessibility/focus tests pass **3/3**.
- Existing local two-tab LAN recovery and desktop/simulated-touch Career season-review UI flows remain covered.

## Focused validation

- Wind/Mud trick counter suites: **34/34 passed**.
- Spin Bumper defense: **8/8 passed**.
- LAN protocol/channel/two-peer suites: **45/45 passed**; peer-connection suite: **47/47 passed**.
- Career rollover/archive/review/slot: **29/29 passed**; review UI plus rollover atomicity: **5/5 passed**.
- Fullscreen help accessibility/focus: **3/3 passed**, including Chromium CDP accessibility-tree name/description inspection.
- Career season-review Chromium: desktop and simulated-touch passed; review is read-only, Back cancels, explicit rollover writes the active slot and mirror once, malformed seasons fail closed.
- UX26 Settings route-focus matrix covers Save Management on desktop/simulated-touch, including entry focus and Escape return focus; browser checks passed.
- Four-shard portable Chromium census: **202/202 passed**, 0 failures, 0 timeouts, 0 errors; all four reports are in [the census folder](qa_runs_012690_browser_20261103/).
- Integrated local Node passes **1,854/1,854** plus the club fixture; data passes (223 teams, 2,676 players, 84 presets); release/version contracts pass **21/21**.

## Acceptance limits

The LAN delayed-input scenario models delivery delay on reliable ordered local channels, not physical packet loss/SCTP. Hosted signaling/deployment, physical devices/network, and owner visual approval remain open. No production deployment or device acceptance is claimed.