# Full regression — browser, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| ability_action_audio_browser_qa.py | FAIL | 64.39 | wrap_api_call     raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.wait_for_function: Timeout 60000ms exceeded.  |
| ai_combos_browser_qa.py | PASS | 5.05 | desktop PASS AI teammate automatic combo and apex shot; no JavaScript errors mobile PASS AI teammate automatic combo and apex shot; no JavaScript errors   |

Summary: {"PASS": 1, "FAIL": 1, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 32}
