# v0.8.11.2 verification

- 22/22 Node test scripts passed (`npm test`), including new defensive-pursuit/pitch/fatigue test and previous transformed-shot reset.
- `npm run build` passed; offline single HTML produced.
- Desktop + Android simulated Chromium four-button control checks passed.
- Desktop + Android simulated Chromium collision checks passed.
- Legacy browser suites were run in batches. Old position assumptions caused temporary failures in aerial and morale tests; those were updated for the expanded pitch and their desktop/mobile reruns passed, as did team combos, dashboard, four-button controls and collisions. The overall parallel test runner timed out; no unverified all-suite pass is claimed.
- Physical phone and gamepad QA, real match-balancing, edge-case player pathfinding: unverified.
- Initial focused chase test ran during kickoff lockout, then passed when using play-ready input; this is a test setup correction.
