# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-08

## Mission
Keep 223 teams, 2676 players, six formations, Pass/Shoot/Dribble/Jump, offline saves, Career/Cup ten slots and SD09. Commit only to dev.

## Current checkpoint
- Candidate 0.12.81.67 remains unpromoted. Ordinary carry has low Breath drain, sprint high drain; walking threshold recovery fixed in production; ring restricted to locally selected human.
- Added `tests/breath_transition_monotonic.test.cjs` covering 5 Stamina levels, walk-to-run threshold, sprint-vs-ordinary intensity and 30/60/120 Hz ordinary carry. Corrected export stripping in a follow-up commit.
- New test not executed; exact-head CI lookup returned no PR-associated workflows/statuses. Do not claim green QA or deployment.

## Next smallest action
Run new Node regression, actual Chromium local-selection/seat handoff, four Node and four Chromium shards and Modular QA. Fix failures. Only promote exact green dev head through protected pipeline and verify Pages bytes. Continue Player Studio, four-button Magic Tricks, eight-view graphics, goalkeeper and Career.

## Ownership and exclusions
Only own checkpoint. No other agent memory, no branches, force pushes or CI bypass. Physical LAN #48, Render auto-deploy #86, main protection #87 open.

## Evidence
New commits f6b92410 and c08d7553 on dev. Native checkout/test execution unavailable here; GitHub Actions result not established.

## Cleanup
Under 4 KiB.
