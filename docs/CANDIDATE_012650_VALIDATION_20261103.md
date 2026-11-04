# Candidate 0.12.65 validation — 3 November 2026

## Changes

- Freeze magic trick: during the existing one-second warning hold, the nearest eligible CPU defender can perform a difficulty-timed jump counter. The 95-unit Freeze range is separate from Fireball's existing 120-unit reaction. Player controls and the four-button action schema are unchanged.
- Manager Appearance: the shared rotatable portrait preview now uses a manager-specific accessible name on the manager route and retains the player-specific name elsewhere.
- LAN snapshots: reject a string exceeding the maximum wire byte length before creating a temporary UTF-8 encoding. Valid-size strings still receive exact encoded-byte validation; the wire protocol is unchanged.

## Validation

- `npm run test:node`: **1,820/1,820** Node tests passed; the club fixture passed.
- `python scripts/validate_data.py` with `PYTHONUTF8=1`: **223 teams, 2,676 players, 84 avatar presets; 0 errors**. The environment's default Windows code page cannot decode one existing roster character, so UTF-8 mode is required for this validator.
- Freeze focused suites: **14/14** passed across AI counterplay, human jump counter, and trick hold behavior.
- Manager portrait accessible-name plus manager avatar suites: **5/5** passed. Live Career Manager Appearance and Player Studio Chromium route assertions passed twice with no page errors (`tests/manager_avatar_preview_accessible_name_browser_qa.py`).
- LAN snapshot plus snapshot-channel suites: **16/16** passed; oversized input regression proves the rejection path does not call `TextEncoder`.
- The modular build and scoped whitespace checks passed.
- Release/version contracts after metadata rotation: **21/21 passed**; modular JS parse and cache/version wiring checks passed.

## Acceptance limits

No broad Chromium census was rerun because the `.62` local app-load timeout limitation is unresolved. The accessibility name has structural regression coverage, not physical screen-reader hardware acceptance. No hosted signaling, deployment, or two-device acceptance is claimed. The Run 00 AI bald-head cleanup remains an isolated rejected trial: the contour fringe is still visible after the official AssetStudio cleanup pass; no art asset was promoted to the game. Owner visual approval remains open.