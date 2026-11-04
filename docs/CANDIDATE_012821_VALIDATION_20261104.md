# Candidate 0.12.81.21 validation — 4 November 2026

## Changes

- **SAVE-103 / Cup league schedules:** Cup slot, modular and standalone tournament validators now require every scheduled league round to cover all group participants once, with exactly one bye in an odd-sized group. A checksum-valid campaign missing any match is rejected before the skipped game can disappear from standings. Empty legacy schedules remain compatible, including the historical `[[]]` sentinel used by existing saved Cup history.
- **Malformed Cup round fail-closed behavior:** the slot validator now rejects non-array round containers before group iteration instead of throwing. Regression coverage checks `[null]` and `[[], null]` against all three validator entry points.
- **Gameplay regression coverage:** A deterministic real-engine test proves temporary shot weakness changes a downstream tackle stun, then returns to the baseline result after the real weakness timer expires. No gameplay formula or controls changed.

## Validation

- `node --test tests/cup_tournament_state_validation.test.cjs tests/cup_backup_integrity.test.cjs tests/shot_impact_gameplay.test.cjs` — **21/21 passed**.
- `node --test tests/cup_backup_integrity.test.cjs tests/cup_tournament_state_validation.test.cjs` — **16/16 passed**, including a checksum-valid missing-fixture backup rejected by preview and import with storage unchanged.
- `python -X utf8 scripts/build.py` — passed (4,995,862 bundled JS characters; 5,117,441 HTML characters).
- `node --test tests/*.test.cjs` — **1,961/1,961 passed** after the final validator guard.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21 passed**.
- `python -X utf8 scripts/validate_data.py` — passed, 223 teams, 2,676 players and 84 avatar presets; zero errors.
- Browser flows passed on desktop and simulated touch: Cup history markup/legacy sentinel, empty active Cup restoration, and partial save preservation for Career/Cup.
- Candidate `.20` four-shard portable-Chromium census: **229/229 passed**, with audited complete coverage. Two `.21` censuses each selected all 229 scripts, but neither was fully clean: after fixtures were corrected, the retry census had 226 passes and three failures (an aerial timeout, a transient partial-save import read error, and a Player Studio gamepad assertion). Each of those routes passed on isolated desktop/touch reruns; the corrected Cup backup, all eight save-origin restart scenarios, and LAN two-browser tests also passed. The shard audit rejects the census because of these run failures; exact-coverage inspection confirms all 229 distinct scripts were selected once. No clean `.21` full census is claimed.
- Cup history, backup restart, empty active-slot and partial-save preservation flows pass desktop and simulated touch. The initial Cup-history run exposed a legacy `[[]]` sentinel rejected by validation; the validators were corrected and rebuilt.

Candidate .21 is local and not deployed. Owner visual/device acceptance, exact-head CI, hosted smoke, protected promotion, real-network/two-device multiplayer and server readiness remain separate gates.
