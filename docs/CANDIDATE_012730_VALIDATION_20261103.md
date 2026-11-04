# Candidate 0.12.73 validation — 3 November 2026

## Career/Cup save-name dialog

Career slot save, Career rename, and Cup slot save now use one accessible in-game dialog. It has an associated label, 1–60 character input, inline blank/duplicate-name errors, explicit overwrite wording and button, Escape/Cancel behavior, contained keyboard focus, and focus restoration to the originating slot. Successful writes still use the existing Career/Cup slot APIs and legacy mirrors.

## Validation

- `npm run test:node`: **1,864/1,864**; build and 32-club fixture passed.
- Focused Career/Cup slot and dialog contracts: **37/37**.
- `career_cup_slot_name_dialog_browser_qa.py`: desktop and simulated-touch Chromium passed blank/duplicate rejection, no-write cancellation, Career rename timestamp preservation, Cup overwrite wording, Escape, Tab/Shift+Tab containment, persistence readback, and focus restoration.
- `viz01_standard_focus_browser_qa.py`: desktop/simulated-landscape Chromium confirmed accessible names, visible focus, viewport fit, and Tab order for Fullscreen, Pause, Jump, Pass, Shoot and Dribble.
- LAN replay expiry suite: **2/2**, including fake-clock expiry at 30 seconds and local-WebSocket replay/cap behavior.
- UTF-8 data validation: **223 teams, 2,676 players, 84 avatar presets**, no errors.
- Release gate and version-policy tests: **21/21**.
- Portable-Chromium four-shard census executed **205/206** scripts successfully with zero FAIL/ERROR results; one graphics-integration script exceeded the 55-second shard timeout under parallel load. The same script then passed in isolation (19/19 desktop/touch checks), so no app failure was observed. See [shard reports](qa_runs_012730_browser_20261103/README.md). This is a completed census with one shard timeout and isolated retry, not a 206/206 shard run. Exact-head CI, hosted deployment, physical-device, real two-device network, and visual-owner approval remain separate.

The separate experimental AI character assembly is retained as unapproved evidence only: [report](EXPERIMENTAL_AI_RUN_FRONT_ASSEMBLY_20261103.md).
