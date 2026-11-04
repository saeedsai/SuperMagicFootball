# Candidate 0.12.68 validation — 3 November 2026

## Changes

- Wind and Mud one-second trick windups now allow difficulty-timed CPU defenders to jump-counter the nearest eligible dribbler within the authored trick range. Existing human counters, active counter windows, direction/range checks and Mud's already-slowed target handling remain intact.
- Career season rollover now stages the next season on a detached state, writes the active slot, then publishes. A failed quota/storage write retains the completed-season review state so the user can retry instead of seeing an in-memory season that was never saved.
- The Career season-review UI harness now supplies the Career slot, storage and alert APIs used by the flow; it asserts successful rollover emits no error alert. Actual desktop and simulated-touch Chromium coverage confirms the review is read-only, Back cancels, explicit rollover persists once to the active slot and mirror, and malformed seasons fail closed.
- A two-tab local Chromium LAN recovery pass covered discovery, host approval, state/input replication, synthetic ICE disconnect/recovery and broker shutdown while the match remained playable. This is not physical network packet-loss, SCTP or two-device acceptance.

## Validation

- Full local Node: **1,850/1,850 passed**; club fixture passed.
- Focused Wind/Mud AI counter and adjacent trick/defense suites: **34/34 passed**.
- Career rollover/archive/review/slot suites: **29/29 passed**; UI review plus rollover atomicity: **5/5 passed**. The new persistence regression reproduced the unsaved in-memory advance before the fix.
- LAN focused suites: **39/39 passed**; two-tab Chromium scenario passed with the limitations above.
- Data validation: **223 teams, 2,676 players and 84 avatar presets; 0 errors**. Release/version contracts: **21/21 passed** after correcting the malformed line separator caught on the first run.

## Acceptance limits

Broad browser census, hosted signaling/deployment, physical devices, physical LAN loss/SCTP, and owner visual review remain open. No production deployment or device acceptance is claimed.