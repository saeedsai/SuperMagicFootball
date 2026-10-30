# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-30

## Mission
Only existing `dev`; no new branches, force pushes, manual main writes or CI/security bypass. Preserve 223 teams/2676 players, six formations, exactly Pass/Shoot/Dribble/Jump, ten Career/Cup slots, SD09, offline saves and LAN.

## Current checkpoint
- **0.12.12.1 BREATH-SWAP-FIX-01:** `applyPlan` snapshots `breath` with player identity across tactical slot reorder, preventing a free refill. New substitutes still enter with normal Breath capacity; halftime restores Breath.
- Repaired nine observed Node failures: seven isolated VM tests omitted `breathCapacity/stat` bindings and two Magic Trick tests expected a pre-Breath hold guard. Added tactical swap, halftime and keeper Breath assertions.
- Code/tests/version commit `b30ff4c0e40eddf9bb15f002a3724360b8d36845`; documentation/checkpoint follow-up. Prior 0.12.12.0 Hide Ball PASS counter and 0.12.11.0 Studio Jumping preview remain.

## Next smallest action
1. Inspect exact-head four Node/four Chromium and Modular QA; fix failures.
2. Implement a bounded independently authored directional art/animation increment and validate #15.
3. Improve Player Studio and counterable Magic Tricks with mobile acceptance.
4. Advance goalkeeper penalty control or Career Mode.
5. Promote only exact green `dev` via authorized protected pipeline; verify main and Pages bytes.

## Ownership and exclusions
Sole developer; historical locks nonblocking. Never read/edit other agents' private memory. Two-phone LAN acceptance #48 remains open and uncertified. Render drift #86 and main protection #87 remain open.

## Evidence
Starting `dev` 881414a914b9b2981b362c153333b5698176ec7d, `main` e8c07652f66071ec2da5370127966475f2f0df45 (74 ahead). Full Regression Census #40984010558 and Modular QA #40984010582 failed nine Node assertions; Chromium skipped. Direct V8 gameplay smoke passed. Local GitHub DNS failed. Exact new-head CI, promotion, Pages and physical LAN remain unverified.

## Cleanup
Keep own checkpoint under 4 KiB and shared memory under 6 KiB.
