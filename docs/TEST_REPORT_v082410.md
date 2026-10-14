# Supermagic Football — v0.8.24.10 Alpha final test report

**Build:** 0.8.24.10-alpha. **Date:** 14 October 2026. **Baseline:** v0.8.24.9 source ZIP.

## Executed regression suites

| Suite | Final result | Evidence |
|---|---|---|
| `npm test` | **68 / 68 passed** | Node console log (`smf_082410_node_final.log` retained separately at build time) |
| `node tests/master_contracts.mjs` | **1 / 1 passed** | Same final Node log; release invariants + 438 requirements catalog |
| Chromium browser regression | **40 / 40 passed** | Eight complete five-script shards, `docs/qa_runs/*v082410_release.json` and `QA_EXECUTION_v082410.json` |
| Complete scripted controller-versus-CPU replays | **15 / 15 completed** | `HUMAN_CPU_REGULATION_REPLAYS_v082410.json` |
| Repeat-seed determinism check | **Passed** | `tests/v082410_human_cpu_replay.mjs` |
| Keeper shot commitment + sudden-death rules | **Passed** | `tests/v082410_penalty_fairness.mjs` |
| Standalone build, ZIP integrity, hashes | **Passed** | Final archive manifest and comparison at packaging time |
| QA catalog | **438 documented** | **Not 438 independently executed tests** |

## Defects corrected

1. In the baseline penalty shootout, the goalkeeper continued tracking the known target throughout ball flight, making penalties effectively impossible to score. In a failing seed, 38 straight attempts were unsuccessful before the test hit its time bound. The goalkeeper now commits to a saving lane when the ball launches. This changes only penalty behavior, not ordinary keeper reach, Super Shots, or shot momentum.
2. Sudden death could declare a winner following a single extra kick, without a matching opponent attempt. Sudden-death winners now require a **completed pair** and unequal totals; mathematically insurmountable leads in the first five still end early.

## Single-player CPU scripted replay data

The controller drives actual Pass/Shoot/Dribble/Jump action transitions with the live GameEngine; matches include both halves, halftime, moving defenders and keepers, and post-draw penalty resolution. Configurations cover five difficulty settings, three fixture/policy/formation combinations, Rain/Clear weather and seeded runs (15 complete matches). The same config reproduces identical results.

| CPU setting | Replays | Home regulation goals | CPU regulation goals | CPU goalkeeper saves | Regulation draws / penalties |
|---|---:|---:|---:|---:|---:|
| Rookie | 3 | 5 | 0 | 34 | 0 |
| Easy | 3 | 3 | 0 | 28 | 1 |
| Normal | 3 | 0 | 0 | 19 | 3 |
| Hard | 3 | 0 | 2 | 14 | 2 |
| Expert | 3 | 0 | 3 | 12 | 1 |

**Interpretation:** These statistics demonstrate a reproducible playing harness and suggest a difficulty gradient, but they do **not** establish real human win rates. Three fixtures per difficulty, non-random policy choices, possession proxies based on ball ownership, and events classed as all kicks rather than only shots limit inference. Keeper saves may be repeated events and not distinct scoring opportunities. No GK power/reach nerf or CPU artificial buff was made.

## Existing features protected

Five top-level menu categories, exactly four gameplay actions, six approved formations, six BPW World Cup teams plus All-Time Legendary 12, saved-game formats, four-action Super Attack sequences, offline audio, goalkeeper ability fairness and career/competition routes are covered by inherited scripts. Physical Android/iOS gamepads, real touch hardware, Safari/Firefox, local-origin audio persistence and low-end performance remain **unverified**.

## Cleanup and release

Generated test screenshots, obsolete duplicate per-shard QA runs and Python caches were excluded; historical specifications and changelogs, original menu handoff and Super Defense/Tricks deferred backlog retained. See `ARCHIVE_AND_ACTIVE_FILES.md`.
