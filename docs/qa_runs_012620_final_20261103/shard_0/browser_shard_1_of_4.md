# Full regression — browser, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| abilities_browser_qa.py | PASS | 26.06 |  action and autonomous GK; removed Special binding not required simulated-mobile PASS: four-button defensive aerial action and autonomous GK; removed Special binding not required   |
| ai_browser_qa.py | FAIL | 43.09 | d_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.set_content: Timeout 30000ms exceeded. Call log:   - setting frame content, waiting until "load"   |
| art102_mace_sweep_visual_browser_qa.py | FAIL | 51.37 | d_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.set_content: Timeout 30000ms exceeded. Call log:   - setting frame content, waiting until "load"   |
| career_backup_browser_qa.py | FAIL | 47.64 |  playwright._impl._errors.TimeoutError: Page.goto: Timeout 30000ms exceeded. Call log:   - navigating to "http://127.0.0.1:52764/tests/.generated/play.html", waiting until "load"   |
| career_history_robust_browser_qa.py | FAIL | 0.05 |   |

Summary: {"PASS": 1, "FAIL": 4, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 45}
