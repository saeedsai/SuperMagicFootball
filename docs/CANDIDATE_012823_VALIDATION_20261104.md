# Candidate 0.12.81.23 validation — 4 November 2026

## Change

Penalty transitions now clear active magic walls and Supernova effects along with ground hazards and pending ability actions. Penalty mode pauses normal field-effect updates, so the old behavior could freeze these effects during the stoppage and let them resume after open play returned. A regression executes the production `startPK()` method and verifies all temporary field effects are cleared before play resumes. Offline saves, match controls, and the penalty shootout state machine are unchanged.

## Validation

- `node --test tests/restart_pending_ability_cleanup.test.cjs tests/penalty_area_foul.test.cjs tests/corner_restart.test.cjs tests/free_kick_restart.test.cjs tests/penalty_shootout_lifecycle.test.cjs` — **25/25 passed**.
- `python -X utf8 scripts/build.py` — passed; bundle contains **4,996,690 JavaScript characters** and **5,118,269 HTML characters**.
- `node --test tests/*.test.cjs` — **1,963/1,963 passed**.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs tests/arena_overhaul_visual_contract.test.cjs tests/keeper_glove_action_art_contract.test.cjs` — **31/31 passed**.
- `tests/penalty_controls_browser_qa.py` — desktop and Android-sized Chromium flows passed, including remapping, penalty movement and shots, four-action touch controls, and zero page errors. The test's Linux Chromium path was mapped to the installed Windows Chrome executable for this run.
- Portable Chromium census — **229/229 passed** across four shards (58/58, 57/57, 57/57, 57/57); `tests/audit_regression_shards.py` verified exact, duplicate-free coverage. See [census evidence](qa_runs_012823_browser_20261104/README.md).
- `git diff --check` — passed; any line-ending notice concerns the pre-existing mixed line endings in the shared working tree.

## Remaining acceptance

This is a local candidate. Exact-head CI, hosted smoke, physical-device/owner acceptance, protected promotion and deployment remain unverified. Earlier `.22` LAN tests and browser evidence remain documented in [candidate .22 validation](CANDIDATE_012822_VALIDATION_20261104.md).
