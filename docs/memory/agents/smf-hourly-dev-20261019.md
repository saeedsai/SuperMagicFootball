# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-08

## Mission
Only dev; preserve 223 teams, 2676 players, six formations, four actions, offline saves, Career/Cup ten slots, SD09.

## Latest increment
- Added `tests/breath_local_selection_browser_qa.py` at 9e2f19ae58a09b358babdfd45e6adf938d7d8a93. It runs actual game startup in desktop and touch Chromium, evaluates the production renderer ownership predicate against live selected players, alternates local host/guest seats, switches selection immediately, excludes CPU/out-of-match rings and checks four action buttons.
- This Chromium regression is committed but NOT executed; no pass claimed. Production gameplay unchanged; candidate remains 0.12.81.67.
- Main last observed 828a4549327d14ffa592ad05ca94732391a9d988. No exact-head full CI, Modular QA, protected promotion or Pages byte verification.

## Next five
1. Inspect latest exact-head Census preflight and execute focused Breath Node tests.
2. Run the new desktop/touch Chromium regression; repair any fixture mismatch.
3. Complete four Node + four Chromium shards and Modular QA; address failures.
4. Enforce main protection (#87), promote only certified exact head, verify hosted bytes.
5. Move to Player Studio, counterable four-button Magic Tricks, eight-view art, goalkeeper and Career.

## Blockers
Container cannot resolve github.com for checkout; GitHub CI is required for executable verification. Physical two-phone acceptance #48 remains open; Render commit-trigger investigation #86 remains open. Never claim physical certification or change LAN routinely.

## Memory
This is the only private agent checkpoint read/edited; keep under 4 KiB.
