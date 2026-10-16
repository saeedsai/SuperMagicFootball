# NATIONAL-ARGENTINA-MESSI-EMI-METADATA-B1 — sourced 2026 ages and heights

**As of:** 2026-10-16. **Session:** `dev6-argentina-national-gk-messi-20261016`. **Exclusive ownership:** `roster-national-national26_1`. **Source base:** `f0858269cf8cf1419b8b78d25f0d7be21798eda1`.

## Small requirement implemented

Two high-confidence, visibly incorrect Argentina national team (`national26_1`, game team index 14) age fields were corrected using primary club profiles, with physical heights added in the same per-player records.

| Stable player ID | Player / role | Old age | New age | Birth date | Height | Primary evidence |
|---|---|---:|---:|---|---:|---|
| `national26_1_9` | Lionel Messi / FW | 31 | **39** | 1987-06-24 | **170 cm** | [Inter Miami CF official profile](https://www.intermiamicf.com/players/lionel-messi/) (DOB 6.24.1987, listed 5 ft 7 in; 170 cm rounded) |
| `national26_1_gk_13` | Emiliano Martínez / GK | 24 | **34** | 1992-09-02 | **195 cm** | [Chelsea FC official profile](https://www.chelseafc.com/en/teams/profile/emiliano-martinez) (DOB 2 Sep 1992, 1.95 m); independently [Premier League player profile](https://www.premierleague.com/players/4245/Emiliano-Martinez/overview) |

The correction is strictly **age and height**. Player IDs, team index, 12-person roster and original player order, shirt numbers (Messi 10, Martínez 14), two GK/three DF/four MF/three FW roles, overall game ratings (93 and 95), arcade face stats, experience, source strings, shot/trick types, clubs, AI, graphic character files, UI, controls, and saved-game schema all remain unchanged. **No unsupported EA FC27 rating has been invented.** The national squad is a game roster snapshot; this batch does not claim it reproduces every current national-team selection, or change whether Messi is currently called up.

## Tests and reproduction

- `tests/argentina_national_metadata.test.cjs`: exact source-backed birthday/height, player identity, position, number, rating, all 32 national rosters' 12-player and unique-ID invariants, Argentina formation 2 GK / 3 DF / 4 MF / 3 FW, and calendar birthday boundaries (day before/day of birthday).
- `tests/argentina_national_metadata_browser_qa.py`: real modular browser game fixture for **desktop Chromium and simulated mobile touch**, compares `rosterFor` source mapping to actual `game.rosters[0]` after Quick Match init, checks stable identities and quotas, and refuses browser errors.
- The repository's `data/players/national26.json` and `tests/*national*\_browser_qa.py` push paths trigger `Full Regression Census`; no CI workflow changes needed.
- The new own per-chat checkpoint follows `docs/memory/AGENTS_INDEX.json`; initial missing `**Agent ID:**` caused a **real** failing memory contract and was corrected immediately in [memory fix commit `f6765267`](https://github.com/saeedsai/SuperMagicFootball/commit/f67652674637f53f7d1e7bb1aa20016c68889e69).

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/argentina_national_metadata.test.cjs
python3 tests/argentina_national_metadata_browser_qa.py
node --test tests/*.test.cjs
python3 tests/full_regression_runner.py --category node --shard-count 4 --shard-index 0
```

**Exact integration evidence so far:** [Modular Game Dev QA #38915344073](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344073) **171/171 active Node contracts PASS, no failures** on [birthday threshold test commit `34604826`](https://github.com/saeedsai/SuperMagicFootball/commit/34604826aa552e493885c12870cdbf9bc6b662cf). [Full Regression Census #38915344074](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344074) passed preflight and Node shards; Chromium shards were still in progress when this text was created. A full browser PASS must only be recorded after the actual jobs finish. Previous fails on early source commits were caused by this chat's **memory identity omission**, fixed and revalidated; do not erase their evidence.

## Scope, cleanup and five next batches

Only `data/players/national26.json`, the two new Argentina-specific tests, this handover, own memory checkpoint and short milestones addendum are edited in the claimed roster batch. No national/club metadata outside the two IDs, reused lineup slot, or gameplay/graphics/CI file is changed. No generated/cache/scratch paths are intentionally committed and older QA evidence must be retained; do not bulk-delete specialized plans or teammate assets.

1. Certify eight-shard Node/Chromium regression and fresh public Pages desktop/touch smoke for a descendant containing the correction, and release this national claim.
2. Independently source-check **two or three other Argentina ages/heights** using fresh primary profiles in a *new* roster claim; preserve all existing IDs and quotas.
3. Resolve active engine's Issue #7 tactical/substitution event semantics, then prioritize Issue #5 human penalty keeper control under explicit engine/UI ownership.
4. Finish the graphics owner's modular near/far-arm illustrated player animation and future goalkeeper glove grip/release while preserving fallback.
5. Test physical Android/iOS gameplay, PWA offline-update/restart, and add bounded career/halftime guidance; network multiplayer remains later.

## Release handover

Source edit: [`cda2f055`](https://github.com/saeedsai/SuperMagicFootball/commit/cda2f055a3f66f5b0a616e7119ab8fede0718ab9). Source test: [`cf82d82e`](https://github.com/saeedsai/SuperMagicFootball/commit/cf82d82e42265be4ccd97715a9962e690cfe04bc); playable browser contract [`0cf1347c`](https://github.com/saeedsai/SuperMagicFootball/commit/0cf1347c725a73d26a6d04504cb38ad4a273c709). Birthday boundary [`34604826`](https://github.com/saeedsai/SuperMagicFootball/commit/34604826aa552e493885c12870cdbf9bc6b662cf). All out-of-scope competitor changes preserved. Append final full-regression and hosted-game results here before claim release.

## Completed eight-shard acceptance

[Full Regression Census **#38915344074**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344074) finished **SUCCESS** on exact source `34604826aa552e493885c12870cdbf9bc6b662cf` including both Argentina tests, memory-identity correction, and birthday thresholds. Validator/build/preflight passed; all **130/130 historical Node scripts** passed (33 + 33 + 32 + 32) and all **71/71 Chromium scripts** passed (18 + 18 + 18 + 17), totaling **201/201 PASS** with **zero FAIL, TIMEOUT, ERROR, NOT_RUN**. `argentina_national_metadata_browser_qa.py` passed in browser shard 0 (**1.89 seconds**) on desktop and simulated touch, checking real `rosterFor` and `GameEngine` Quick Match source equality, identity and role quotas.

The preceding [active Modular QA #38915344073](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344073) passed **171/171** Node contracts, including birthday-boundary tests and the formerly failing own memory-contract identity assertion. Subsequent concurrent commits should be checked independently; this certifies the listed source SHA, not all possible later heads.

**Hosted Pages gameplay:** verified separately in an explicitly triggered live desktop/touch smoke; see appended verification status below. Source-only roster correction is not physical-device or native Safari certification.

The claimed scope is complete and can be released after the live Pages job outcome is recorded. All tracked roster identities, default tactics, arcade scores, source note fields and saved-game schemas remain preserved. Future work should source-check a new small Argentina batch under its own claim rather than re-editing this accepted one.
