# Candidate 0.12.78.0 validation — mobile pinch-zoom accessibility

## Delivered

- Removed the page-level `touch-action:none` barrier that prevented browser pinch zoom.
- Menu, dialog, and scrolling surfaces now permit `pan-y pinch-zoom`; the joystick, four gameplay action buttons and portrait drag-to-rotate canvas retain `touch-action:none`.
- The change affects browser gestures only. Game input mappings, routes, saves, reduced-motion behavior and offline play are unchanged.

## Focused validation

- New CSS ancestor-intersection browser check passes at **320×568 portrait** and **844×390 landscape touch**, verifying pinch zoom is permitted through each menu ancestor and direct-control surfaces retain gesture capture.
- Existing touch-separation audit passes at **320×568, 390×844, 844×390 and 568×320**.
- Reduced-motion desktop and simulated-touch checks pass.
- Fixture build and scoped `git diff --check` pass.
- Integrated `npm run test:node`: **1,925/1,925** plus club fixture (32 clubs, 384 player slots, 2/3/4/3).
- Release/version contracts: **21/21**.
- Data validation with UTF-8 mode: **PASS**, 223 teams, 2,676 player slots, 84 avatar presets, zero errors.
- Four-shard portable-Chromium census: **212/212** with zero failures/timeouts/errors; shard audit passes ([reports](qa_runs_012780_browser_utf8_20261103/README.md)).

## Limits

Browser emulation confirms the computed gesture permissions and separation; a physical touchscreen pinch gesture remains unverified. Hosted deployment, exact-head CI and owner visual approval remain separate.
