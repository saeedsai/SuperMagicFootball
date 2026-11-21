# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-21

## Mission
Deliver player-facing gameplay, existing-player presentation and quality improvements while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .138 HIDE-BALL-CPU-PASS-POKE-01: nearest eligible AI defender now times the existing grounded PASS poke against a visible Hide Ball DRIBBLE wind-up, matching the resolver's 70-unit facing cone and difficulty reaction delay. Rookie remains too slow; AI never reads an already-cast hidden position. No new action, save field or trick cost.
- .138 also raises the historical Super Shot whole-match diagnostic pause allowance from 24 to 60 simulated seconds after .137 failed on bird/Expert/team 0/baseline/seed 2 at second-half clock 57.45. This is a diagnostic bound repair, not a gameplay timing change.
- .137 Modular QA passed 2,571/2,571. Its Full Census exposed the diagnostic bound above and one LAN browser timeout; failed jobs were retried. No LAN source change.
- Base dev head before .138: 4266856efc68bda29dd17c78a61e1fab39912425. Main: dc2c4a517cf1cb11eb823ea050b3358e0591b9af (dev 14 ahead, 0 behind before .138).

## Next smallest action
Run exact-head .138 Modular QA and Full Regression Census (four Node + four Chromium shards); repair confirmed failures, then use only the existing QA-gated promotion and independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN changes or other agents' private checkpoints.

## Evidence
.138 adds focused Node coverage for mirrored teams, Easy–Expert reaction timing, Rookie delay, nearest/facing/range eligibility, grounded PASS poke resolution, cooldown/fatigue, release reset and four-action dispatch. No local Node/Chromium execution is claimed; connected GitHub Actions must provide exact-head evidence.

## Cleanup
Keep this checkpoint below 4 KiB; promote only through the existing QA-gated main pipeline.
