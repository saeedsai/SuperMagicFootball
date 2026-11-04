# Candidate 0.12.72 validation — 3 November 2026

## Change

Team Command Center guidance now states the exact current penalty trigger: a grounded slide-from-behind foul on a moving carrier awards a penalty inside the defending area and a direct free kick outside it. It separately says that general foul and card handling is not implemented.

Cup slot history validation now accepts only supported bye/league/knockout row shapes with valid participant IDs, numeric scores in the range 0–999, and valid round/stage/winner fields. Archive rendering also formats scores through a numeric guard, so corrupted legacy state cannot place markup in the page even if it bypasses backup validation.

The LAN signaling broker now tombstones recently accepted join-request IDs for 30 seconds per room. Replays are rejected without reopening the host prompt; the table is capped at 64 IDs per room and fails closed at capacity.

## Validation

- Integrated local Node suite: **1,860/1,860 passed**, plus the club roster fixture (32 clubs / 384 player slots).
- Focused Cup backup/save-slot and history safety tests: **22/22 passed**; Team Command Center copy contract **1/1 passed**.
- Actual Chromium history-injection checks passed on desktop and simulated touch; hostile scores render as harmless text and do not create or execute an element.
- Actual local-WebSocket LAN broker test: **1/1 passed**, covering completed-ID replay suppression, fresh-ID acceptance and fail-closed room capacity. The 30-second TTL path is implemented but the integration test does not wait out that expiry interval.
- Data validation: 223 teams, 2,676 players and 84 avatar presets. Release/version contracts: **21/21 passed**.
- Corner restart browser QA: desktop and simulated-touch both pass, retaining four controls and both corner-side scenarios.
- The preceding `.71` integrated local gates passed: Node **1,857/1,857** plus club fixture, data 223/2,676/84, release contracts **21/21**, and four-shard portable Chromium **203/203**. After the `.72` Cup/UI changes, release/version contracts pass **21/21**.
- Desktop/simulated-touch corner restart browser checks passed.

## Acceptance limits

This does not implement general foul or card rules. No owner visual review, physical-device acceptance, `.72` full Chromium census, exact-head CI, hosted deployment verification or physical-network acceptance is claimed.
