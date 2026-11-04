# Full regression — browser, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| abilities_browser_qa.py | FAIL | 1.13 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 171412: character maps to <undefined>  |
| ai_browser_qa.py | FAIL | 1.39 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 171412: character maps to <undefined>  |
| art102_mace_sweep_visual_browser_qa.py | PASS | 1.79 | ART102_MACE_SWEEP_GALLERY_PASS D:\My Projects\Supermagic_Football\SuperMagicFootball\tests\.generated\art102_mace_sweep_gallery.png 40 cells   |
| career_backup_browser_qa.py | PASS | 5.73 | d/play.html HTTP/1.1" 200 - 127.0.0.1 - - [03/Nov/2026 01:55:20] code 404, message File not found 127.0.0.1 - - [03/Nov/2026 01:55:20] "GET /tests/.generated/sw.js HTTP/1.1" 404 -  |
| career_history_robust_browser_qa.py | PASS | 5.71 | history skipped/placeholdered, valid rows shown, no writes CAREER_HISTORY_ROBUST_BROWSER_PASS simulated-touch malformed history skipped/placeholdered, valid rows shown, no writes   |
| career_role_fit_browser_qa.py | PASS | 5.80 |  no mutations, four buttons, career kickoff CAREER_ROLE_FIT_BROWSER_PASS simulated-touch live misassigned DF, match-ready bench advice, no mutations, four buttons, career kickoff   |
| celebration_player_pose_browser_qa.py | PASS | 6.39 | ebration_player_poses.png', 'reactionPreview': 'D:\\My Projects\\Supermagic_Football\\SuperMagicFootball\\tests\\.generated\\disappointment_reaction_poses.png', 'pageErrors': []}   |
| combo_priority_browser_qa.py | FAIL | 1.16 | ", line 636, in wrap_api_call     raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None playwright._impl._errors.Error: BrowserContext.new_page: Target crashed   |
| concept_royals_sheet_browser_qa.py | FAIL | 0.03 |   |

Summary: {"PASS": 5, "FAIL": 4, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 40}
