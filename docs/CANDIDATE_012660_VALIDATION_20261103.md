# Candidate 0.12.66 validation — 3 November 2026

## Changes

- CPU trick counterplay now includes Freeze, Bat Trick, Spin Bump, and Sand Trap warning windows. It uses the existing difficulty reaction timing, nearest in-range defender, and each move's established radius; existing human jump/slide counters are unchanged.
- Fixed a Super Shot down-time timing bug: the first grounded frame no longer consumes a tick. The 0.5–3 second strength-scaled knockdown begins counting on the next simulation frame.
- Manager Appearance and Player Studio canvas labels now match the active context. The Team Command Center's six starter controls now expose distinct ordinal and role names.
- LAN reliability hardening: reject over-limit snapshot and wire strings before UTF-8 allocation; fail closed when present `bufferedAmount` counters are invalid in send and auto-signaling paths; avoid timer/poll allocation when peer negotiation is synchronously aborted. Valid payload and sockets without a counter retain compatibility.

## Validation

- `npm run test:node`: **1,836/1,836** Node tests passed; the club fixture passed.
- Data validation with UTF-8 mode: **223 teams, 2,676 players, 84 avatar presets; 0 errors**.
- Focused gameplay: Freeze AI/human/trick suites 14/14; Bat and human-counter suites 16/16; Spin/Sand and related counters 22/22; Super Defence audit 43/43 plus `defensive_abilities.mjs` and `special_levels.mjs`; shot-impact timing and contacts 9/9 at 30/60/120 Hz.
- Focused LAN regressions passed: snapshots 16/16, safe-send 18/18, auto-signal/backoff 22/22, wire/data-channel/host-adapter 13/13, and peer connection 47/47. Each changed scope also passed the modular build and scoped whitespace check.
- Chromium: manager/player portrait names and six formation starter labels passed actual route assertions; Player Studio desktop and simulated-touch gamepad/save/focus checks passed. Player Studio visible form audit found no unlabeled controls and 25 reachable Tab stops; no browser errors. Actual renderer captures show nine distinct Super Shot reaction/recovery phases and physics state unchanged, plus four normal/reduced-flash downed-breathing phases with distinct pixel hashes. Exact scripts are linked from the Master Backlog.
- Release/version contracts after metadata rotation: **21/21 passed**; modular JavaScript parse and offline-cache/version wiring passed.

## Acceptance limits

The broad Chromium census remains unaccepted after the `.62` local app-load timeout issue and was not rerun here. Hosted signaling/deployment, real two-device and physical-device acceptance, and owner visual acceptance are not claimed. The Run 00 AI bald-head cleanup v02 is rejected; visible red/yellow contour fringe remains. No generated art was promoted.