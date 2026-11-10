# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-10

## Mission
Small tested increments on existing dev; preserve 223 teams, 2676 players, six formations, four actions, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- Starting dev/main both `0208108905bc0410ac94f4e572143418ed28c54e`.
- BREATH-NONFINITE-STAMINA-01: nonfinite Stamina now uses minimum safe rated Breath Stamina consistently for capacity, action spend, penalty, movement tick and held Dribble. Previously Infinity could grant maximum capacity/low drain. Finite stats and normal cheap carrying/costly sprint remain unchanged.
- Source commit `a6663852`, regression `e3b1c89c`, test VM syntax correction `afe2f019`. Node/Chromium tests NOT EXECUTED; local Git clone DNS unavailable. Exact-head CI NOT VERIFIED. No main promotion/Pages claim.
- About stays `0.12.81.67` (defensive invalid-stat handling). No new ring ownership change.

## Next smallest action
Run `node --test tests/breath_nonfinite_stamina.test.cjs tests/breath_invalid_frame_delta.test.cjs`; verify selected-local-human-only Breath ring browser tests, exact-head four Node/four Chromium Census and Modular QA. Repair failures before protected main promotion and hosted-byte smoke.

## Ownership and exclusions
Own checkpoint only. No other agents' memory, concept heroes, roster audit, routine LAN or unapproved art.

## Evidence
- https://github.com/saeedsai/SuperMagicFootball/commit/a6663852cb6d139fd30dc0567de7fc611263f070
- https://github.com/saeedsai/SuperMagicFootball/commit/afe2f019a6a6b63c26d1a698ab1092131eb099a8

## Cleanup
Physical two-phone #48, Render drift #86 and main protection #87 remain open. No security bypass.
