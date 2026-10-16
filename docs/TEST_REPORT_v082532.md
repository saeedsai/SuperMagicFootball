# Test report — v0.8.25.32 (GitHub dev candidate)

**Baseline**: inspected remote `dev` branch `d44cb954554e344bcc02e1b8f582c2e8b21a68a8` (same source files as local v31 workspace) and preserved all stable schemas. Candidate is v0.8.25.32. GitHub push/CI result must be checked separately from local acceptance.

## Automated results

| Test set | PASS | FAIL | TIMEOUT |
|---|---:|---:|---:|
| Node assertions (`node --test tests/*.test.cjs`) | 146 | 0 | 0 |
| Inherited Chromium browser scripts | 20/20 suites | 0 | 0 |
| Modular real ES-module/JSON browser integration | 9/9 cases | 0 | 0 |
| Performance HUD + loading/retry browser checks | 11/11 cases | 0 | 0 |
| **New** eight-view Studio browser acceptance | 18/18 cases | 0 | 0 |
| Scripted entire matches | 24/24 games | 0 | 0 |
| Graphics integration (included in 20 inherited suites) | 19/19 checks, including 12,096 directional drawings | 0 | 0 |
| JSON validator (`scripts/validate_data.py`) | 223 teams / 2676 players / seven player shards | 0 | 0 |

**New visual regression reproduced before fix**: straight rear hairstyle hashes for styles 0, 9, 12 were identical (11 unique of 13). **After fix** all 13 hashes were distinct on desktop and simulated-touch, and the new gallery updated all eight portraits for a live hairstyle change. The gallery toggle preserved unsaved selector values, did not write `legend_edits` and raised no uncaught errors.

**Two development-stage test issues and resolutions**:
- New test initially assumed `about:blank` exposed localStorage; fixed by injecting a deterministic storage adapter (not a substitute for real-origin persistence).
- Existing v31 source-string version guards and one new assertion referring to a comment were updated. No runtime behavior was changed to accommodate these assertions.

**Execution context and limits**: Chromium at `/usr/bin/chromium` using inherited DOM-injected QA fixtures and direct modular-loading test; simulated touch is not a physical phone. Two large batch wrappers were interrupted, but every constituent inherited suite completed and passed when rerun in smaller batches. All 24 complete match replays separately passed. Historical 30-match supplemental suite is not available and was not claimed executed. Actual hosted Pages interaction, physical Android/iOS and browser process restart persistence remain NOT EXECUTED per environment and user-directed far-future priorities. Web retrieval of the public github.io URL was blocked; GitHub Actions deployment success alone is not proof of interactive gameplay.

**No gameplay change**: only directional artwork and optional Studio UI in this iteration. Existing team order, rosters, player IDs, formations, game input, collision calculations and saves kept intact.

**Evidence**: `docs/qa_runs_v082532/*.log`, `docs/QA_STUDIO_GALLERY_v082532.json`, `docs/Studio_Eight_Directions_v082532.png`, `docs/QA_SUMMARY_v082532.json`, `docs/QA_CATALOG_v082532.csv`.