# Supermagic Football v0.8.17.1 — Four-Button Combo Priority Hotfix

- Fixed Jump+Pass crossing to trigger in **either button order** and only once per chord.
- Deferred ordinary grounded Jump to the short-release gesture, enabling Jump-first Cross without an unwanted jump.
- Fixed Jump+Dribble bicycle action getting overwritten by a second Jump action; added a one-shot latch in the control resolver.
- Preserved rapid-tap keyboard/touch buffering, independent pointer tracking, joystick handoff and blur cleanup from v0.8.16.2.
- Preserved Pass, hold-Jump running, manual and auto-switch fixes from v0.8.17.
- Updated the offline service worker cache list and key so modern source modules are available for PWA caching.
- Added focused `combo_priority.mjs` and `combo_priority_browser_qa.py` covering both press orders and extra-action suppression, alongside inherited regressions.
- Updated the 218-item feature matrix; validated existing bicycle control (#143) rather than claiming backlog-only ball-pop combos are finished.

No new kits, official rosters, goalkeeper behaviors, new BPW teams or network modes were added in this increment.
