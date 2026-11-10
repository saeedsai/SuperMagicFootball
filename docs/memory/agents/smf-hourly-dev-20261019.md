# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-10

## Mission
Small tested increments on existing dev. Preserve 223 teams, 2676 players, six formations, four actions, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- At start, dev/main identical at `fad87832fee95e4252179a2f364959f8675362e9`.
- Added Chromium regression cases for spectator/no-human and invalid negative local seat in `tests/breath_local_selection_browser_qa.py` (commit `72f7313`). The existing desktop/touch selected-player switching and four-button assertions remain.
- Browser regression NOT EXECUTED; local git checkout blocked by DNS. Four Node/four Chromium Census, Modular QA and hosted Pages bytes NOT VERIFIED. No promotion claim.
- Production renderer currently allows `localBreathSide == null` to match multiple human seats; inspect and fix with a separate player-facing candidate and full release gates. Do not claim the ring fully certified.
- About stays `0.12.81.67` (test-only increment).

## Next smallest action
Execute browser QA and fix failures; inspect null local seat ownership and cover with browser regression. Then full exact-head CI and protected promotion only when green.

## Ownership and exclusions
Own checkpoint only; no other agents' memory, concept heroes, roster audit, routine LAN or unapproved art.

## Evidence
- https://github.com/saeedsai/SuperMagicFootball/commit/72f7313ee869e9385fce7c08e59d332dc04555b8

## Cleanup
Physical two-phone #48, Render drift #86 and main protection #87 remain open. No security bypass.
