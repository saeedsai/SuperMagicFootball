# QA report — anticipatory goalkeeper diving / roadmap audit (16 October 2026)

## Scope and important distinction
The new `tryKeeperDiveIntent` in `src/modules/engine.js` starts a directional dive and normal recovery for an inbound credible, near-goalmouth shot **before** its contact plane. This makes keeper **attempts visibly more active** even when a shot is missed. It is **not a new save event or improved physical interception model**: prediction is non-mutating, goalkeeper and ball coordinates are unchanged by intent, the existing ordinary dive/contact depth + swept checks remain the only save authority, and a 1.25-second intent cooldown prevents repeated animation on the same threatening flight.

Preserved: 4 gameplay buttons, 6 formations, 20% longer field, PWA data loader and legacy save schema, club/roster IDs and parallel artist work. The 4% Super Shot speed reduction and +8% stamina charge are unchanged.

## Actual evidence: exact-commit sharded full regression

[GitHub Actions: Full Regression Census 38879908317](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38879908317) ran on source SHA `5fbac39159069c0feba405f2c32c2f8d4bcb85f6`. It completed **SUCCESS** with **147/147 executable scripts PASS**, **0 FAIL, 0 TIMEOUT, 0 ERROR, 0 NOT_RUN**.

| Shard | PASS | FAIL | Evidence |
|---|---:|---:|---|
| Node (0/1/2/3) | 24+24+24+24 = **96** | 0 | Node path/contract and gameplay engine regression |
| Chromium (0/1/2/3) | 13+13+13+12 = **51** | 0 | Desktop / simulated touch browser suites |
| All executable scripts | **147** | **0** | Exact-run logs and archived workflow results |

New `tests/keeper_dive_intent_browser_qa.py` **PASS** in browser shard 0. It runs two defended directions × three frame rates (30/60/120 Hz) on both Chromium desktop and simulated touch, checking one anticipatory attempt, a real dive pose, no off-plane `keeperContact` or `save`, no early change to goalkeeper location or ball ownership, proper recovery and rejection of incoming trajectories that are moving away, too wide or too high.

New `tests/keeper_dive_intent.test.cjs` validates in-code separation of the guarded intent routine from real save contact geometry and verifies the intent cooldown, real dive cooldown and recovery contracts.

### Earlier failure, fix and outcome
An earlier full run [38879386518](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38879386518) had **one failure**, in the inherited `aerial_browser_qa.py` desktop hyperdash fixture (`dashCooldown = 0` after a fixed 720-ms wait under heavy CI browser load). The subsequent full census [38879908317](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38879908317) passed that same aerial test. The fixture was improved in a later `dev` commit to wait for the actual `dashCooldown>2.5` state with a bounded timeout, rather than trusting elapsed wall-clock time; this preserves the condition the test originally intended to verify. Re-check full census results on that latest change before re-certifying its exact SHA.

## Other acceptance and hosted run
- `Modular Game Dev QA` on the latest test/workflow commits: **SUCCESS** with JSON validation, generation of inline QA fixture, source-aware club contracts, Node test suite and Python compile. Check the exact commit's status: [GitHub Actions runs](https://github.com/saeedsai/SuperMagicFootball/actions).
- The GitHub Pages deployment was green for the source under this new keeper feature, and [hosted game smoke rerun 38876461817 (attempt 4)](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876461817) passed after deployment. Both Chromium desktop and simulated-touch loaded the public site (HTTP 200), visited menus, selected a team, kicked off an active match and verified +20% pitch geometry.
- The hosted smoke validates the **live URL at the time of its run**, not automatically all future agent changes. No actual iPhone/Android hardware or process restart certification was performed.

## Remaining gaps
1. Physical keeper lateral dive/movement and true save-rate changes still need measured, mirrored, match-level goal/corner/fatigue testing. Current feature is proactive visual *attempts* only.
2. Full eight-view hand grip/catch-to-throw/punt art transitions; corner scoring, shot-speed/keeper consistency, aerial and four-button controls.
3. Verified player stats, original-frame-mode parity, third-party FC27 data provenance and actor likenesses; those belong to separate workstreams.
4. Physical iOS/Android, Safari/Firefox, PWA/offline and persisted real-origin save restart QA remain deferred according to owner priority.

## Plan, cleanup and provenance
See `docs/REQUIREMENTS_REVIEW_20261016.md`, the updated master/next-five plans and `docs/ARCHIVE_AND_ACTIVE_FILES.md`. The 218-item matrix status tally (41 Done / 120 Partial / 57 Missing) is a **historical tracker tally**, not a claim of exact completion today. Historical QA evidence remains retained because the runner still consumes old scripts; no unverified files or another agent's player graphics/rosters were removed. Active/new regression scripts and service-worker revision were retained and pinned cache tests synchronized.
