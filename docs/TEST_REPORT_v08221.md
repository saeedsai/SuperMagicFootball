# Supermagic Football v0.8.22.1 — Test and Regression Report

**Date:** 14 October 2026  
**Source under test:** v0.8.22.1, production bundled `play.html` on desktop Chromium and simulated Android.  
**Status:** 54/54 Node scripts and 34/34 *distinct* browser scripts passed; 357 acceptance cases documented, not independently certified.

## Execution totals

| Gate | Requested | Passed | Failed | Timed out | Detail |
|---|---:|---:|---:|---:|---|
| Node regression | 54 | 54 | 0 | 0 | Includes historical source contracts + new v08221 aerial rework |
| Browser regressions | 34 | 34 | 0 | 0 | Six bounded shards; each requested script passed |
| New browser test | 1 of 34 | 1 | 0 | 0 | Nine scenarios each on desktop Chromium and simulated Android |
| Documented acceptance cases | 357 | Not assessed per case | — | — | 12 cases added for rework; future features excluded from acceptance signoff |
| Real Android/iPhone/gamepad | Not executed | — | — | — | P0 outstanding |
| One uninterrupted all-browser command | Not executed successfully | — | — | — | Earlier concurrent shard run exceeded execution budget |

## New assertions
- Four distinct aerial input outcomes with one-tap 0.32-second disambiguation and two-tap upgrade.
- Loose random aerial ball **and** player-lifted ball support head and bicycle variants.
- One ground jump + Shoot is elevated and ordinary; second airborne Jump + Shoot is Super Shot.
- Super Shot/Super Header/Super Bicycle have identical power, speed, shot behavior and ball transformation for the same player/shot conditions.
- Non-specialists deliver stronger normal strikes; defensive specialists do not accidentally inherit transformed attacks.
- Both attacking directions, possession loss, leaving reach, stun, timeout, repeat suppression and saved controls remain safe.
- Existing 4-button input conflicts, cross-order, bicycle, goalkeeper, six formations, Career, game saves, OVR and BPW category retain their regression checks.

## Issues found / fixes
1. **Conflicting previous combination:** The old Ball Lift → Jump+Shoot Super Bicycle is deliberately replaced by Ball Lift → Jump → two Dribble taps. Updated engine, Help screen and both old unit/browser regression cases. This is an intentional control change, not an accidental regression.
2. **Special-power availability:** Earlier logic allowed transforming effects regardless of shoot specialization. Updated ability check to respect `superAbility.type==='shoot'` while retaining boosted ordinary fallback.
3. **Outdated historical tests:** Older simulation tests expected every Japanese player to transform shots, including defensive specialists; updated to test actual declared abilities. An aerial browser test skipped the required Jump state and immediate-first-tap distinction; updated and rerun on desktop/mobile.
4. **Browser test execution:** The first overlapping long browser shard process exceeded the execution window. Subsequent six bounded shards completed successfully; earlier interruptions are archived and **not** reclassified as passes.

## Evidence

Node runner: `docs/qa_runs/master_full_node_s0of1_v08221_release.json`.

Browser final evidence: `docs/qa_runs/master_full_browser_s0of6_v08221_release_final.json`, `docs/qa_runs/master_full_browser_s1of6_v08221_release.json`, `docs/qa_runs/master_full_browser_s2of6_v08221_release.json`, `docs/qa_runs/master_full_browser_s3of6_v08221_release.json`, `docs/qa_runs/master_full_browser_s4of6_v08221_release_final.json`, `docs/qa_runs/master_full_browser_s5of6_v08221_release.json`.

Machine-readable consolidated summary: `docs/QA_EXECUTION_SUMMARY_v08221.json`. Historical failed/interrupted run evidence is retained in the QA runs directory. No physical hardware, Safari, Firefox, multiplayer networking, or per-case human certification was performed.
