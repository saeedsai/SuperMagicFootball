# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-08

## Mission
Preserve 223 teams, 2676 players, six formations, four actions, offline saves, Career/Cup ten slots and SD09. Only existing dev branch.

## Current checkpoint
- Candidate 0.12.81.67 remains unpromoted; walking threshold recovery and low-drain ordinary ball carry are in production, sprint remains expensive; local selected human only Breath ring.
- New `tests/breath_recovery_local_visibility.test.cjs` covers two seconds of sprint exhaustion, two seconds of walking recovery, two seconds of cheap ball carrying across five Stamina values, plus host/guest selection switches and CPU exclusion.
- Commits 9181c613 and c85cb2b6 accepted by GitHub. New test NOT executed; no exact-head green CI, Chromium, Modular QA or deployment established.

## Next smallest action
Execute focused test and existing Breath suites in GitHub Actions; add real Chromium UI ring/selection test, run four Node and four Chromium shards plus Modular QA. Fix exact-head failures. Promote only with enforced main protection and green exact-head release gates; verify hosted bytes. Then Player Studio, Magic Tricks, eight-view graphics, goalkeeper and Career.

## Ownership and exclusions
Only this checkpoint. Do not touch other agent memory. No new branch, force push, CI bypass or physical LAN certification. Issues #48, #86, #87 remain open.

## Evidence
GitHub compare before increment: main 828a4549; dev 31 ahead, zero behind. Native git checkout blocked by github.com DNS; no executable local test evidence.

## Cleanup
Under 4 KiB.
