# Full regression — browser, shard 3/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| about_revision_browser_qa.py | FAIL | 64.57 | wrap_api_call     raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.wait_for_function: Timeout 60000ms exceeded.  |

Summary: {"PASS": 0, "FAIL": 1, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 32}
