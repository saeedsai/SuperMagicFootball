# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Incremental tested changes on existing dev. Preserve 223 teams, 2676 players, six formations, four actions, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- Starting dev/main both `97ec3f48fc9029591ea8c9cca80317d3147e3e9c`.
- BREATH-INVALID-ANALOG-01: `breathMovementIntensity` treats NaN/±Infinity input as idle instead of allowing +Infinity to clamp to full speed and drain sprint Breath. Normal valid analog, run, sprint, hyperdash and recovery logic unchanged.
- Source `39aea152`; focused Node regression `b8fe5db7` in `tests/breath_invalid_frame_delta.test.cjs`. Tests committed, execution not yet verified.
- Existing cheap carrying/costly sprint and selected-local-human-only ring contracts remain; no ring source change this run. About version stays 0.12.81.67 (defensive reliability).
- Local full checkout/Node/Chromium and exact-head Census/Modular QA have not been verified. No promotion/Pages claim.

## Next smallest action
Verify focused test and exact-head four Node/four Chromium + Modular QA; repair failures before protected promotion and hosted byte verification. Then improve selected-human Breath ring, Player Studio and playable four-button tricks.

## Ownership and exclusions
Own checkpoint only. No other agents' memory, concept heroes, roster audit, routine LAN or unapproved art.

## Evidence
- https://github.com/saeedsai/SuperMagicFootball/commit/39aea1527ae9ba93f335a1af54071a6bf0783fde
- https://github.com/saeedsai/SuperMagicFootball/commit/b8fe5db718629abc3a2600dec9bec99cc5827be6

## Cleanup
Physical two-phone #48, Render drift #86, main protection #87 open. No security bypass.
