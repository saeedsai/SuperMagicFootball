# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.345 — AI-THIRD-MAN-TURN-FEASIBILITY-01:** third-man support-run selection now accounts for the bounded time a moving receiver needs to turn into a complementary lane. Higher Agility reduces the turn penalty for identical cross-lane momentum, but a lower-Agility runner already aligned with the route retains the momentum advantage. The penalty is zero below 75 units/s and capped at 48 score units. Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions added.
- **.344 certification:** Modular QA #45903576031 passed 2,979/2,979; Full Regression Census #45903575975 passed all four Node and four Chromium shards on e9868a839c6d3494c39cb2966fd39a665b111ce0. QA-gated promotion succeeded; Pages #45904941174 and main Census #45904948243 passed, including hosted smoke.

## Next smallest action
Check exact-head .345 Modular QA and Full Regression Census. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player presentation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- .344 baseline and current pre-candidate dev/main head: e9868a839c6d3494c39cb2966fd39a665b111ce0.
- .344 Modular QA #45903576031; dev Census #45903575975; Pages #45904941174; main Census #45904948243.
- GitHub REST reports main.protected=false and rulesets empty; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
