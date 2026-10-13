# Supermagic Football v0.8.17 — Four-button control reliability hotfix

- Buffered keyboard and touch down/up transitions to preserve rapid input taps between game frames.
- Fixed broken/lost short Pass on very quick key/touch taps; retained held long Pass and Jump+Pass crossing.
- Also fixed extremely short Shoot taps being lost and a rapid moving Jump tap accidentally producing a double jump.
- Fixed hold-Jump sprint while carrying the ball by preventing immediate jumping during a moving sustained hold; short taps still jump.
- Fixed manual defensive Dribble/Switch cycling twice within one frame. The selected player is now snapshotted before player-loop input handling.
- Fixed auto-switch being disabled by ordinary joystick steering. Added timing and distance hysteresis plus manual-switch grace.
- Added `tests/control_reliability.mjs` and `tests/control_reliability_browser_qa.py` for direct regression coverage.
- Preserved previously requested items and appended the two future Dribble+Jump ball-lift/super-bicycle combinations to the backlog. **Those combos are not yet implemented.**
- Kept the 216 teams, 2,592 player slots, existing super levels, four-button layout, menu and save compatibility intact.
