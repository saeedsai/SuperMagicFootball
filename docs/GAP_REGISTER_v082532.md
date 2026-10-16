# Gap register — integrated multi-agent development, 15 October 2026

| Priority | Domain | Status / next action |
| --- | --- | --- |
| HIGH | Graphics resemblance and projections | Character-art v2 and previous eight-view fixes are live. Continue visually reviewing named-player shape/hair/beard/accessory/face combinations, with automated contact sheets and human artistic QA. |
| HIGH | Gameplay mechanics configuration | Seven coefficients previously moved to JSON; many pass, collision, and keeper scalars remain JS. Extract them carefully with valid bounds and unchanged default match outcomes. |
| MEDIUM | Parallel JSON edit conflicts | **Foundational protection delivered:** new three-way semantic merge checker detects competing edits and stable ID/order changes before merge. Remaining: reviewed editor-specific previews and CI integration with agent PRs. |
| MEDIUM | Roster source verification | Club26 384 named entries, 290 agent FC27-comparison ratings and 94 editorial/provisional; transfer registration, authenticity and exact EA FC27 stats require independent verification. |
| MEDIUM | Career and tactics usability | Improve available squad maintenance and coaching hints without migrating IDs or save schema. |
| RESOLVED | Duplicate rear hairstyle silhouettes / Studio simultaneous preview | Earlier Studio pass ensured 13/13 rear hairstyles distinguishable and eight-view editor gallery remains. |
| FAR FUTURE | Hosted browser/saves/restart/PWA | Owner explicitly deferred exhaustive hosting/saves and real-origin process-restart persistence. Routine GitHub deployments still checked. |
| FAR FUTURE | Physical mobile devices and FPS | iOS/Android physical-device UX, offline installation and performance certification deferred by owner. |
| LONG RANGE | Worldwide rosters, Super Defense, Tricks, network | No scope change until rescheduled. |
## 2026-10-16 mechanics extraction
**Closed in this cycle:** editable bounded pass launch velocity coefficients and goalkeeper dive cooldown coefficients, with parity tests and runtime fail-fast validation. **Still open:** remaining inlined player contact, ball friction, keeper reaction/reach and pass error coefficients; baseline parity calibration on seed-matched match suites. FC27 provenance/graphics visual QC belong to parallel agents. Deferred as owner directed: physical Android/iOS PWA/FPS and exhaustive hosted restart/save recovery.

## 16 October 2026 — merge safety gap adjustment

**Resolved:** the three-way merge now rejects same-ID, same-order numeric team-index drift even if both agents agree, and produces bounded per-side, stable-ID field-diff previews in `changeSummary`. See `docs/QA_PARALLEL_MERGE_CHECKPOINT_20261016.md`. **Still open:** integration of source/provenance-aware editor reviews and appearance-preset referential checks into the merge workflow. The change did not alter 2026 player rosters or visual likeness; those independent gaps remain.

## Owner-prioritized goalkeeper and Super Shot gaps (16 October 2026)

| P0 | Super Shot fairness | Initial 4% slower launch and +8% fatigue implemented; verify match-level goal/save fairness on seeded replays and both attack directions. |
| P0 | More frequent goalkeeper dives | **OPEN**: instrument candidate/actual dives, tune approach phase after mirrored corner/save benchmark; don't reintroduce the old early-contact bug. |
| P0 | Keeper can hold ball in hands | **PARTIALLY CLOSED**: actual possessed ball is positioned at glove height during a brief hold; CPU can release safely and clears sooner under pressure. Still needs full eight-direction finger/glove grip and player-driven holding UX. |

## 16 October 2026 — concurrent graphics reference safeguard

**Closed for complete three-way merges:** orphan `player_appearances.json` team/player references now cause a blocking merge conflict, checked against the combined seven-shard player dataset **after** independently edited fields are merged. **Closed:** `--check --report` can no longer overwrite a JSON file in any input checkout, and reports are kept outside merged output trees. New tests (17 total) and exact-commit full Node/Chromium regression (144 scripts) passed; see `QA_PARALLEL_GRAPHICS_REFERENCE_20261016.md`. **Still open:** provenance-aware source conflict decisions, graphics palette semantics/visual likeness, P0 active goalkeeper diving, eight-way glove holding animation and independently source-verified player data. Whole-dataset preflight still requires `scripts/validate_data.py`; the merge helper does not make an invalid source file valid.

## Keeper diving visual-activity checkpoint — 16 October 2026

| P0 | Autonomous dive attempt timing | **INITIAL IMPLEMENTATION:** predictive credible incoming corner shots can start the goalkeeper's existing directional dive animation prior to contact, even if ultimately unsaved; attempt is single per threat and gets a recovery pose. No physical lateral intercept increase, hitbox change or phantom save. Final acceptance requires exact-commit Chromium census and hosted checks. |
| P0 | True save-rate and proactive movement | **OPEN:** unlike the new visual dive attempts, physically moving to new lanes, successful catch/deflect frequency and fair goal rates require symmetric seeded real-match benchmarks before tuning. |
| P1 | Keeper grip and release visual | **OPEN:** caught ball at glove height exists; eight-direction hand/grip and safe distribution motion remain unimplemented. |
| P1 | Comprehensive source-backed roster verification | **ONGOING BY OTHER AGENTS:** respect parallel Club26/National26 metadata snapshots and editor conflict reports. |

Do not delete historical evidence/test files just for a shorter tree; these are used in CI and prior acceptance traces.

## 16 October 2026 — measured dive activity (not yet save-rate calibration)

**Resolved:** optional event-based calibration can correlate a goalkeeper's anticipatory `keeperDiveAttempt` with its actual `keeperContact` within each real shot attempt, and reports both unmatched/missed categories. Ordinary and Super Shot counts and defending direction are separated; duplicate attempt frames count once per attempt. Four new tests and 66/66 active Node QA passed on source checkpoint `b7d922aa`; full Chromium historical regression was queued when this note was prepared. **Still open P0:** collect seeded mirrored *live match* goalie events, compare goal/save fairness, implement only a justified bounded keeper physical-approach change. **Still open P1:** held-ball glove grip/release in eight views. This instrumentation does not change visible match play. Other concurrent roster QA/source claims remain separately owned.
