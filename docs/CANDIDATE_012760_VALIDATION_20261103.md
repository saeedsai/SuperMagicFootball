# Candidate 0.12.76.0 validation — LAN room privacy and ability input

## Delivered

- Hosted LAN room re-registration rejects a same-host request to change an active room between local-LAN and Internet-P2P scope before mutating visibility. A supplied `public` field must be boolean; private rooms remain unlisted, while an omitted field retains legacy public behavior.
- Shoulder Ride has a real modular-engine `GameEngine.update()`/`driveAI()` counterplay regression. Opposing CPU defenders break the ride before completion in both directions at 30/60/120 Hz; the cooldown and fatigue remain paid, and participant ride state clears.
- Keeper Super Defence has a real modular Input + GameEngine test proving Jump+Shoot activation from keyboard, touch, default gamepad and remapped gamepad without adding a fifth action or changing canonical roster data.
- Candidate `.75` Store, local token rewards, Career Market, shot/trick counterplay, reduced-motion warnings and LAN result reliability remain included. See the [previous candidate evidence](CANDIDATE_012750_VALIDATION_20261103.md).

## Validation

- `npm run test:node`: **1,919/1,919**; club fixture passes (32 clubs, 384 slots, 2/3/4/3).
- Data validation: **PASS**, 223 teams, 2,676 player slots, 84 avatar presets, zero errors.
- Release/version contracts: **21/21**.
- Four-shard portable-Chromium census: **211/211** with zero failures, timeouts or errors; shard audit passes ([reports](qa_runs_012760_browser_20261103/README.md)).
- LAN scope/listing and signaling focused suite: **14/14**; full LAN Node glob: **432/432**.
- Shoulder Ride mechanic/action/four-button suite: **17/17**; keeper Super Defence button path: **1/1**.
- `git diff --check` passes; Git emitted line-ending conversion notices for existing mixed-ending files.

## Remaining external acceptance

Hosted service deployment/origin, process-restart checks, physical Android/iOS/controller testing, two-physical-device play, owner visual approval, exact-head GitHub CI and hosted-byte verification remain separate. Token receipts are still local soft currency and are not server-secure; real-money purchases and a trusted server ledger are not implemented. Team/player unlocks remain Coming Soon. No generated concept team or new concept hero work was added.
