# SuperMagicFootball — sole developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-22

## Mission
Sole authorized developer. Preserve About-only four-part version, 223 teams/2676 players, 2GK/3DF/4MF/3FW, six formations, four buttons, Career/Cup ten slots, offline compatibility and SD09.

## Latest development
- Previous certified 0.9.1.0 release had green main Full Census #39745060373 (preflight, hosted smoke, 4 Node, 4 Chromium). Pages #39745059993 succeeded.
- Subsequent release-policy commits include `ee9215166dc1d4bcc54bd9b6d3fd97c55408f848` repairing README contract test syntax; current CI and exact head still require independent verification.
- SAVE-103 backup **core only** committed on dev in `af72dca4fdcad14c6648292741f58d5016575fe0`: JSON envelope, integrity checksum, strict validation, explicit overwrite, existing atomic storage rollback.
- SAVE-103 regression test source committed in `cd4b5930dfb9c91a9ba60d9495483d7da71e476e`. No completed CI or hosted deployment is claimed for these commits.
- Version remains 0.9.1.0 until a fully tested player-facing UI update has a coordinated increment. Do not represent backend-only SAVE-103 as released.

## Next five steps
1. Fetch exact dev/main heads and CI; fix any red Node/Chromium/Modular QA, especially SAVE-103 tests.
2. Add safe Cup SAVE-103 UI export/download and explicit import/overwrite confirmation; validate browser/desktop/touch; bump the installed four-part version and README/release/SW together.
3. Re-run all 4 Node and 4 Chromium shards plus Modular QA; promote only on green exact-head gate; verify main and Pages SHA-256 smoke.
4. Player Studio ability selector with eligibility, persistence and defensive counterplay.
5. Four-button Trick, then 2-client LAN and graphics in separate increments.

## Ownership and cleanup
Only edit this checkpoint; do not read other agents' memories. No force push, security bypass, unverified QA claims, or concurrent overwrite. Keep under 4 KiB.
