# Candidate 0.12.38.0 integrated local QA — 2 November 2026

Source tree: `dev` at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted candidate integration. This report records local validation only; the candidate has not been committed, promoted or deployed.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,571/1,571 passed**; built roster census **32 clubs / 384 player slots**.
- Independent regression Node census: **402/402 passed** across four shards; raw shard results are in [`qa_runs_012380_node_20261102`](../qa_runs_012380_node_20261102/).
- Portable desktop/simulated-touch Chromium census: **157/157 passed**, zero failures/timeouts/runner errors across four shards; raw results are in [`qa_runs_012380_browser_20261102`](../qa_runs_012380_browser_20261102/).
- Data validator: **223 teams, 2,676 players, 84 avatar presets** passed.
- Concept manifest validator: **8 layers passed**; modular source validator passed all eight transparent editable layers.
- UX-102 reduced-motion static test: **1/1**; desktop and simulated-touch emulation passed, with immediate active-touch feedback and keyboard focus retained.
- UX27 generic save-import atomicity tests: **5/5**; later-write failures, mutate-then-throw, silently discarded writes and complete/incomplete rollback reporting passed.
- UX27 general save-import failure browser acceptance: desktop and simulated-touch Chromium both reported a failed import, kept Save Management open, avoided reload, and confirmed stored save bytes were restored.
- UX27 partial/null save-import compatibility: desktop and simulated-touch browser acceptance passed, preserving Career/Cup vault and legacy-mirror bytes across reload.
- `git diff --check`: passed (Git printed existing line-ending normalization notices).

No roster values or tier assignments changed. The source ledger hash remains `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`. The Club Brugge, Roma and Fulham documentation-only audits extend the source review to 23 unique 12-player club batches, with 966/1,656 direct same-name field observations; 690 mappings remain unresolved. No Studio project, production art or concept graphics changed.

Exact-commit GitHub CI, protected promotion, hosted Pages verification, physical-device acceptance, real two-device LAN and owner art review remain separate gates. The local browser census does not certify those environments.
