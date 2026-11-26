# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize player-facing football gameplay, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup depth. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.330 — AI-DEFENDER-SLIDE-CHOICE-CARRIER-TURN-READ-01:** CPU slide-versus-poke choice now projects a moving carrier through the existing 120 ms Agility-limited turn response. An elite carrier turning toward the defender can remove the lateral escape that justified a SHOOT slide, so CPU keeps the shorter PASS poke; low-Agility carriers retain the cut and remain slide-eligible. Neutral/invalid input and missing/invalid Agility preserve the conservative fallback. No slide contact, aim, run-up, probability, cooldown, stamina, ball physics or human/contextual tackle behavior changes.
- Added mirrored Node and actual-engine desktop/simulated-touch Chromium regressions for both directions, high/average/low/missing/invalid Agility and neutral/invalid-input fallback.
- Repaired the confirmed .329 Census browser fixture: protect both the Scream caster and selected-human defender controller slots during the live timing loop, and assert that the held-dribble window advances before invoking the unchanged resolver.
- Release metadata, About-only version, README banner/headings, version policy, service-worker cache identity, master backlog and this checkpoint are aligned to .330.

## Next smallest action
Complete Modular QA and the full four-Node/four-Chromium Census on the exact .330 dev HEAD. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next uncompleted gameplay item rather than repeating Agility-only tests.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. No authenticated online-hosting claim.

## Evidence
- Parent .329 dev HEAD: `2096703ab8afc11c3de6537ef2f1a9a331a4e578`.
- .329 Modular QA #45793784813 passed 2,953/2,953 Node tests.
- .329 Full Regression Census #45793784717: preflight/preview, all four Node shards and browser shards 0/1/3 passed; browser shard 2 failed only the selected-human Scream fixture because carrier hold remained at .35. The .330 fixture protects the carrier's controller slot as well as the selected defender; exact-head rerun required.
- Main .325 HEAD: `da3146d83113f82835a6095d0ed814d75d0dbc4c`; Pages #45782390375 and independent main Census #45782401424 passed.
- GitHub reports dev unprotected; main protection #87 remains unresolved. #48 remains open; no physical two-phone certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, art, save-schema or online-hosting changes.
