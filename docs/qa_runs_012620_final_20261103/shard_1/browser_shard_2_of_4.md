# Full regression — browser, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| ability_action_audio_browser_qa.py | PASS | 25.33 | ROWSER_PASS desktop real dash and team launch, full SFX bridge, four controls ABILITY_AUDIO_BROWSER_PASS simulated-touch real dash and team launch, full SFX bridge, four controls   |
| ai_combos_browser_qa.py | FAIL | 40.75 | d_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.set_content: Timeout 30000ms exceeded. Call log:   - setting frame content, waiting until "load"   |
| art102_spin_bumper_pose_browser_qa.py | FAIL | 51.10 | d_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.set_content: Timeout 30000ms exceeded. Call log:   - setting frame content, waiting until "load"   |
| career_backup_restart_browser_qa.py | FAIL | 47.82 |  playwright._impl._errors.TimeoutError: Page.goto: Timeout 30000ms exceeded. Call log:   - navigating to "http://127.0.0.1:63105/tests/.generated/play.html", waiting until "load"   |
| career_lineup_editor_browser_qa.py | FAIL | 51.24 | d_st['apiName']}: {error}") from None playwright._impl._errors.TimeoutError: Page.set_content: Timeout 30000ms exceeded. Call log:   - setting frame content, waiting until "load"   |
| career_season_archive_browser_qa.py | FAIL | 0.06 |   |

Summary: {"PASS": 1, "FAIL": 5, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 44}
