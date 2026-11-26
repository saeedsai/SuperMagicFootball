# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.341 — AI-GOALMOUTH-PASS-TURN-ARRIVAL-01:** CPU goalmouth square-pass selection now projects active defenders through the existing Agility-limited turn response before scoring the receiving pocket. High-Agility markers turning into the lane can close a pass that linear momentum leaves open; low-Agility and neutral/slow fallbacks remain bounded. Receiver lead, pass physics and four actions are unchanged.
- **.340 exact-head Census #45882381256:** preflight, preview, all four Node shards and three Chromium shards passed; browser shard 1 failed only the Hide Ball browser fixture because random successful poke contact displaced the caster outside the 70-unit resolver cone. .341 isolates that fixture's reaction timing from random contact knockback; production tackle behavior is unchanged.
- .340 Modular QA #45882381224 passed 2,971/2,971. .341 exact-head Modular QA and four-Node/four-Chromium Census are pending.

## Next smallest action
Inspect .341 exact-head Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player presentation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev SHA: `746fea3915866e79aed8a925d4582bc1111af1e4`; main SHA: `a8edae04834d16a11292617e8d0d52abbd66eb4f`.
- .340 Modular QA #45882381224 passed 2,971/2,971; Keeper Save Event Integrity #45882381295 and Concept Hero Playable Prototype QA #45882381303 passed.
- .340 Census #45882381256 failed one browser shard only; exact failure and fixture correction are recorded above. .340 is not certified or promoted.
- Main .336 deployment/Census evidence from #45846426105 and #45846445829 remains the last verified main release. GitHub REST reports `main.protected=false` and `dev.protected=false`; #87 remains open. #48 and #86 remain open.

## Cleanup
Only this agent's checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
