# Full regression — browser, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| abilities_browser_qa.py | FAIL | 1.34 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 170932: character maps to <undefined>  |
| ai_browser_qa.py | FAIL | 2.32 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 170932: character maps to <undefined>  |
| art102_mace_sweep_visual_browser_qa.py | PASS | 3.84 | ART102_MACE_SWEEP_GALLERY_PASS D:\My Projects\Supermagic_Football\SuperMagicFootball\tests\.generated\art102_mace_sweep_gallery.png 40 cells   |
| career_backup_browser_qa.py | PASS | 6.66 | d/play.html HTTP/1.1" 200 - 127.0.0.1 - - [03/Nov/2026 14:00:24] code 404, message File not found 127.0.0.1 - - [03/Nov/2026 14:00:24] "GET /tests/.generated/sw.js HTTP/1.1" 404 -  |
| career_cup_slot_action_names_browser_qa.py | PASS | 7.92 |  16 Cup slot-card actions have unique contextual names CAREER_CUP_SLOT_ACTION_NAMES_BROWSER_PASS simulated-touch 18 Career + 16 Cup slot-card actions have unique contextual names   |
| career_market_browse_browser_qa.py | PASS | 8.53 | CAREER_MARKET_BROWSE_PASS desktop rows 12 role FW CAREER_MARKET_BROWSE_PASS simulated-touch rows 12 role FW   |
| career_season_archive_browser_qa.py | PASS | 7.17 | pty state, named archive summary, no mutation/save, Back route CAREER_SEASON_ARCHIVE_BROWSER_PASS simulated-touch empty state, named archive summary, no mutation/save, Back route   |
| character_identity_persistence_v082529.py | FAIL | 0.33 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 181601: character maps to <undefined>  |
| concept_hero_browser_qa.py | FAIL | 0.40 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 181601: character maps to <undefined>  |
| control_reliability_browser_qa.py | FAIL | 0.29 | [0]            ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 170932: character maps to <undefined>  |
| crown_royals_diego_browser_qa.py | PASS | 2.77 | o_shoot.png": "d370f9905ed2af52fccd2c6d806ef11ade1672f412adf78e0a95d503a1af1ee9",     "diego_tackle.png": "597bb63f7e452179f001979237cc72dc8be9e29db8ea11d01ec671be9bea84be"   } }   |
| ct19_modular_gamepad_neutral_browser_qa.py | PASS | 3.28 | ouch {'initial': True, 'afterCancel': {'held': False, 'just': False}, 'freshPress': True, 'reconnectHeld': {'held': False, 'just': False}, 'reconnectedFresh': True, 'buttons': 4}   |
| dribble_trick_audio_browser_qa.py | PASS | 6.14 | SKILL_AUDIO_BROWSER_PASS desktop human success/failure and AI silence SKILL_AUDIO_BROWSER_PASS simulated-mobile human success/failure and AI silence   |
| fix_ui_101_routes_browser_qa.py | PASS | 16.48 | unsaved Cancel keeps forms FIX_UI_101_BROWSER_PASS simulated-touch Studio/gallery/editor/club/pause routes; visible, Escape and simulated gamepad Back; unsaved Cancel keeps forms   |
| free_kick_restart_browser_qa.py | FAIL | 0.38 | line 636, in wrap_api_call     raise rewrite_error(error, f"{parsed_st['apiName']}: {error}") from None Exception: Connection.init: Connection closed while reading from the driver  |
| halftime_match_lifecycle_browser_qa.py | FAIL | 0.04 |   |

Summary: {"PASS": 9, "FAIL": 7, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 37}
