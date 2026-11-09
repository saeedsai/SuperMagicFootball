# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Small tested increments directly on dev; preserve 223 teams, 2676 players, six formations, exactly Pass/Shoot/Dribble/Jump, offline saves, Career/Cup ten slots and SD09. Never bypass exact-green release gates.

## Current checkpoint
- Shipped Breath candidate 0.12.81.67 already on main: inexpensive ordinary ball carrying/dribbling, costly sprint, walking recovery, human-selected-only ring. Physical two-phone LAN #48 remains open.
- This run: hardened the *wired* CPU Scream JUMP reaction against nonfinite carrier and defender coordinates, excluding invalid players from nearest-target sorting. Source commit 167620b; Node regression commit e61ed5d. This is internal reliability, no player-facing version bump. Focused/local and exact-head CI must be verified before promotion.
- Earlier unwired pure Scream helper hardening is separate; do not claim it is playable.
- Previous dev Census 42623042332 and Modular QA 42623042333 passed; bfc0401 was promoted to main before this increment.
- Render provisioned signaling branch drift #86, main protection #87 and physical two-phone acceptance #48 remain open.

## Next smallest action
Check exact dev head, focused test and four Node/four Chromium Census plus Modular QA. Repair any failure, promote only through green protected pipeline, then verify Pages hosted bytes. Next gameplay priority: counterable tricks and Player Studio usability.

## Ownership and exclusions
Only this checkpoint. No other agents' memory, new branches, direct main edits, force-push, CI bypass, routine LAN work, roster audit or concept-hero creation.

## Evidence
https://github.com/saeedsai/SuperMagicFootball/commit/167620b6b6f7aa3f708436abda272360130c4cc0
https://github.com/saeedsai/SuperMagicFootball/commit/e61ed5d6258cf1d63bbee0c1a8f0e0b8b67fff86

## Cleanup
Under 4 KiB. No native local tests claimed; rely on exact SHA CI.
