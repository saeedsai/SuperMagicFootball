# Shot recovery animation and Career fitness-report integrity — 3 November 2026

## Changes

- The player now holds the authored shot-down pose for the existing knockdown timer, then uses the existing 0.24-second get-up phase for an eased torso unroll, brief arm brace, and small lift to standing. The pose is mirrored by facing and reads only action timers; physics, stun/knockdown duration, controls, and save fields are unchanged.
- Both modular and standalone Career fitness APIs validate the whole transient engine report before mutation. Invalid rows (including non-finite/out-of-range condition, fatigue or seconds, and malformed IDs) now reject atomically; valid condition, injury, recovery, and Career save behavior remains unchanged.

## Validation

- Shot pose and existing launch/reaction contracts: **13/13 Node tests**.
- Actual Canvas renderer: nine unique frames (launch ascent/apex, stable down, get-up start/push/stand, and confusion/reduced-flash), no browser errors, and player/ball physics unchanged.
- Career focused/full Career suite: **177/177** tests; `node tests/career.mjs` passed the 83-club Career scenario through training, transfer, Cup, league and season rollover.
- Full project Node suite: **1,809/1,809 passed**, followed by the club fixture.
- Data validation: **223 teams, 2,676 players, 84 avatar presets; zero errors**.
- Candidate-wide Chromium census was attempted with four shards, then retried with lower concurrency. It did not produce an acceptance pass: several unrelated scripts timed out while `Page.set_content`/`Page.goto` waited for `load` at the Playwright 30-second default; one script also exceeded the 90-second runner cap. The Rainbow dribble browser case that failed under load passed when rerun alone. See [candidate QA attempt](qa_runs_012620_final_20261103/README.md).

## Limits

Focused renderer and Career checks plus full local Node/data validation pass. The full browser census remains unaccepted because of local page-load timeouts. Physical-device acceptance, screen-reader hardware review, owner visual approval, exact-head CI and hosted deployment remain separate.
