# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize player-facing football gameplay, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup depth. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.329 — AI-SHOOT-SLIDE-CARRIER-TURN-READ-01:** CPU defenders now project a grounded exposed-ball carrier through the existing Agility-limited directional turn response when aiming a SHOOT slide. High-Agility carriers turn farther into live input; low-Agility carriers retain more lateral momentum. Only validated CPU exposed-ball slides change; PASS pokes, human/contextual slides, ball-side eligibility, slide physics/contact and the 22-unit lead cap remain unchanged.
- Corrected the confirmed .328 Scream browser fixture: after measuring the real CPU JUMP rise, restore the caster's owner/hold/cooldown preconditions before invoking the existing resolver. No production Scream defect was observed.
- Added mirrored actual-engine Node and desktop/simulated-touch Chromium regressions for both teams, Agility ordering, exact neutral linear fallback, human slide/PASS poke isolation and the 22-unit cap.
- The first .329 preflight exposed a missing engine-local turn helper (the analogous helper existed only in AI.js) and two README headings still on .328. Added the bounded helper to engine.js, synchronized both headings, and corrected the neutral assertion to compare the normalized linear aim point.

## Next smallest action
Finish .329 Modular QA and Full Regression Census on its exact SHA. Fix every confirmed failure; allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Then move to the next unfinished backlog item outside repeated Breath or routine LAN/P2P work.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection open. No authenticated online-hosting claim.

## Evidence
- Parent .328 exact dev SHA: `a9ff641515d1e56cd1be19af0644f5ed2c9fd20e`.
- First .329 preflight: Modular QA #45793433811 failed 9 Node tests because the engine-local helper was missing (5 runtime call paths) and two README project headings were stale; Full Regression Census #45793433908 stopped at the same preflight failure. Corrected in this follow-up without changing the .329 player-facing version.
- Modular QA #45791392543: passed.
- Full Regression Census #45791392611: preflight/preview passed; Node shards 0/2/3 passed; browser shard 2 failed magic_scream_ai_counter_browser_qa.py in the selected-human backup fixture; Node shard 1 and browser shards 1/3 were still running at last inspection.
- Main SHA: `da3146d83113f82835a6095d0ed814d75d0dbc4c`; Pages #45782390375 and independent main Census #45782401424 passed.
- GitHub REST reports main.protected=false; #87 remains unresolved. #48 remains open; no physical two-phone certification.

## Cleanup
Only this agent checkpoint was updated. No LAN/P2P, roster, art, save-schema or online-hosting changes.
