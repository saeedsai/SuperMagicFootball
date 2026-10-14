# v0.8.24.1 Alpha — actual regression report

## Executed
- **Node full master suite:** 59/59 PASS (final run `master_full_node_s0of1_v08241_final2.json`). Includes 96 deterministic moving-keeper forecast/ball integration fixtures at 30/60/120Hz, mirrored goal directions and level/transformation variants.
- **Browser:** New Chromium tactical desktop+simulated touch PASSED individually, and `master_ui_contracts.py` desktop+simulated Android PASSED. Some longer browser shards were interrupted or left incomplete by the execution ceiling. **Do not claim 38/38 browser scripts passed this release**; see per-shard JSON for exact completed scripts and NOT_EXECUTED counts. Previous v0.8.24 had 38/38 but is not evidence for this new build.
- Initial legacy browser timeouts were caused by tests waiting on v0.8.24 version after version bump; version expectations corrected. Initial Node master failed for same reason, fixed and rerun green.
- **Acceptance catalog:** 395 requirements, NOT 395 independently certified test executions; deferred Tricks/Super Defense cases remain NOT RUN.

## Remaining
- End-to-end moving AI keeper shot/goal/save distributions and difficulty curves NOT certified by bounded synthetic fixtures.
- Full headless Chromium regression still needs a finished sequential run; real-origin storage, phones, Safari/Firefox, physical gamepad, actual 30/60/120Hz performance remain unverified.
- Gameplay physics and teams were deliberately not modified solely to force benchmarks.
