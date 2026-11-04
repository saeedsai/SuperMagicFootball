# Full regression — browser, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| ability_action_audio_browser_qa.py | FAIL | 2.50 | , f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.Error: BrowserType.launch: Failed to launch chromium because executable doesn't exist at \usr\bin\chromium  |
| ai_combos_browser_qa.py | FAIL | 0.65 | , f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.Error: BrowserType.launch: Failed to launch chromium because executable doesn't exist at \usr\bin\chromium  |
| career_backup_browser_qa.py | PASS | 9.36 | d/play.html HTTP/1.1" 200 - 127.0.0.1 - - [01/Nov/2026 21:23:02] code 404, message File not found 127.0.0.1 - - [01/Nov/2026 21:23:02] "GET /tests/.generated/sw.js HTTP/1.1" 404 -  |
| career_history_robust_browser_qa.py | FAIL | 0.72 | , f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.Error: BrowserType.launch: Failed to launch chromium because executable doesn't exist at \usr\bin\chromium  |

Summary: {"PASS": 1, "FAIL": 3, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 32}
