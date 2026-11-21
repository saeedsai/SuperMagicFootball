# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .150 AI-CUTBACK-MARKING-READ-01: CPU byline cutback ranking applies a bounded 0–42 score penalty to runners with projected active defenders within 190 units at collection time. Fully blocked pockets remain rejected; no-pressure distance/centrality preference is unchanged.
- Focused mirrored regression adds two-candidate scenarios on both attacking sides: no pressure keeps the closer/central runner; an active marker shifts selection to the farther, more open runner.
- .149 KEEPER-CUTBACK-LATERAL-LEAD-01 is now main-promoted. Exact-head Modular QA, four Node/four Chromium Census shards, QA-gated promotion, Pages deployment, main Census and hosted-pages smoke passed.

## Next smallest action
Verify .150 focused regression, Modular QA and exact-head Full Regression Census (four Node + four Chromium shards). Fix confirmed failures, then continue with a distinct gameplay increment or begin the documented existing-player front-run art sequence only if Studio import/export and game-scale screenshot QA are available.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve four actions, 223 teams, 2,676 players, six formations, saves and offline/PWA behavior.

## Evidence
Parent dev/main: 6f706514c509c2aecf039740ccff342d9c27b565. .149 Modular QA #44882508776 and dev Census #44882508731 passed; QA-gated promotion completed; Pages #44883191447 and main Census #44883191761 passed including hosted-pages smoke. Issues #87, #86 and #48 remain open.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
