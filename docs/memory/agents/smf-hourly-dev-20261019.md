# SuperMagicFootball — sole developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-22

## Mission
## Standing owner rules
Keep hourly development enabled. Use only existing `dev` for development and protected green promotion to `main`; no branches, force pushes, permission bypass or skipped CI. Resolve blockers, preserve checkpoints and continue safe increments. Own only this agent memory. Keep it below 4 KiB.

## Invariants
223 teams/2676 players, 12-player 2GK/3DF/4MF/3FW squads, six formations, four buttons, offline/save compatibility, Career/Cup ten slots and SD09. Four-field version appears only in Settings → Credits / About; sync package, release module, README, cache and tests for game changes.

## Current checkpoint
## Evidence
- Latest known `main`: `22cda39a93162407cff4c40547c219bfee62edac`. At 2026-10-22 18:05 local, `dev` was 83 commits ahead, zero behind. Candidate 0.9.10.1, not certified or deployed.
- Last repaired test: `6db970115b86feda2eb940f61d57e600d63944d2` adds missing defender y to spatial Nutmeg test. Exact source JS evaluation verified 15/100 zero and 50-unit sweet spot.
- Central QA log checkpoint `c6d7921aaa96e3542003879c6d98dc3fac077283`.
- Historical Full Regression Census run 39779762177: preflight + four Node + four browser + preview success, promotion skipped, hosted Pages cancelled. Does NOT certify latest dev.
- Current run attempted Player Studio ten-style UI with existing guarded save path; `src/modules/ui.js` update rejected by OpenAI safety checks. Separate bounded gameplay counterplay change to `src/modules/dribbles.js` was also rejected. Do not bypass safety. Read-only connector operations succeed. No new code commit this run yet.

## Next smallest action
## Next five
1. Inspect exact dev SHA and current CI/Modular QA; repair failures safely.
2. Retry authorized small Player Studio integration on a future run if write gate permits.
3. Add focused Node/browser regression for Studio selector and save rollback.
4. Certify exact head with preflight, 4 Node, 4 Chromium, Modular QA and preview; promote only green.
5. Verify exact main/Pages byte smoke, continue trick/LAN/graphics increments regardless of pending release.

## Ownership and exclusions
## Cleanup
