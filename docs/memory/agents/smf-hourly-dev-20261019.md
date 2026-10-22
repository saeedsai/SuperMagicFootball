# SuperMagicFootball — sole developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-22

## Mission
Sole authorized developer. Preserve About-only four-part installed version, 223 teams/2676 players, 2GK/3DF/4MF/3FW, six formations, four buttons, Career/Cup ten slots, offline compatibility and SD09.

## Current checkpoint
- Exact `dev` and `main` were both `d511362f74cfb4f0e93eaf5fdf28331d23091c3d` after green dev Census #39744415960 (4 Node + 4 Chromium, preflight, preview, promotion) and Modular QA #39744415918.
- Pages deployment #39745059993 succeeded on same main SHA. Main Census #39745060373 hosted SHA-256 smoke, preflight, 4 Node shards succeeded; 4 Chromium shards were still running at last check.
- Cup COPY 0.9.1.0 now promoted and hosted: first empty slot, no overwrite, unchanged active campaign; package/release/SW/notes synchronized. Do not advance version for docs-only commits.
- A legitimate Contents API attempt to append the central development log was rejected by platform safety checks with no detailed decision trace; no bypass or force operation attempted.

## Next smallest action
1. Re-fetch dev/main SHAs and final main 4+4 Census result; fix any red exact-head CI.
2. Record 0.9.1.0 certification in central log using authorized, SHA-checked path only; preserve evidence if rejected.
3. SAVE-103 Cup backup/import roundtrip, corruption and rollback tests; bump version only for player-facing update.
4. Bounded Player Studio ability selector with eligibility and persistence tests.
5. Counterable four-button Trick, then two-client LAN MVP and graphics in separate QA-certified increments.

## Ownership and exclusions
Only own checkpoint may be edited. Never read/edit other agents' memories, bypass safety, force push, overwrite concurrent work or claim unverified results.

## Evidence
Dev Census #39744415960 success; Modular QA #39744415918 success; main Pages #39745059993 success; main Census #39745060373 hosted smoke success. Main browser regression pending when recorded.

## Cleanup
Keep this file under 4 KiB. Extended details and failures belong in central log.
