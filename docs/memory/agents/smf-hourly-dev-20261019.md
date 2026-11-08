# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-08

## Mission
Deliver bounded, tested improvements on existing dev; preserve four actions, 223 teams/2676 players, six formations, offline/saves, Career/Cup ten slots and SD09.

## Current checkpoint
- At run start dev/main identical at b96da7a136be56a2823aee4e58dd8d677fbc54c5; package 0.12.81.65.
- Added combined ordinary running-with-ball plus held-dribble versus sprint regression at 30/60/120 FPS and Stamina 1/35/70/100 in tests/breath_transition_envelope.test.cjs (daad69b0b0e92cca6cb448176409ac219d593351).
- Native checkout still fails DNS resolution for github.com. Test is committed but NOT executed; no player-facing code or version change.

## Next smallest action
Run focused Breath suite against real production FITNESS, selected-human-only Chromium checks and all four Node/four Chromium shards plus Modular QA. Inspect exact dev CI; only promote green exact SHA through protected pipeline, verify Pages bytes. Then advance Player Studio, four-button counterable Magic Tricks, existing eight-view art, goalkeeper and Career.

## Ownership and exclusions
Edit only this checkpoint. Never create branch, force-push, bypass CI, close physical LAN #48 without evidence, or claim Render #86/branch protection #87 solved.

## Evidence
GitHub compare identical at start; GitHub Contents API accepted test commit daad69b0. Native git ls-remote failed DNS. Local tests, full QA, protected promotion and hosted byte verification not run/verified for this increment.

## Cleanup
Keep under 4 KiB. Do not stall useful dev increments for transient release infrastructure.
