# Candidate 0.12.81.42 — local validation (5 November 2026)

## Scope

- The existing procedural player renderer adds a subtle time-based upper-body breathing motion to stationary idle players, staggered by player index. Planted legs and movement/action poses retain their existing rendering. Player/ball simulation, timers, physics and four-button input are unchanged.
- Cached stadium artwork gains four fixed, low-opacity light pools clipped to the current pitch rectangle. Stadium geometry, markings and collision bounds are unchanged; the lights do not animate.
- Online account-service startup now waits for the HTTP bind result and releases a listener if synchronous WebSocket setup fails. It also closes matchmaking and releases the database pool on startup failure.

## Focused validation

- `npm run test:node`: passed; final bundle size **5,169,222 JS / 5,292,234 HTML characters**, tracked Node suite **2,218/2,218**, and the Club26/FC27 executable passed.
- `python tests/characterart_idle_breathing_browser_qa.py`: passed actual-renderer Chromium QA across eight idle sample times. All eight samples differed; minimum painted pixels: **4,945**; maximum changed pixels relative to rest: **3,540**; no browser errors and no live player/ball state mutation. The generated image was inspected internally, but this is not owner visual approval.
- `node --test tests/pitch_line_contrast_visual_contract.test.cjs tests/stadium_01_catalog.test.cjs tests/stadium_02_crowd_silhouettes.test.cjs`: **5/5 passed**. `python tests/stadium_01_render_browser_qa.py` passed all **20 venues**, preserving venue/turf hashes and picker/reload persistence, with zero browser errors.
- Combined focused test run of pitch/stadium and online service/HTTP suites: **20/20 passed**, including listener cleanup and same-port reuse after injected WebSocket initialization failure.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs`: **22/22 passed**. `git diff --check`: passed. Exact-head CI and hosted verification are pending.

## Limits

Automated images and browser QA do not establish owner visual approval or physical-device acceptance. The online-service change is a startup-cleanup fix only; it does not provision a backend. Public online API/OIDC configuration remains empty, and authenticated online play is not live.
