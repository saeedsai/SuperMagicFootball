# Supermagic Football v0.8.24.12 — executed regression report

**Date:** 14 October 2026. **Target:** `0.8.24.12-alpha`.

| Suite | Unique scripts passed | Fail | Timed out in completed batches | Unexecuted |
|---|---:|---:|---:|---:|
| Node (including master contract) | **74/74** | 0 | 0 | 0 |
| Chromium browser desktop/touch regressions | **40/40** | 0 | 0 | 0 |
| Additional seeded controller replay cases | **30/30 fixtures** | 0 | 0 | 0 |

**Execution note:** A single chained `npm test` call exceeded the run environment's timeout near the end. All **74 distinct Node scripts** were then successfully executed in bounded independent batches; some scripts were additionally rerun. The browser suite completed across eight five-script shards, with **40 distinct scripts** passing. The machine-readable summary is `docs/QA_EXECUTION_v082412.json`, aggregating individual shard reports before release cleanup. The 450 QA catalog rows are **requirements**, not 450 separately executed tests. Synthetic replay fixtures are nested test scenarios, not browser/Node script counts.

## New acceptance and regression coverage

- `v082412_release_context.mjs`: distance/pressure/keeper/fatigue geometry snapshot, stimulated defender exclusion, null handling, mirror side and non-mutation, event compatibility, and exclusion of passes from shot buckets.
- `v082412_context_replay.mjs`: six unique home/away directions × five difficulty settings, two halves and controlled shootouts, multiple policies/formations/weather, deterministic repeated seed, finite physics, and release geometry for every observed shot.
- `docs/HUMAN_CPU_CONTEXT_REPLAYS_v082412.json`: event-backed machine-readable 30-match cohort. Historic 45-match cohort retained separately.

## Release parity and preservation

- Version and save alignment contract passed; PWA cache key updated.
- Standalone HTML generated; final archive SHA-256/ZIP checks are recorded in `FILE_MANIFEST_SHA256.txt` and final release packaging verification.
- Existing teams (including BPW All-Time 12), formations, four actions, five top menus, Super Shot/Header/Bicycle sequences, career, audio and save behaviors are covered by preserved tests.

## Open validation gaps

- No physical Android, iOS, real gamepad, Bluetooth or low-end mobile performance tests.
- Firefox/Safari and normal-origin audio persistence not certified.
- Scripted-controller results and arbitrary pressure thresholds are not human win rates, or enough to justify goalkeeper or Super Shot retuning.
- Next milestones: v0.8.25 BPW original personality/animations, continued varied balance studies and hardware/browser QA; preserve Super Defense/Tricks backlog for later.
