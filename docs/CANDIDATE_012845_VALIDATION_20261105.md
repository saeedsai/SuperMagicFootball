# Candidate 0.12.81.45 — local validation (5 November 2026)

## Scope

- When the authoritative online match engine or its snapshot reader throws, the server sends both active seats a fixed, allowlisted `match-error` event. It never includes exception text.
- The client requires the exact match ID and error schema, clears that match identity, ignores subsequent snapshots for the failed match, and returns to the online entry flow without invoking result or reward handling. It clears only that match's pending PVP result marker; Career indicates that its reserved fixture can be retried.
- Existing procedural player characters now blink at deterministic, staggered intervals only during stationary idle poses. The eyes reopen; hurt/action poses and gameplay state remain unchanged.

## Focused validation

- Online WebSocket/client/matchmaking/service regression suites passed **59/59**, including both active seats receiving the fixed engine error, malicious error codes rejected, late snapshots blocked, retry-safe session state, and no false finished result.
- The integrated `python -X utf8 tests/online_account_ui_browser_qa.py` completed once successfully (mocked match-error exit, PVP marker cleanup, no rewards/result display, and Career/Online flows). Two coordinator reruns timed out later at separate Online Career and Ultimate Team navigation waits; these are not in the match-error portion, but exact-head browser Census must confirm the larger asynchronous script is stable.
- Blink schedule tests passed **2/2**. `python -X utf8 tests/characterart_idle_blink_browser_qa.py` passed actual-renderer Chromium QA with four samples: visible eyelid closure/reopening, staggered variation, no browser errors and unchanged player/ball state. The preview was inspected internally; this is not owner visual approval.
- After updating all release/version/cache metadata to .45, `npm run test:node` passed: build **5,174,947 JS / 5,297,959 HTML characters**, tracked Node suite **2,227/2,227**, and the Club26/FC27 executable passed. Release/version contracts passed **22/22** and `git diff --check` passed.

## Limits

No live-host engine-failure drill, client reconnect with a real server, physical device test or human visual/accessibility approval was performed. Online server credentials and authenticated public service configuration remain unavailable. Do not treat local mocks as proof that hosted matches are live. Exact-head .45 CI, promotion, Pages and main Census remain pending.
