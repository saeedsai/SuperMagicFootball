# Full regression — node, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| active_pursuit_ground_shots.mjs | PASS | 0.19 | v0.8.15 ACTIVE AI / GK DISTRIBUTION / AIRBORNE SUPER TRAJECTORY PASS   |
| all_club_fc27_rosters.mjs | PASS | 0.15 | PASS 165 clubs / 1,980 slots / 2GK-3DF-4MF-3FW; FC27 983 editorial real 997 unresolved fictional 0   |
| club26_fc27_roster.mjs | PASS | 0.10 | PASS club26: 32 clubs, 384 player slots, 2/3/4/3, source-classified, runtime and data identical; FC27 372 editorial 12   |
| control_reliability.mjs | PASS | 0.14 | v0.8.17 CONTROL RELIABILITY PASS — short/long/rapid passing, jump run/tap, manual switch grace, steering auto-switch   |
| dribble_styles.mjs | PASS | 0.18 | v0.8.7 DRIBBLE STYLES PASS — 216 teams, 2592 players, 10 profiles, stamina/cooldowns, defensive counters, AI, identity stability   |
| four_button_phase2.mjs | PASS | 0.14 | v0.8.6 FOUR BUTTON PHASE 2 PASS: bicycle, flying kick, defensive priority, trick, GK distribution, AI detour, old special   |
| morale_reactions.mjs | PASS | 0.15 | v0.7.3 MORALE/REACTIONS PASS • reactions/backfires • speed • scoring/crying • persistence • half-time limits • 216 teams preserved   |
| roster_reconciliation.mjs | PASS | 0.18 | v0.8.14 ROSTER RECONCILIATION PASS: 216 clubs, 2592 players, positions, default lineups, source-ranked squad selection, engine start   |
| super_shot_reset.mjs | PASS | 0.12 | Super-shot transformation reset: passed   |
| v0818_regressions.mjs | PASS | 0.13 | v0.8.18 REGRESSIONS PASS: moving/running slides, contact, ordinary tackle, bounded attacking stoppage, super-shot launch/stat resistance, held/tapped jump and cross priority   |
| v08193_ui_navigation.mjs | PASS | 0.22 | v0.8.19.3 UI NAV PASS: 165 manager clubs, 165 unique country/continent memberships, six 6-player formation presets   |
| v08197_keeper_sessions.mjs | PASS | 1.54 | SSION QA PASS {"trials":1320,"matches":4,"scores":[[0,0],[0,0],[0,0],[0,0]],"totals":{"goal":0,"save":4,"keeperDive":4,"keeperCatch":0,"keeperDistribution":0,"keeperRecovery":4}}   |
| v08203_bayern_psg_verified.mjs | PASS | 0.18 | PASS current FC27 source and positional club contract: Bayern Munich, Paris Saint-Germain   |
| v08206_lafc_roles.mjs | PASS | 0.20 | PASS current FC27 LAFC positional and named-player contract   |
| v0821_ball_lift_super_bicycle.mjs | PASS | 0.22 | d-order lift, both teams, grounded carrier, airborne follow-up, unified special-power shot, no duplicates, invalid states, timeout and possession loss, ordinary bicycle preserved   |
| v08232_audio_reliability.mjs | PASS | 0.47 | PASS v0.8.23.2 audio reliability: no autoplay, scene music crossfade, crowd volume and loop, mute/unmute, suspend/resume, cleanup, preference sanitation and touch lifecycle   |
| v082411_keeper_collection.mjs | PASS | 0.14 | PASS v0.8.24.11 goalkeeper/outfield collection candidate eligibility (4 scenarios)   |
| v082412_release_context.mjs | PASS | 0.07 | PASS v0.8.24.12 release-pressure context, inertness, mirroring, and legacy compatibility   |
| v08244_match_matrix.mjs | PASS | 9.36 | als":0,"saves":13,"avgPeakBallSpeed":921.449},"3":{"matches":3,"goals":1,"saves":8,"avgPeakBallSpeed":905.325},"4":{"matches":3,"goals":1,"saves":19,"avgPeakBallSpeed":1004.331}}   |
| v08249_single_player_calibration.mjs | PASS | 0.86 | {"shots":24,"goals":0,"saves":20,"defenderReactions":24},"3":{"shots":24,"goals":0,"saves":19,"defenderReactions":24},"4":{"shots":24,"goals":0,"saves":8,"defenderReactions":24}}   |
| ability_icons_contract.test.cjs | PASS | 0.17 |  Chromium bundle includes shared ability icon implementation before UI (0.3134ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.4104   |
| arcade_match_ui_visual_contract.test.cjs | PASS | 0.16 |  VIZ-01 preserves safe-area, compact touch viewports and reduced motion (0.3612ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.7016   |
| audit_regression_shards.test.cjs | PASS | 0.71 | ard regression auditor rejects silent missing and duplicate coverage (556.5292ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 642.2422   |
| breath_hud_dribble.test.cjs | PASS | 0.18 | trolled-player outline and Breath ring share current human selection (0.7884ms) ℹ tests 16 ℹ suites 0 ℹ pass 16 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 107.5212   |
| career_bench_readiness.test.cjs | PASS | 0.17 |  ✔ report limits to three advice rows and counts extra unfit starters (0.2251ms) ℹ tests 11 ℹ suites 0 ℹ pass 11 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.6786   |
| career_recent_form.test.cjs | PASS | 0.17 |  ✔ Career slot vault still validates and loads a legacy save unchanged (2.3095ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 100.1967   |
| career_slot_rename.test.cjs | PASS | 0.19 | licate labels can still be renamed and all ten slots stay compatible (2.0546ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 116.6921   |
| club_creation_return.test.cjs | PASS | 0.16 | ✔ new club is selected and builder stays open for immediate edits (2.2992ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.9846   |
| concept_hero_direction_20261020.test.cjs | PASS | 0.21 | 5529ms) ✔ procedural players are not drawn or mirrored by Concept Hero (7.1007ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 133.8051   |
| concept_royals_owner_reference.test.cjs | PASS | 0.18 | 1ms) ✔ Concept Royals art contract requires directional and animation QA (0.2727ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.837   |
| crown_royals_diego.test.cjs | PASS | 0.17 | o has a unique three-view PNG and independent runtime/render references (3.0573ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.0468   |
| crown_royals_quarter_depth.test.cjs | PASS | 0.19 | d Kwame have authored quarter projections; Diego remains a placeholder (2.9373ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 109.2839   |
| cup_safe_load_atomic.test.cjs | PASS | 0.21 | ms) ✔ SAVE-102 invalid slot numbers are rejected without storage writes (0.581ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 119.6619   |
| cup_slot_ui_dispatch.test.cjs | PASS | 0.18 | nt (1.6085ms) ✔ UI load cancellation preserves active slot and campaign (1.514ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 107.4778   |
| customization_navigation_club_20261023.test.cjs | PASS | 0.19 | 591ms) ✔ club selector is enabled for settings studio and roster editor (0.2703ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 107.716   |
| directional_pass_target_safety.test.cjs | PASS | 0.18 | cted receiver (0.1653ms) ✔ existing shot feel helpers remain exposed (0.1011ms) ℹ tests 12 ℹ suites 0 ℹ pass 12 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 106.3485   |
| dual_resources.test.cjs | PASS | 0.19 | areer match record saves depleted Energy and restores for next fixture (0.4121ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 114.9477   |
| first_touch_control.test.cjs | PASS | 0.20 | own and resets on substitution without restricting four inputs or shot (0.2568ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 106.8256   |
| graphics_branch_integration.test.cjs | PASS | 0.23 | ) ✔ build remains single-file/offline compatible with embedded styling (0.1748ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 161.1394   |
| halftime_tactics_return.test.cjs | PASS | 0.18 |  Escape/Backspace in Team Command Center follows the same return route (1.1434ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 105.1533   |
| jumping_stat.test.cjs | PASS | 0.20 | s) ✔ jump impulses and stamina cost improve monotonically with jumping (0.4389ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 123.9102   |
| keeper_dive_intent.test.cjs | PASS | 0.21 | atory attempt per shot has a recovery while real saves retain cooldown (1.1054ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 126.2538   |
| keeper_live_ai_fairness.test.cjs | PASS | 0.19 | S (0.755ms) ✔ original ball-only contact-geometry cohort remains intact (0.2193ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.4895   |
| keeper_save_event_integrity.test.cjs | PASS | 0.18 | active opposing shots get a save event when keeper collects loose ball (1.0451ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.2256   |
| lan-disconnect.test.cjs | PASS | 0.18 | s) ✔ disconnect neutralizes held controls via authenticated leave result (2.878ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 104.586   |
| lan-input-timeline.test.cjs | PASS | 0.19 | host tick copies input, so caller mutations cannot alter held controls (0.3885ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 106.2568   |
| lan-session.test.cjs | PASS | 0.18 |  ✔ LAN input validation rejects malformed axes and extra action buttons (1.9001ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.6237   |
| lan_addresses.test.cjs | PASS | 0.19 | 5377ms) ✔ signaling server sends host address list as a separate event (1.2779ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 102.8369   |
| lan_busy_join.test.cjs | PASS | 0.18 | er routes occupied/version-mismatch rejection through correlated helper (1.4185ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.1778   |
| lan_host_activity.test.cjs | PASS | 0.15 | ✔ host activity state follows lifecycle (4.9865ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.4019   |
| lan_host_closed_clock.test.cjs | PASS | 0.18 | ✔ closed host pending list never calls clock (6.5664ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 100.2248   |
| lan_host_pending_count.test.cjs | PASS | 0.17 | ✔ pending count tracks requests, expiry, and close (4.3935ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.6138   |
| lan_host_send_false.test.cjs | PASS | 0.16 | est for retry (5.1182ms) ✔ async false send preserves request for retry (0.3623ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.3627   |
| lan_lobby.test.cjs | PASS | 0.19 | discovery, with manual fallback, both using shared four-button match (1.3034ms) ℹ tests 15 ℹ suites 0 ℹ pass 15 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 122.2274   |
| lan_pending_expiry.test.cjs | PASS | 0.16 | iodically expires pending joins and host UI already handles join-cancel (1.8761ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.9344   |
| lan_room_clock_validation.test.cjs | PASS | 0.18 | ✔ invalid clock callback fails at construction (4.3004ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 102.3604   |
| lan_room_selector.test.cjs | PASS | 0.19 | oom (5.2101ms) ✔ duplicate room advertisements render one joinable card (0.5362ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.5049   |
| lan_signal_policy.test.cjs | PASS | 0.19 | alf-open WebSocket rooms are evicted after missed heartbeat response (0.7921ms) ℹ tests 12 ℹ suites 0 ℹ pass 12 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 118.2497   |
| magic_banana_peel.test.cjs | PASS | 0.16 | .1607ms) ✔ pitch renderer paints hazards without new assets or controls (0.8377ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.3247   |
| magic_freeze_jump_counter.test.cjs | PASS | 0.16 | Player Studio explains existing JUMP; no fifth action or new save field (1.1004ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.2175   |
| magic_ice_patch.test.cjs | PASS | 0.16 | nent (0.1838ms) ✔ engine passes same-tick Banana victims to Ice model (0.4986ms) ℹ tests 13 ℹ suites 0 ℹ pass 13 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.1282   |
| magic_teleport_slide_counter.test.cjs | PASS | 0.15 | d (0.1471ms) ✔ Studio guide matches lane counter without a fifth action (1.0785ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.9508   |
| man_city_fc27_official_20261016.test.cjs | PASS | 0.21 | exclusive provenance changes accounted for in immutable metadata audit (5.4694ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 142.9559   |
| napoli_player_metadata_20261016.test.cjs | PASS | 0.21 | 7 club, age, shirts, sourced height, nationalities and runtime parity (43.0164ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 138.0305   |
| pass_follow_through.test.cjs | PASS | 0.17 | renderer uses follow-through only on near boot and owns no ball physics (0.5714ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.8037   |
| penalty_keeper_hud.test.cjs | PASS | 0.16 | lty HUD paints keeper dive/recovery phases without changing match state (0.9851ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.9313   |
| performance_tuning_v082531.test.cjs | PASS | 0.15 | 2162ms) ✔ service worker cache version rotates after source/data update (0.2781ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.9485   |
| player_art_rework.test.cjs | PASS | 0.52 | l player studio art choices draw unique instructions wherever visible (33.9772ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 447.9164   |
| player_studio_magic_guide.test.cjs | PASS | 0.16 | ✔ trap preview matches existing arming durations and SHOOT-slide disarm (0.1334ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.8973   |
| quick_live_tactics.test.cjs | PASS | 0.15 | hows shortcuts at PAUSED and HALF TIME; four gameplay actions unchanged (0.5128ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.4045   |
| ricochet_shotpath.test.cjs | PASS | 0.15 | s) ✔ ricochet shots keep using the visible recorded transformation trail (0.215ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.5636   |
| spain_goalkeeper_metadata_20261016.test.cjs | PASS | 0.17 | s two goalkeepers and all 32 national teams retain 12 unique identities (0.8212ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.0636   |
| studio_appearance_noop_save.test.cjs | PASS | 0.16 |  ✔ STUDIO-APPEARANCE-NOOP-01: missing player does not write or navigate (0.9627ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.2691   |
| studio_defence_catalogue.test.cjs | PASS | 0.15 | ✔ Studio defence catalogue remains bounded and read-only (1.0294ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.6451   |
| studio_dribble_equipment.test.cjs | PASS | 0.16 | ities require elite eligibility without revoking legacy equipped players (1.778ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.5026   |
| studio_elite_position_ovr.test.cjs | PASS | 0.15 | c Trick threshold is 91+ for Star/Superstar, unlike other elite equipment (1.0547ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.31   |
| studio_goalkeeper_magic_preview.test.cjs | PASS | 0.15 | lkeeper Studio panel is preview-only with live icon and no save control (0.3467ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.0144   |
| studio_magic_keep_current.test.cjs | PASS | 0.16 | agic preserves existing four-action controller and has no tier selector (0.4368ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.7826   |
| studio_magic_save_state.test.cjs | PASS | 0.17 | io Magic UI mirrors disabled state to accessible button and explains why (0.4329ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.521   |
| studio_shot_noop_save.test.cjs | PASS | 0.19 |  ✔ STUDIO-SHOT-NOOP-01: legacy absent fields persist on explicit REMOVE (0.5546ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 110.318   |
| supernova_defense.test.cjs | PASS | 0.18 | ced-flash fallback respects OS motion preference unless saved explicitly (2.5013ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.293   |
| tactics_event_integrity.test.cjs | PASS | 0.15 | g tactical slots preserves each player Breath and emits no substitution (0.2527ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.9941   |
| ui_back_routes_20261020.test.cjs | PASS | 0.20 | es (0.9288ms) ✔ Controller mapping footer does not skip Input Settings (0.2344ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 118.7901   |

Summary: {"PASS": 83, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
