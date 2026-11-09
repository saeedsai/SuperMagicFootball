# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Incremental tested development on existing dev. Preserve 223 teams, 2676 players, six formations, four actions, offline saves, ten Career/Cup slots, SD09.

## Current checkpoint
- At start main and dev identical: `603274a5ed213e4791992e15c3bd729e05017c99`.
- BREATH-INVALID-DELTA-01: `src/modules/fitness.js` now rejects nonfinite or nonpositive frame deltas before updating Breath, preventing NaN propagation or infinite refill/drain. Regression `tests/breath_invalid_frame_delta.test.cjs` covers 3 Stamina levels, recovery/carry/sprint, nonfinite and negative dt.
- Source commit `5854a1c`, test commit `753cb79`. Not player-facing; About version remains 0.12.81.67.
- GitHub connector accepted writes; no executable local Node/Chromium checkout and no verified exact-head four Node/four Chromium/Modular QA. Do not claim tests passed or promotion.
- Prior selected-only ring and cheap run/expensive sprint work exists; do not duplicate absent regression.

## Next smallest action
Execute focused Node and browser QA, verify exact-head Census and Modular QA; fix failures. Only then protected main promotion and hosted Pages byte check. Next feature: playable four-button counterable Magic Trick or Player Studio usability.

## Ownership and exclusions
Only own checkpoint. No other agents' memory, concept heroes, roster audit, routine LAN work, or unapproved art.

## Evidence
- https://github.com/saeedsai/SuperMagicFootball/commit/5854a1ca2d0827a4e1996f50fd82fa7cfee28fde
- https://github.com/saeedsai/SuperMagicFootball/commit/753cb79b758bb9e0223b9da110dd0e7e730429bd

## Cleanup
Physical two-phone #48, Render drift #86, main protection #87 unresolved. No physical certification or deployment claim.
