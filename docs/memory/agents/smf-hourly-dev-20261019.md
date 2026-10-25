# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · 2026-10-25 05:01 CET.

## Mission
Deliver one bounded tested increment each hour directly on dev even if releases wait. Only dev/main, no force push or bypass.

## Current checkpoint
Baseline dev=main `a0e5b30f2a806853c1366325c15d75e10ee4c3cc` (0.9.41.5 certified: dev Modular #40156696929, dev Full 4+4 #40156696970, main Full #40156962342, Pages #40156962104). LAN-055 candidate 0.9.41.6 fixes fractional analog axes rejected by the wire codec despite LAN-053 adapter support. Accept finite [-1,1] axes; reject nonnumeric, NaN, Infinity and out-of-range; preserve digital directions and four buttons. Two guest→wire→host and invalid-axis Node regressions added; source-executed V8 smoke passed. First LAN-055 CI failed because the memory-contract test requires this exact '## Current checkpoint' heading; repaired without changing game bytes. New-head CI, protected promotion, Pages hosted byte smoke and real two-device LAN still need verification.

## Invariants
223 teams/2676 players, six formations, four controls, 10 Career/Cup slots, SD09, offline/saves, About-only version and aligned package/README/offline cache. Own checkpoint only.

## Next smallest action
Inspect exact-head Modular and full 4+4 runs, diagnose any red check, then continue a bounded compatible dev feature.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019; only dev/main. No extra branches, forced updates, test bypass or premature main promotion.

## Evidence
LAN-055 V8 wire-to-host source smoke passed; first two CI runs failed on missing required checkpoint headings (not gameplay tests). All required headings restored; exact new-head CI pending.

## Cleanup
Keep this file below 4 KiB. Next five:
1. Inspect exact-head Modular and 4+4 CI; repair failures.
2. Test two-client analog, pause, latency and disconnect.
3. Implement bounded LAN recovery/reconnect with tests.
4. Repair Crown Royals left/right sprite orientation and graphics QA.
5. Improve Player Studio and counterable Tricks; promote only fully green exact dev head through protected main/Pages pipeline.
