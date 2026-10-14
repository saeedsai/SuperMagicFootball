# Release test report — Supermagic Football v0.8.23.1 Alpha

**Date:** 14 October 2026. Tests were executed against the updated editable source and regenerated standalone `play.html` after the new seventh BPW squad was installed.

| Test category | Run command / scope | Outcome |
|---|---|---|
| Inherited Node gameplay suite + All-Time | `npm test`: 54 explicit scripts (53 inherited + `v08231_bpw_alltime.mjs`) | **54/54 PASS** |
| Release/inventory/controls contracts | `node tests/master_contracts.mjs` | **PASS**; Node master runner totals **55/55** with this extra script — 223 teams, 2,676 players, six formations, four actions, 375-case catalog |
| v0.8.23 Audio Node regression | `node tests/v0823_audio.mjs` | **PASS** |
| BPW all-time Node acceptance | `node tests/v08231_bpw_alltime.mjs` (also in npm test) | **PASS** — complete user roster, roles, ratings, identity, indices, 2-sided engine startup |
| Browser full master, six sequential shards | `python tests/run_master_suite.py --profile full --category browser --shard-count 6 --shard-index N --timeout 65 --tag v08231_final`, N=0…5 | **36/36 PASS**, six groups of 6 each |
| Dedicated new browser BPW all-time | `v08231_bpw_alltime_browser_qa.py` (included in 36) | **PASS** desktop Chromium & simulated touch, filtering, 12 faces, formations, card badges, no page errors |
| Portable HTML | `python tests/build.py` | **PASS**; generated directly from current source and embedded CSS |

Six detailed per-script JSON/Markdown groups in `docs/qa_runs/master_full_browser_s0of6_v08231_final.*` through `s5of6_v08231_final.*`. New tests check 2 GK, 3 DF, 4 MF, 3 FW, all ten 99 and two 98 ratings, exact order and names, nine countries, stable team IDs, six existing WC teams, original crest, no invented age, home+away keeper, all formations, four buttons and UI rendering.

**Repaired test incompatibilities:** existing browser tests were hard-coded to `0.8.23-alpha`, 222 teams or save export `0.8.23`; upgraded assertions to actual 0.8.23.1 and 223 teams, while legacy WC-only fixture assertions remain 222 before the seventh team is registered. Old service-worker cache release tag updated. Initially a new browser test incorrectly attempted to select the sole all-time team on both home and away; adjusted it to verify home and away selectors with a distinct opponent. Subsequent complete browser suite PASS. These were test expectations and a test design flaw, not proven gameplay defects.

**Not certified:** 375 cataloged QA acceptance scenarios are **not individually executed**; hardware iOS/Android and gamepads, Firefox/Safari, actual speaker output and iOS Web Audio resume, origin-backed `localStorage`, longer continuous sessions, live crowds/crossfade and a single monolithic 36-script browser run. A script PASS is not proof of every manual acceptance case. Existing game audio functionality and ball physics unchanged by this release.
