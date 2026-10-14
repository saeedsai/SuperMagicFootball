# Master QA Strategy — v0.8.20.6

The active catalog contains **322 distinct documented cases** (218 historical, 28 future/backlog, 69 original critical regressions, two v0.8.20.5 club tests, three canonical identity cases and two LAFC/default GK cases). These are not 322 independently certified executions.

The final evidence contains **50/50 Node and 30/30 browser scripts passing** in bounded runs, saved as separate machine-readable JSON and Markdown under `docs/qa_runs/`. A stalled larger browser run is retained in the evidence; no false clean uninterrupted claim. The report consolidates script-level evidence only. Physical Android/iOS/gamepad, Safari/Firefox, long-play human QA and all manual case sign-off are pending.

For every new feature/bug fix: (1) write precise expected behavior, (2) add positive/negative/source integrity tests, (3) run full Node and relevant browser QA, (4) update the catalog with stable IDs, (5) verify 12-player quota, player IDs, four-action controls, six formations, save compatibility, PWA cache, artifact ZIP parity, (6) report PASS/FAIL/TIMEOUT/NOT_EXECUTED separately. No numeric player stats or tier restrictions may be represented as verified without dated sources.
