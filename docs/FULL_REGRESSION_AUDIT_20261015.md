# SuperMagic Football — Full Regression Audit (15 October 2026)

## Tested revision and evidence

- Repository: `saeedsai/SuperMagicFootball`, branch `dev`
- Full regression baseline: `dbe15f4660f92afc7200880803a4063ebff2b6da`
- Focused browser retest: `227e75f12b817dab84d5e0a0644a0c49ffb2b981` (test workflow addition only; gameplay data unchanged)
- Full 9-job audit: https://github.com/saeedsai/SuperMagicFootball/actions/runs/38765128293
- Corrected current-browser audit: https://github.com/saeedsai/SuperMagicFootball/actions/runs/38766489141

**Overall result: NOT FULLY GREEN.** Current contracts and roster integrity pass, but extended legacy suites and the per-view beard comparison do not all pass.

## Preflight / current contracts — PASS

| Check | Result |
|---|---|
| `scripts/validate_data.py` | PASS: 223 teams, 2,676 player slots, 84 avatar presets, 0 JSON/data errors |
| `scripts/build.py` test fixture | PASS |
| `node --test tests/*.test.cjs` | PASS: 25/25 active Node subtests |
| `node tests/club26_fc27_roster.mjs` | PASS: 32 Club26 clubs, 384 players, 2GK/3DF/4MF/3FW, no fictional entries, runtime/data parity |
| `python3 -m compileall -q scripts tests` | PASS |

## Full Node script census

81 individual scripts executed: **74 PASS, 7 FAIL, 0 TIMEOUT, 0 NOT RUN.** Successful modules include AI and tactics, career, input, keeper prediction/fairness, match simulation, player stats, roster reconciliation, collisions, aerial play, super shots, save-related logic, graphics contract tests and CPU replay tests.

| Failing script | Diagnosis | Category |
|---|---|---|
| `master_contracts.mjs` | Hardcoded v0.8.24.12-alpha release expected instead of current v0.8.25.32 | Stale test |
| `v08192_focus_keeper.mjs` | Keeper/focus assertion failed | Needs behavior investigation in active modular engine |
| `v08206_canonical_identity.mjs` | Snapshot expected 141 name-collision groups; current result 145 | Stale snapshot / review new collisions |
| `v08206_roster_inventory.mjs` | Expected historical fictional count and provenance before Club26 replacements | Stale snapshot |
| `v08232_audio_reliability.mjs` | Asserts older `src/main.js` master-mute wiring | Legacy integration expectation; verify active audio path |
| `v0823_audio.mjs` | Expects removed root `play.html`; modern fixture is `tests/.generated/play.html` | Legacy prerequisite |
| `v08245_release_alignment.mjs` | Legacy version assertion incompatible with current release | Stale test |

Do not infer seven production defects from seven failed historical scripts; also do not dismiss the keeper/audio assertions without verifying active runtime behavior.

## Full browser script census — first run

46 scripts executed under Linux Chromium / Playwright: **4 PASS, 41 FAIL, 1 TIMEOUT, 0 NOT RUN**.

- 39 failures occurred at `Page.wait_for_function` readiness checks. Many older scripts hardcode retired startup/version expectations, so these are browser harness compatibility blockers rather than evidence of 39 distinct gameplay defects.
- 2 tests reached their end but failed to write results because `docs/qa_runs_v082530` was missing.
- 1 script, `ai_combos_browser_qa.py`, exceeded the 75-second timeout.
- Passed: `beard_customization_v082528.py`, `studio_eight_view_gallery_v082532.py`, `performance_loader_browser_v082531.py`, `v060_qa.py`.

## Corrected current-browser rerun

The missing result directory was created, and the two current scripts were rerun against the same gameplay code:

- `character_identity_persistence_v082529.py`: **13 PASS, 0 FAIL, 0 TIMEOUT; 3 NOT EXECUTED**. Desktop and simulated-touch player identities, eight-view combination matrix, Player Studio UI and local storage write checks passed. Three hosted-origin / process-restart / physical-device checks were explicitly not executed.
- `graphics_integration_v082522.py`: **17 PASS, 2 FAIL**. The 12,096-draw, 108-player, 8-direction, 7-pose, 2-layout sampled renderer stress check passed. Tattoo visibility, 17 appearance-option categories, Studio rotation and customization saves passed. The one failing check was **beard-style visibility in all eight directions**, once on desktop and once on simulated touch. It returns `False` without identifying individual angles.

The current renderer contains both beard view-specific geometry and a separate draw path that omits beard for pure rear views. A directional diagnostic is required to determine whether the failing all-eight hash assertion is overly strict for back views or exposes a real discrepancy. **Do not mark beard rendering fully verified.**

## Priority follow-up

1. **P1 — Beard regression:** isolate failed directions and player/face-shape combinations; compare expected behind-the-head occlusion with the active renderer. Fix either geometry or test semantics, then rerun all 8 views on multiple face shapes.
2. **P1 — Browser suite modernization:** replace hardcoded boot-version waits with stable current modular game readiness probes, then rerun all 39 blocked scripts. Never convert blocked tests to passes.
3. **P2 — Keeper and audio:** investigate historical `v08192_focus_keeper.mjs` and `v08232_audio_reliability.mjs` against current `src/modules`, adding equivalent current-runtime regressions if needed.
4. **P2 — QA maintenance:** update historical inventory/identity/version snapshots to reflect intentional roster and release changes; move removed root `play.html` checks to `tests/.generated/play.html` where appropriate.
5. **P2 — AI timeout:** investigate `ai_combos_browser_qa.py` performance and cleanup; retry with stable browser lifecycle and captured traces.

## Caveats and scope limits

- Counts are **script executions** except the explicitly labeled 25 Node *subtests*, 13 identity *assertions*, and 19 graphics *assertions*. Do not combine unlike units into one percent.
- QA catalog cases are not individually certified by these executions.
- Mobile tests used simulated touch under Chromium, not physical Android/iOS.
- Hosted Pages, refresh persistence, offline/PWA deployment and device controllers were not exercised.
- EA FC27 external player-rating accuracy and club affiliation remain unverified editorial data concerns, separate from this software test run.

## Committed QA additions

- `tests/full_regression_runner.py` — discovered Node / browser scripts, isolation, timeouts and per-script JSON/Markdown.
- `.github/workflows/full-regression-census.yml` — preflight plus four Node shards and four browser shards with artifacts.
- `.github/workflows/current-player-browser-qa.yml` — corrected-output current graphics/identity rerun with reports.

**Status:** regression executed, findings documented, no game source changes or unverified “fixes” applied in this audit.
