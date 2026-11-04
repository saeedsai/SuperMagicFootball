# Candidate 0.12.81.24 browser census attempt — 4 November 2026

Four portable Chromium shards selected all 229 discovered browser scripts. Combined report totals: **227 passed, 1 failed, 1 timed out**. The shard audit correctly rejected this attempt; it is not a clean full census.

- Shard 1/4: 57 pass, 1 fail. `ux26_rotate_prompt_focus_browser_qa.py` returned before its hidden-dialog focus assertion passed while the other three browser shards were running. Isolated retry via `python -X utf8 tests/browser_runner_compat.py tests/ux26_rotate_prompt_focus_browser_qa.py` passed all three desktop/simulated-touch cases.
- Shard 2/4: 56 pass, 1 timeout. `save_origin_restart_browser_qa.py` exceeded the local 55-second shard limit while all four shards were running. Isolated retry via `python -X utf8 tests/browser_runner_compat.py tests/save_origin_restart_browser_qa.py` completed all eight desktop/simulated-touch Career/Cup save-origin/restart scenarios successfully (`SAVE_ORIGIN_RESTART_SUMMARY_PASS 8 scenarios`).
- Shards 3/4 and 4/4: 57/57 passed each.

The retries demonstrate the two cases pass without parallel browser contention, but do not replace a clean full census or exact-head GitHub Actions result. CI uses a 75-second browser-script timeout and must pass all shards before the protected workflow may promote `dev` to `main`. Preserve the original shard reports as evidence of this rejected attempt.
