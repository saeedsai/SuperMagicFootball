# SuperMagicFootball — sole developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-22

## Mission

## Safety and invariants
Only designated developer. Preserve 223 teams, 2676 players, 2 GK / 3 DF / 4 MF / 3 FW, six formations, four action buttons, Career/Cup ten slots, offline saves, SD09 and About-only four-field version. Never bypass safety, overwrite concurrent commits, or force-push.

## Current checkpoint
### Latest development: Cup SAVE-103
- Earlier 0.9.1.0 Pages #39745059993 and main Full Census #39745060373 (4 Node/4 Chromium) were green; these **do not** certify current 0.9.2.0 candidate.
- Cup export/import transport on dev, with checksum, validated vault, explicit overwrite and rollback: `af72dca`, `0573935`. Imported team availability is checked *before* persistence.
- Cup UI buttons + file chooser/download + overwrite confirmation: `c103c69` and `77fb508`.
- Release candidate now labeled **0.9.2.0** via package, release module, README, offline service worker, About and version contracts. Last cache SHA `db20fd0`; UI tests + validation `e3b830a9460a1243954195a3350f8be9e3ceb645`.
- **NOT CERTIFIED/NOT DEPLOYED**: connector combined statuses empty and PR workflow search returned no runs for test commit. Node/Chromium shards, Modular QA, dev→main promotion, main/Pages hosted SHA-256 smoke not verified. No release claim.

## Next smallest action
### Next five steps
1. Obtain exact current dev/main SHA and current CI results (connector search may lag); diagnose any red builds and repair tests with fresh blob SHAs.
2. Run focused Cup backup, About/version tests, all 4 Node + 4 Chromium shards, Modular QA; verify UI desktop/mobile and save rollback.
3. Only promote exact green head; confirm main SHA and hosted Pages SHA-256 bytes; keep 0.9.2.0 as a candidate until then.
4. Implement bounded Player Studio ability selector and persistence; separate release after gates.
5. Add a counterable four-button Trick, then LAN two-client MVP and graphics independently.

## Ownership and exclusions
Only edit this checkpoint, under 4 KiB; do not open other agents' memory.

## Evidence
- Studio equipment UI `65b066e4`, 0.9.3.0 candidate package/release/README/SW + contract tests, UI test `a3d34ed9`, log `4f61387e`; CI full 4+4, Modular QA, protected main and Pages smoke not independently verified. Never claim deployed.
- Studio read-only defence eligibility corrected for engine `.src` and high-rated unassigned DF with explicit-level precedence: `6b2cc2fd`, `d5e37287`; test contracts `ed0ced09`, `4593285b`; log `d9c0d348`. Latest full CI/Pages unknown.
- 2026-10-22 next incremental Studio backend: read-only level-3 DF catalogue in `src/modules/abilities.js` commit `24e9f6c`; test source commit `8e86182`. No selectable UI/equipment yet, no player-facing release bump. CI unverified.
- 2026-10-22 SAVE-103 input-size hardening `690cb849`, regression source `a0f311b`; central log `0062a92e`. No new 4+4/Modular QA or main/Pages proof available from this connector.
- 2026-10-22 repaired required own-memory headings: commit `1bfd85b5adf6686cbddb303763f1b9e7c6154a28`.
- SAVE-103 preview core `26c4a94d`, UI `84039997`, focused test source `4f8a0b19`, release notes `2ad62412`, README `c391eb12`, newline UI fix `5cd8eb43`.
- These GitHub source commits were accepted; full 4+4 and Modular QA outcomes for latest head are not yet verified. Do not promote without green exact-head evidence.
Latest failed preflight: Full Regression Census 39752239767; specific checkpoint heading contract diagnosed from tests/project_memory_contract.test.cjs.

## Cleanup
Keep checkpoint below 4 KiB, no other agents' memory access.

## Permanent branch instruction
Never create any new branch. All source, test and documentation work must be committed exclusively to `dev`; `main` is only for green protected release promotion. Allowed permanent branches: `dev` and `main`. Do not use temporary work/feature branches.
