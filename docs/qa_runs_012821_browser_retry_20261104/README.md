# Candidate 0.12.81.21 browser census attempts — 4 November 2026

Two four-shard portable Chromium runs each selected all 229 browser scripts. Neither run met the clean-census gate.

The first attempt recorded 225 passes and four failures. It exposed incomplete 55-team Cup fixtures in the backup-restart and save-origin test fixtures. Both fixtures were corrected to include the full round and odd-team bye. The other failures were a two-browser LAN timeout and a save-origin Chromium cache lock during parallel cleanup.

The retry after fixture repairs recorded 226 passes and three failures: an aerial flow timeout, a partial-save import file-read error, and a Player Studio gamepad assertion. Each route passed when run independently: aerial desktop/mobile, Career/Cup partial-save desktop/touch, and Player Studio desktop/simulated-touch. The corrected Cup backup-restart flow passed desktop/touch. The corrected save-origin suite passed all eight Career/Cup occupied/empty-active desktop/touch restart scenarios. The LAN two-browser route passed isolated retry.

The retry selected 229 scripts exactly once across four shard reports (`58 + 57 + 57 + 57`). `tests/audit_regression_shards.py` correctly rejects the run because three scripts failed in the shard run; isolated retries do not convert a failed census into a clean one. The latest clean full census remains candidate `.20`, 229/229. See the [candidate `.21` validation report](../CANDIDATE_012821_VALIDATION_20261104.md).
