# Full regression — browser, shard 4/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| aerial_browser_qa.py | PASS | 12.07 | sktop PASS: hyperdash keyboard/touch, aerial heading, goalkeeper dive, no browser errors mobile PASS: hyperdash keyboard/touch, aerial heading, goalkeeper dive, no browser errors   |
| beard_customization_v082528.py | FAIL | 23.39 | wrap_api_call     raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.wait_for_function: Timeout 20000ms exceeded.  |

Summary: {"PASS": 1, "FAIL": 1, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 31}
