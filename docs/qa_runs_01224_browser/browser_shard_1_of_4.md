# Full regression — browser, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| abilities_browser_qa.py | FAIL | 1.56 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| ai_browser_qa.py | FAIL | 2.70 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| breath_selected_browser_qa.py | PASS | 4.34 | 645, 'normal': 6.334383838383839, 'sprint': 4.350383838383838, 'idle': 1.9444444444444444}, {'stat': 100, 'start': 10, 'normal': 9.896, 'sprint': 8.312000000000001, 'idle': 2.5}]   |
| career_history_robust_browser_qa.py | PASS | 5.97 | history skipped/placeholdered, valid rows shown, no writes CAREER_HISTORY_ROBUST_BROWSER_PASS simulated-touch malformed history skipped/placeholdered, valid rows shown, no writes   |
| career_season_archive_browser_qa.py | PASS | 6.28 | pty state, named archive summary, no mutation/save, Back route CAREER_SEASON_ARCHIVE_BROWSER_PASS simulated-touch empty state, named archive summary, no mutation/save, Back route   |
| combo_priority_browser_qa.py | FAIL | 1.56 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| concept_royals_sheet_browser_qa.py | PASS | 3.44 | t_hero/hero_atlas.webp HTTP/1.1" 200 - 127.0.0.1 - - [01/Nov/2026 15:16:52] code 404, message File not found 127.0.0.1 - - [01/Nov/2026 15:16:52] "GET /favicon.ico HTTP/1.1" 404 -  |
| crown_royals_diego_browser_qa.py | PASS | 2.38 | o_shoot.png": "e8cab4b01724330e4fadafa37ce418d96417c019dbe2cf97eea804985dbf7073",     "diego_tackle.png": "e0280ff96268946b663ea0b211b4a96bed5d67b95366322295858a17575338df"   } }   |
| dribble_styles_browser_qa.py | FAIL | 2.16 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| fitness_browser_qa.py | FAIL | 1.98 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| graphics_integration_v082522.py | FAIL | 0.36 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168125: character maps to <undefined>  |
| halftime_tactics_return_browser_qa.py | PASS | 8.66 | top Back, Save, Reset, Escape, normal Pause, save/talk/four controls HALFTIME_TACTICS_RETURN_PASS simulated-touch Back, Save, Reset, Escape, normal Pause, save/talk/four controls   |
| keeper_physical_lunge_browser_qa.py | PASS | 4.00 | irrored FPS/fatigue in-engine keeper lunges, capped travel, no phantom saves PASS simulated-touch 12 mirrored FPS/fatigue in-engine keeper lunges, capped travel, no phantom saves   |
| kits_browser_qa.py | FAIL | 2.28 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| lan_two_client_browser_qa.py | PASS | 5.28 | PASS LAN_REAL_TWO_CHROMIUM_CLIENTS_HOST_FIND_APPROVE_WEBRTC_MATCH {'clock': 0.6832, 'score': [0, 0]} {'clock': 0.7, 'score': [0, 0]}   |
| magic_freeze_slide_browser_qa.py | PASS | 3.38 | MAGIC_FREEZE_SLIDE_BROWSER_PASS desktop MAGIC_FREEZE_SLIDE_BROWSER_PASS simulated-touch   |
| morale_browser_qa.py | FAIL | 1.72 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |
| penalty_audio_feedback_browser_qa.py | FAIL | 1.83 | [0]            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 168034: character maps to <undefined>  |

Summary: {"PASS": 9, "FAIL": 9, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 15}
