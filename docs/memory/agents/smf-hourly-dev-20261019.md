# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.219 candidate — AI-DEFENDER-SKILL-SCALED-SLIDE-CHOICE-01:** CPU slide-versus-poke choice now incorporates the defender's Defence and Aggression attributes as a bounded adjustment to the existing difficulty/anticipation threshold. Average profiles preserve the prior baseline; strong/assertive defenders commit more often only when existing geometry/run-up/facing/relative-motion checks qualify. Tackle attempt rate, success, slide reach/speed, stamina cost, cooldown, four actions, saves, rosters and offline play are unchanged.
- Added focused actual-engine Node and desktop/simulated-touch Chromium regressions for both threshold baselines, profile ordering, bounds, 223 teams and exactly four actions.
- **.218 promoted:** exact-head Modular QA #45130003654 and dev Census #45130003595 passed; QA-gated promotion moved main/dev to `3f605b38b4a43ac7ced0778aefbf5c68b2e27a37`. Pages #45131091490 passed.
- **Main Census follow-up:** #45131103562 passed hosted smoke, preflight, preview, all four Node and three Chromium shards; browser shard 1 timed out only in `lan_auto_two_browser_qa.py`. Companion `lan_two_client_browser_qa.py` passed. No LAN source changed; retry failed job once. #48 remains open.
- GitHub REST reports main/dev `protected=false`; #87 remains open.

## Next smallest action
Run focused Node and desktop/simulated-touch Chromium for .219, then exact-head Modular QA and four-Node/four-Chromium Census. Repair only observed failures; continue the next independent gameplay increment on dev.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .218 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45130003654
- .218 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45130003595
- .218 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131091490
- .218 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45131103562
- #87: https://github.com/saeedsai/SuperMagicFootball/issues/87
- #86: https://github.com/saeedsai/SuperMagicFootball/issues/86
- #48: https://github.com/saeedsai/SuperMagicFootball/issues/48

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
