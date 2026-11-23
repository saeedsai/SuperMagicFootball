# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-23

## Mission
Deliver bounded player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.224 candidate:** MAGIC-TRICK-READ-COUNTERPRESS-AUTO-TACKLE-GUARD-01 keeps a successful second-defender READ! counterpress movement-only for its .42-second timer. The reader cannot auto-poke/slide; its lane assignment takes priority over generic first-touch cover while the other presser continues closing.
- **.223 feature retained:** AI-POKE-BALL-SIDE-READ-01 uses live ball position so CPU defenders early-poke only when the carried ball is exposed toward them; far-side shielding preserves the carrier's existing escape.
- **.223 exact-head Modular QA:** #45153291978 failed 2/2,800: the new test wrapper dropped the optional ball argument, and one source-contract assertion still expected the old two-argument call. .224 corrects both and adds mirrored ball-exposure coverage.
- **.222 exact-head Modular QA:** #45150540827 passed 2,798/2,798.
- **.222 Full Regression Census:** #45150540887 passed preflight, preview and all four Node shards; browser shard 3 failed Magic Trick reader target/action, and browser shard 1 timed out in hosted Pages/Render lan_render_hosted_browser_qa.py after 45 seconds. .224 repairs the Magic Trick behavior. No LAN code was changed for the external timeout.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .224. Confirm mirrored ball-shielding and real-engine Magic Trick movement-only counterpress in desktop and simulated touch. Fix confirmed failures, then continue the next gameplay improvement.

## Ownership and exclusions
Only this checkpoint. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied art. Physical two-phone #48 stays open. Render #86 and main protection #87 stay open. Authenticated online hosting needs owner resources. Never expose Git SHA in player UI.

## Evidence
- .223 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45153291978
- .223 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45153291930
- .222 Full Regression Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45150540887

## Cleanup
Keep this file below 4 KiB. Read and edit only this assigned checkpoint. Never bypass required CI, security or QA promotion.
