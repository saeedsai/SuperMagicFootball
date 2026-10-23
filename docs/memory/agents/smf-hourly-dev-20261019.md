# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23 11:57 Europe/Stockholm

## Mission
Never pause dev for pending CI/release. Make small, tested increments on existing dev; fix blockers safely; promote exact green dev only through protected pipeline. No new branches, bypasses, or force-push.

## Current checkpoint
- Start heads dev `7d9d69207a9ebad71b21dd272e718cce0bd01f92`, main `385022294d86fdaf5c25ad33222b6bba978c412b`.
- Candidate About-only version `0.9.19.1`; corrected real player-facing Concept Royals portraits after inspecting actual browser screenshots.
- Concept Royals: 12 distinct identities, five original atlas directions and experimental run rig, NOT 12 bespoke sprite atlases or all action animations. Prior screenshot artifact 12493378311 from successful QA run 39935767615 revealed severe opaque face mask covering original eyes/mouth; fixed by pixel-recolouring original illustrated face and caching tinted atlas layers (`b60f86e7`), with non-occlusion tests (`45030ef1`, `3c89ec12`).
- Fixed Concept Hero QA stale shortcut expectation in `2ff222d9`: menu now Quick Match → On Device → Single Player → select Concept Royals. Prior failure `39935132081` asserted retired `conceptDemo` button.
- Added 300-frame (12×5×5) run timeline to `concept-royals-visual-qa.html` (`91033ebd`), actual Chromium PNG sheet capture `d1096213`, CI screenshot artifact wiring `cf085374`, test `b9c717bf`. Central log updated.

## Next smallest action
1. Check exact-head 4 Node/4 Chromium Census, Modular QA and Concept Hero QA; fix concrete failures.
2. Retrieve screenshots from passing QA artifact, inspect each of 60 idle tiles and 300 running frames; fix distortions.
3. Implement an isolated, counterable Magic Trick action or another bounded gameplay increment with regression tests and coordinated four-field bump.
4. Advance two-client LAN handshake/state sync with two-browser QA, without claiming finished multiplayer prematurely.
5. Promote exact fully green dev through protected pipeline; verify main SHA, Pages and hosted byte smoke.

## Ownership and exclusions
Sole maintainer `smf-hourly-dev-20261019`. Only dev for coding, main for protected promotion. Preserve 223 canonical teams/2676 players, six formations, four buttons, offline saves, 10 Career/Cup slots, SD09. No other agents' memory files.

## Evidence
Modular QA `39935132100` and `39936287417` passed on earlier heads. Browser QA `39935767615` passed, produced original screenshot artifact 12493378311, which exposed face occlusion. Corrected browser QA `39936440811` PASS at `55abbac6`, screenshot artifact `12494101727` (60 idle + 300 running samples, no JS errors). Visual inspection: no opaque masks; hairstyles still share base shape and run is subtle; jump/shoot/tackle/super actions remain unimplemented. Latest exact-head 0.9.19.1 full 4+4 and Pages deployment pending.

## Cleanup
Keep graphics prototype isolated, avoid inventing visual QA success. Next iteration inspect CI artifacts and fix real errors; preserve all regression coverage.
