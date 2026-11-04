# Candidate 0.12.81.12 validation — 4 November 2026

## Delivered

- Added an asymmetric kick/fold to the existing Super Shot launch reaction. The near leg kicks forward while the far leg tucks, using the existing bounded pose timer. Gameplay timers, hitboxes, collisions, physics, controls and saves are unchanged.
- Updated the Energy browser regression to match the current formation roster labels, and updated the position OVR browser check to match the current OVR-plus-Energy tooltip. This preserves coverage for the requested Energy display.
- Package, About metadata, root README and service-worker cache identify candidate 0.12.81.12.

## Validation on the current local tree

- `python -X utf8 scripts/build.py`: passed.
- Focused reaction/visual suites: **13/13**.
- `python -X utf8 tests/shot_impact_reaction_browser_qa.py`: Chromium passed, **9/9 distinct reaction phases** and all **8 headings** (minimum 5,222 painted pixels per heading), unchanged player/ball state and no page errors.
- Release/About/version contracts: **25/25**.
- Full Node suite: **1,951/1,951**.
- Four-shard Playwright Chromium census: **227/227**, no final failures, timeouts or errors; independent exact-coverage audit passed.

The browser shard totals are **57, 57, 57 and 56**. The Energy and OVR browser scripts initially failed on outdated UI wording. Both tests were corrected, rerun directly through portable Chromium on desktop and simulated touch, and passed. The shot reaction browser capture was subsequently expanded to all eight match headings and passed as a direct focused rerun. Initial failures and retry results remain recorded in the corresponding shard JSON/Markdown evidence.

## Limits

This is local validation of a dirty working tree, not an immutable commit certification. Exact-head CI, hosted smoke/deployment, owner visual approval, and physical-device/accessibility acceptance remain unverified. No roster identity/stat audit, new concept-hero work, or server-backed token settlement was performed.
