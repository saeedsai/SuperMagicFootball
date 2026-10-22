# SuperMagicFootball — sole developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-22

## Mission
Sole authorized developer. Preserve About-only 0.9.1.0, 223 teams/2676 players, 2GK/3DF/4MF/3FW, six formations, four action buttons, offline save compatibility, Career 10 slots and SD09.

## Current checkpoint
- 2026-10-22 new Cup COPY into first empty slot, deep-copied with atomic persistence, no active selection change, implemented in `src/modules/cup_slots.js` + UI with `tests/cup_slot_duplicate.test.cjs`; version increment 0.9.1.0 in release/package/SW/hosted smoke. Red intermediate CI traced to stale graphics About version expectation; repaired with dynamic package version. Modular QA passed at `f7abbf9b3f6456faffee47c187c5c354c0413835` (#39742460454). Exact-head full 4+4, main and Pages require fresh verification.
- SAVE-102 referential safe-load and UI dispatcher tests reached `dev` before this iteration. Cup save cards now include competition, stage, round/Complete, labeled saved time; source `c669386007e0fe0f185138cc2e2f77f98563e672`, tests `48e25107f972d1f8683d85250fa6c43b26967b59`, central log `d44c8bf50d26175a439bc3621a15457ca37f5234`. Full exact-head CI, automatic promotion and hosted smoke are not yet certified.
- Starting baseline dev/main `755e5905089ff6427bb117d526c1e13f26ffdcb2` was green (Full Census #39677469499, Modular QA #39676866641).
- Platform safety rejections previously blocked complete UI file write and branch ref update; exact safety rule is unknown. GitHub push access true, dev not protected, previous CI green. Standard SHA-checked single-file Contents operations now demonstrably succeed without bypass.
- SAVE-102 commits: safe-load logic `e59d237444f66c156bc3e4cbd9fc6b164eb63477`, five tests `8473844229d8b8bae145ac1357b7ca6645f2841e`, UI validation-before-load `83e43bf0aae05199809845aab3d81f522252ca50`, three UI tests `44923bf6505d5335418fe698f29a6b420583e23b`.
- Central log updated. Exact final SHA CI, main and Pages certification required before shipped claim.

## Next smallest action
1. Re-fetch exact dev/main heads and examine red or running exact-head CI.
2. Verify 5+3 focused SAVE-102 tests, version/About and all 4 Node+4 Chromium regression shards with Modular QA; correct legitimate failures.
3. Promote to main only with green exact-head checks; no forced ref moves.
4. Verify actual Pages deployment and independent hosted HTML/JS/CSS smoke.
5. Next: Cup save export/import integrity, then Player Studio abilities, four-button Tricks, two-client LAN and graphics, with a version increment for every shipped game update.

## Ownership and exclusions
Sole game development; never edit other agents' private memories, bypass platform safety, force push, overwrite concurrent changes or claim unverified deployment.

## Evidence
Standard writes to dev succeeded with new blob SHAs. Modular QA on `83e43bf0aae05199809845aab3d81f522252ca50` passed (#39738067047). Final exact-head 4+4 results not yet certified at this checkpoint. The internal safety decision trace is unavailable.

## Cleanup
Keep this checkpoint under 4KiB; longer history and blockers belong in the central development log.
