# Supermagic Football — v0.8.24.8 Alpha test report

**Build and test date:** 2026-10-14. **Source baseline:** v0.8.24.7 Menu Alpha.

## Executed regression suites

| Scope | Result | Execution basis |
|---|---|---|
| Inherited + new Node (`npm test`) | **64/64 passing** | Existing 63 `npm test` scripts plus one new v08248 flight/ground test |
| Master QA contract (`node tests/master_contracts.mjs`) | **PASS** | Separate contract run; 65 distinct Node scripts total |
| Release/browser version guard | **PASS** | Included in Node suite; 45 release references scanned |
| Headless Chromium desktop + simulated-touch UI/play | **40/40 passing** | Eight independently completed five-script shards via `run_master_suite.py` |
| New controlled game-engine flight fixtures | **500 passing** | 380 ordinary shot trials, 120 pass trials across difficulty, direction and step sizes |
| Rolling ground-ball frame checks | **3 passing** | 30, 60 and 120Hz (within integration tolerance) |
| QA requirement catalog | **424 documented** | NOT 424 individually executed tests |

The initial browser shard 2 invocation was interrupted after the first script passed; a complete five-script retry passed. All other seven shards completed on first run. Exact 8 final result files are in `docs/qa_runs/` and `QA_EXECUTION_v08248.json`.

## Measured flight outcomes and limitations

- Ordinary goals toward a goalkeeper-free lane in 20-seed reference cases by difficulty 0–4 (CPU as shooter): **16, 18, 19, 20, 20** logged goals respectively in the overlapping controlled scenario group. These goal counts are mildly increasing in an artificially open lane, but do NOT establish match-level CPU fairness or real goalkeeper save rates.
- At 30/60/120Hz, rolling horizontal speed after one simulation second was consistent to floating-point precision, while approximate positions vary modestly under discrete integration.
- Shot momentum changes are confined to ordinary shots for the first 1.8 simulated seconds. No observed node or browser regression remains unresolved in completed suites.

## Known limits and release decision

No physical iPhone/Android/gamepad, Safari/Firefox, Bluetooth audio, or true human player was tested. The keeper was deliberately kept away from the ball path in new flight probes. Real in-game goalkeeper save distributions and human-versus-CPU scoring fairness remain **open**. The 40 browser scripts are individual Chromium scripts, not an exhaustive certification of 424 requirements.

**Result:** Ship as Alpha with controlled physics improvements and complete available automated regression coverage; physical and statistical game-balance certification still pending.
