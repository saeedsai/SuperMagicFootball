# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23 Europe/Stockholm

## Mission
Keep hourly bounded increments on existing `dev` regardless of release blockers; never force-push or bypass protections; only promote exact green head.

## Current checkpoint
- Last confirmed previous certified build: f9637876d632b633cceca8f320bb11aa31e3c3ff (Census 39992218500, Modular 39992218111, main Census 39993883624, Pages 39993883682). Not proof of current candidate.
- Candidate 0.9.28.0: Alex #1, Leo #2 and Kwame #3 now have transparent authored front/rear quarter SVGs loaded in live match renderer, embedded in browser fixture and precached offline. Diego #4 still lacks authored quarters. Bespoke action animation remains unfinished.
- New Kwame quarter test assertions and SVG contract. Isolated V8 source/runtime QA 13/13 passed; actual Node/Chromium CI and visual acceptance unverified. GitHub DNS unavailable in local container; use connected GitHub app and hosted Actions evidence.
- Preserve 223 teams / 2676 players, six formations, exactly four gameplay buttons, 10 Career/Cup slots, SD09, legacy saves and offline.

## Next five actions
1. Inspect exact dev/main heads, latest CI jobs; fix any failures on dev.
2. Run 4 Node + 4 Chromium and Modular QA on exact dev head; obtain screenshot artifacts.
3. Verify Kwame quarter visual alignment/transparency and fix defects.
4. Author Diego #4 quarter sprites; continue bounded LAN/Player Studio features while release pending.
5. Promote only green exact-head dev via protected workflow; verify main and Pages SHA-256 hosted smoke.

## Constraints
Only own checkpoint; no extra branches, force-push, bypass, invented QA or deployment claims.
