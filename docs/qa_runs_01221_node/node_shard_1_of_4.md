# Full regression — node, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| active_pursuit_ground_shots.mjs | PASS | 0.37 | v0.8.15 ACTIVE AI / GK DISTRIBUTION / AIRBORNE SUPER TRAJECTORY PASS   |
| all_club_fc27_rosters.mjs | PASS | 0.14 | PASS 165 clubs / 1,980 slots / 2GK-3DF-4MF-3FW; FC27 983 editorial real 997 unresolved fictional 0   |
| club26_fc27_roster.mjs | PASS | 0.12 | PASS club26: 32 clubs, 384 player slots, 2/3/4/3, source-classified, runtime and data identical; FC27 372 editorial 12   |
| control_reliability.mjs | PASS | 0.13 | v0.8.17 CONTROL RELIABILITY PASS — short/long/rapid passing, jump run/tap, manual switch grace, steering auto-switch   |
| dribble_styles.mjs | PASS | 0.16 | v0.8.7 DRIBBLE STYLES PASS — 216 teams, 2592 players, 10 profiles, stamina/cooldowns, defensive counters, AI, identity stability   |
| four_button_phase2.mjs | PASS | 0.13 | v0.8.6 FOUR BUTTON PHASE 2 PASS: bicycle, flying kick, defensive priority, trick, GK distribution, AI detour, old special   |
| morale_reactions.mjs | PASS | 0.14 | v0.7.3 MORALE/REACTIONS PASS • reactions/backfires • speed • scoring/crying • persistence • half-time limits • 216 teams preserved   |
| roster_reconciliation.mjs | PASS | 0.16 | v0.8.14 ROSTER RECONCILIATION PASS: 216 clubs, 2592 players, positions, default lineups, source-ranked squad selection, engine start   |
| super_shot_reset.mjs | PASS | 0.12 | Super-shot transformation reset: passed   |
| v0818_regressions.mjs | PASS | 0.13 | v0.8.18 REGRESSIONS PASS: moving/running slides, contact, ordinary tackle, bounded attacking stoppage, super-shot launch/stat resistance, held/tapped jump and cross priority   |
| v08193_ui_navigation.mjs | PASS | 0.20 | v0.8.19.3 UI NAV PASS: 165 manager clubs, 165 unique country/continent memberships, six 6-player formation presets   |
| v08197_keeper_sessions.mjs | PASS | 1.31 | SSION QA PASS {"trials":1320,"matches":4,"scores":[[0,0],[0,0],[0,0],[0,0]],"totals":{"goal":0,"save":4,"keeperDive":4,"keeperCatch":0,"keeperDistribution":0,"keeperRecovery":4}}   |
| v08203_bayern_psg_verified.mjs | PASS | 0.15 | PASS current FC27 source and positional club contract: Bayern Munich, Paris Saint-Germain   |
| v08206_lafc_roles.mjs | PASS | 0.15 | PASS current FC27 LAFC positional and named-player contract   |
| v0821_ball_lift_super_bicycle.mjs | PASS | 0.13 | d-order lift, both teams, grounded carrier, airborne follow-up, unified special-power shot, no duplicates, invalid states, timeout and possession loss, ordinary bicycle preserved   |
| v08232_audio_reliability.mjs | PASS | 0.43 | PASS v0.8.23.2 audio reliability: no autoplay, scene music crossfade, crowd volume and loop, mute/unmute, suspend/resume, cleanup, preference sanitation and touch lifecycle   |
| v082411_keeper_collection.mjs | PASS | 0.13 | PASS v0.8.24.11 goalkeeper/outfield collection candidate eligibility (4 scenarios)   |
| v082412_release_context.mjs | PASS | 0.08 | PASS v0.8.24.12 release-pressure context, inertness, mirroring, and legacy compatibility   |
| v08244_match_matrix.mjs | PASS | 6.21 | als":0,"saves":13,"avgPeakBallSpeed":921.449},"3":{"matches":3,"goals":1,"saves":8,"avgPeakBallSpeed":905.325},"4":{"matches":3,"goals":1,"saves":19,"avgPeakBallSpeed":1004.331}}   |
| v08249_single_player_calibration.mjs | PASS | 0.81 | {"shots":24,"goals":0,"saves":20,"defenderReactions":24},"3":{"shots":24,"goals":0,"saves":19,"defenderReactions":24},"4":{"shots":24,"goals":0,"saves":8,"defenderReactions":24}}   |
| ability_icons_contract.test.cjs | PASS | 0.15 | e Chromium bundle includes shared ability icon implementation before UI (0.4791ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.2359   |
| arcade_match_ui_visual_contract.test.cjs | PASS | 0.16 |  VIZ-01 preserves safe-area, compact touch viewports and reduced motion (0.2306ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.8369   |
| audit_regression_shards.test.cjs | PASS | 0.82 | shard regression auditor rejects silent missing and duplicate coverage (679.0865ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 753.67   |
| breath_hud_dribble.test.cjs | PASS | 0.16 | ntrolled-player outline and Breath ring share current human selection (0.4126ms) ℹ tests 16 ℹ suites 0 ℹ pass 16 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.5236   |
| career_bench_readiness.test.cjs | PASS | 0.16 | ) ✔ report limits to three advice rows and counts extra unfit starters (0.188ms) ℹ tests 11 ℹ suites 0 ℹ pass 11 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.5178   |
| career_recent_form.test.cjs | PASS | 0.17 |  ✔ Career slot vault still validates and loads a legacy save unchanged (2.4519ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 104.8407   |
| career_slot_rename.test.cjs | PASS | 0.19 | licate labels can still be renamed and all ten slots stay compatible (1.9446ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 124.3908   |
| club_creation_return.test.cjs | PASS | 0.16 | ✔ new club is selected and builder stays open for immediate edits (2.231ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.2995   |
| concept_hero_direction_20261020.test.cjs | PASS | 0.19 | 6.498ms) ✔ procedural players are not drawn or mirrored by Concept Hero (5.5973ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 116.327   |
| concept_royals_owner_reference.test.cjs | PASS | 0.14 | ms) ✔ Concept Royals art contract requires directional and animation QA (0.2554ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 81.6847   |
| crown_royals_diego.test.cjs | PASS | 0.15 | o has a unique three-view PNG and independent runtime/render references (3.4495ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.7369   |
| crown_royals_quarter_depth.test.cjs | PASS | 0.14 | nd Kwame have authored quarter projections; Diego remains a placeholder (1.1196ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.6569   |
| cup_safe_load_atomic.test.cjs | PASS | 0.15 | ms) ✔ SAVE-102 invalid slot numbers are rejected without storage writes (0.3158ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.1965   |
| cup_slot_ui_dispatch.test.cjs | PASS | 0.14 | ment (1.0444ms) ✔ UI load cancellation preserves active slot and campaign (0.89ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.8501   |
| customization_navigation_club_20261023.test.cjs | PASS | 0.15 | 059ms) ✔ club selector is enabled for settings studio and roster editor (0.2174ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.5582   |
| directional_pass_target_safety.test.cjs | PASS | 0.16 | lected receiver (0.1074ms) ✔ existing shot feel helpers remain exposed (0.096ms) ℹ tests 12 ℹ suites 0 ℹ pass 12 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.6442   |
| dual_resources.test.cjs | PASS | 0.15 | Career match record saves depleted Energy and restores for next fixture (0.5037ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.4613   |
| first_touch_control.test.cjs | PASS | 0.15 | down and resets on substitution without restricting four inputs or shot (0.2623ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.7964   |
| graphics_branch_integration.test.cjs | PASS | 0.19 | ) ✔ build remains single-file/offline compatible with embedded styling (0.1312ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 131.9512   |
| halftime_tactics_return.test.cjs | PASS | 0.15 | ✔ Escape/Backspace in Team Command Center follows the same return route (1.0295ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.3233   |
| jumping_stat.test.cjs | PASS | 0.16 | ms) ✔ jump impulses and stamina cost improve monotonically with jumping (0.2086ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.9321   |
| keeper_dive_intent.test.cjs | PASS | 0.16 | ipatory attempt per shot has a recovery while real saves retain cooldown (0.191ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.3026   |
| keeper_live_ai_fairness.test.cjs | PASS | 0.17 |  (1.2953ms) ✔ original ball-only contact-geometry cohort remains intact (0.2526ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.9753   |
| keeper_save_event_integrity.test.cjs | PASS | 0.17 |  active opposing shots get a save event when keeper collects loose ball (0.859ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 105.8985   |
| lan-disconnect.test.cjs | PASS | 0.16 | ) ✔ disconnect neutralizes held controls via authenticated leave result (2.5325ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.3336   |
| lan-input-timeline.test.cjs | PASS | 0.17 |  host tick copies input, so caller mutations cannot alter held controls (0.3779ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.7465   |
| lan-session.test.cjs | PASS | 0.17 |  ✔ LAN input validation rejects malformed axes and extra action buttons (1.3984ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.6575   |
| lan_addresses.test.cjs | PASS | 0.17 | .6743ms) ✔ signaling server sends host address list as a separate event (1.0661ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.0331   |
| lan_busy_join.test.cjs | PASS | 0.20 | r routes occupied/version-mismatch rejection through correlated helper (1.6812ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 114.2561   |
| lan_host_activity.test.cjs | PASS | 0.16 | ✔ host activity state follows lifecycle (3.8048ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.6273   |
| lan_host_closed_clock.test.cjs | PASS | 0.15 | ✔ closed host pending list never calls clock (4.9045ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.1071   |
| lan_host_pending_count.test.cjs | PASS | 0.15 | ✔ pending count tracks requests, expiry, and close (5.1093ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.0232   |
| lan_host_send_false.test.cjs | PASS | 0.15 | est for retry (4.4327ms) ✔ async false send preserves request for retry (0.3369ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.2635   |
| lan_lobby.test.cjs | PASS | 0.18 | discovery, with manual fallback, both using shared four-button match (0.9105ms) ℹ tests 15 ℹ suites 0 ℹ pass 15 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 118.3685   |
| lan_pending_expiry.test.cjs | PASS | 0.16 | iodically expires pending joins and host UI already handles join-cancel (2.1335ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.3937   |
| lan_room_clock_validation.test.cjs | PASS | 0.16 | ✔ invalid clock callback fails at construction (4.4734ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.017   |
| lan_room_selector.test.cjs | PASS | 0.15 | room (4.6997ms) ✔ duplicate room advertisements render one joinable card (0.2938ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.103   |
| lan_signal_policy.test.cjs | PASS | 0.16 | alf-open WebSocket rooms are evicted after missed heartbeat response (0.8662ms) ℹ tests 12 ℹ suites 0 ℹ pass 12 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 100.5416   |
| magic_banana_peel.test.cjs | PASS | 0.15 | .9131ms) ✔ pitch renderer paints hazards without new assets or controls (0.4377ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.2747   |
| magic_freeze_jump_counter.test.cjs | PASS | 0.15 | Player Studio explains existing JUMP; no fifth action or new save field (1.0801ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.6598   |
| magic_ice_patch.test.cjs | PASS | 0.16 | nent (0.2228ms) ✔ engine passes same-tick Banana victims to Ice model (0.5946ms) ℹ tests 13 ℹ suites 0 ℹ pass 13 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.0334   |
| magic_teleport_slide_counter.test.cjs | PASS | 0.16 | d (0.2165ms) ✔ Studio guide matches lane counter without a fifth action (1.7086ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.2404   |
| man_city_fc27_official_20261016.test.cjs | PASS | 0.20 | exclusive provenance changes accounted for in immutable metadata audit (5.0717ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 133.7286   |
| napoli_player_metadata_20261016.test.cjs | PASS | 0.18 | 7 club, age, shirts, sourced height, nationalities and runtime parity (42.2164ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 118.5705   |
| pass_follow_through.test.cjs | PASS | 0.15 | renderer uses follow-through only on near boot and owns no ball physics (0.7491ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 82.5425   |
| penalty_keeper_hud.test.cjs | PASS | 0.15 | nalty HUD paints keeper dive/recovery phases without changing match state (0.842ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.799   |
| performance_tuning_v082531.test.cjs | PASS | 0.15 | 7125ms) ✔ service worker cache version rotates after source/data update (0.3859ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.7077   |
| player_art_rework.test.cjs | PASS | 0.48 | ll player studio art choices draw unique instructions wherever visible (28.177ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 416.2101   |
| player_studio_magic_guide.test.cjs | PASS | 0.14 | ✔ trap preview matches existing arming durations and SHOOT-slide disarm (0.0979ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.2288   |
| quick_live_tactics.test.cjs | PASS | 0.15 | hows shortcuts at PAUSED and HALF TIME; four gameplay actions unchanged (0.4074ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.5149   |
| shotpaths_build_integration_20261020.test.cjs | PASS | 0.17 | al module import, offline precache and stale-cache eviction stay intact (3.144ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 103.2949   |
| spain_national_metadata_20261016.test.cjs | PASS | 0.14 | national teams retain 12 players; Spain preserves immutable composition (1.2985ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 82.7621   |
| studio_appearance_reset.test.cjs | PASS | 0.15 | on (0.6594ms) ✔ reset button and disabled state are wired to Studio only (0.195ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.3878   |
| studio_defence_noop_save.test.cjs | PASS | 0.15 | DIO-DEFENCE-NOOP-01: real ability change persists, invalid tier rejects (1.2174ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.4489   |
| studio_dribble_noop_save.test.cjs | PASS | 0.14 | s) ✔ invalid style is rejected before any no-op shortcut or persistence (0.6576ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 81.7826   |
| studio_gallery_frame_steps.test.cjs | PASS | 0.13 | ✔ frame controls are accessible, delegated and limited to Player Studio (0.5574ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.0017   |
| studio_jumping_preview.test.cjs | PASS | 0.15 | ✔ both offline shell and generated QA fixture include the shared module (0.3878ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.6169   |
| studio_magic_live_save_state.test.cjs | PASS | 0.16 | c Trick live status is accessible, refreshed on selection and read-only (0.4198ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.5092   |
| studio_magic_unlock_missing_rating.test.cjs | PASS | 0.15 | ✔ STUDIO-TRICK-PROGRESS-02 distinguishes missing legacy rating from zero (1.7699ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.728   |
| studio_shot_save_state.test.cjs | PASS | 0.14 |  ✔ Super Shot save feedback is accessible and updates for shot and tier (0.9893ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.8892   |
| tackle_animation.test.cjs | PASS | 0.15 | ction poses freeze locomotion gait while regular running stays animated (0.2265ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.2712   |
| tornado_trail_render.test.cjs | PASS | 0.14 |  is limited to spiral shots; ordinary transformation trails stay intact (0.8397ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 78.8323   |
| ui_no_dev_banner_20261020.test.cjs | PASS | 0.13 |  (0.172ms) ✔ four controls and gameplay-specific screens remain present (0.1326ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.1069   |

Summary: {"PASS": 83, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
