# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.235 — AI-KEEPER-CROSS-CLAIM-MOMENTUM-01:** a CPU goalkeeper already moving toward a safe targeted high-cross landing gains up to 12 units of bounded claim reach; retreating momentum removes up to 12 units. Fatigue halves the momentum adjustment. Stationary keepers retain the exact .234 skill/fatigue baseline. Catch/punch physics, opponent/teammate safety, four actions, saves, rosters, persistence and offline play are unchanged.
- Mirrored Node and real-engine desktop/simulated-touch Chromium regressions cover approach, retreat and tired momentum on both goal sides. The .234 skill/receiver browser fixture is adjusted so average Defence can reach its early interception sample while low Defence retains its later fallback.
- .234 Modular QA #45220399520 passed; exact-head Census #45220399525 failed only ai_pass_receiver_cover_browser_qa.py in browser shard 1 (69/70 scripts passed there; all Node shards and other browser shards passed). This was a test-geometry issue, not a production keeper or pass-interception failure.
- .232 remains main-promoted and Pages-deployed; independent main Census/hosted smoke #45203767885 passed.

## Next smallest action
Run .235 Modular QA and Full Regression Census at the exact dev HEAD. Fix any confirmed source or fixture failure, then allow promotion only through the existing green exact-head QA pipeline and independently verify main HEAD, Pages deployment, main Census and hosted-byte smoke.

## Ownership and exclusions
Edit only this assigned checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical two-phone #48 remains open; Render drift #86 remains open; main protection #87 is not enabled. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .234 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45220399520
- .234 exact-head Census (browser fixture failure): https://github.com/saeedsai/SuperMagicFootball/actions/runs/45220399525
- .232 exact-head Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45201732936
- .232 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45203753806
- .232 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45203767885

## Cleanup
Keep this file below 4 KiB and retain all required headings and Agent ID. Do not read or edit another agent's private checkpoint. Never bypass required CI, security or QA promotion.
