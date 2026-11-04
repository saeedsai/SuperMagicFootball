# Full regression — node, shard 1/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| active_pursuit_ground_shots.mjs | PASS | 0.11 | v0.8.15 ACTIVE AI / GK DISTRIBUTION / AIRBORNE SUPER TRAJECTORY PASS   |
| all_club_fc27_rosters.mjs | PASS | 0.10 | PASS 165 clubs / 1,980 slots / 2GK-3DF-4MF-3FW; FC27 983 editorial real 997 unresolved fictional 0   |
| club26_fc27_roster.mjs | PASS | 0.08 | PASS club26: 32 clubs, 384 player slots, 2/3/4/3, source-classified, runtime and data identical; FC27 372 editorial 12   |
| control_reliability.mjs | PASS | 0.10 | v0.8.17 CONTROL RELIABILITY PASS — short/long/rapid passing, jump run/tap, manual switch grace, steering auto-switch   |
| dribble_styles.mjs | PASS | 0.13 | v0.8.7 DRIBBLE STYLES PASS — 216 teams, 2592 players, 10 profiles, stamina/cooldowns, defensive counters, AI, identity stability   |
| four_button_phase2.mjs | PASS | 0.11 | v0.8.6 FOUR BUTTON PHASE 2 PASS: bicycle, flying kick, defensive priority, trick, GK distribution, AI detour, old special   |
| morale_reactions.mjs | PASS | 0.11 | v0.7.3 MORALE/REACTIONS PASS • reactions/backfires • speed • scoring/crying • persistence • half-time limits • 216 teams preserved   |
| roster_reconciliation.mjs | PASS | 0.12 | v0.8.14 ROSTER RECONCILIATION PASS: 216 clubs, 2592 players, positions, default lineups, source-ranked squad selection, engine start   |
| super_shot_reset.mjs | PASS | 0.09 | Super-shot transformation reset: passed   |
| v0818_regressions.mjs | PASS | 0.10 | v0.8.18 REGRESSIONS PASS: moving/running slides, contact, ordinary tackle, bounded attacking stoppage, super-shot launch/stat resistance, held/tapped jump and cross priority   |
| v08193_ui_navigation.mjs | PASS | 0.18 | v0.8.19.3 UI NAV PASS: 165 manager clubs, 165 unique country/continent memberships, six 6-player formation presets   |
| v08197_keeper_sessions.mjs | PASS | 0.96 | SSION QA PASS {"trials":1320,"matches":4,"scores":[[0,0],[0,0],[0,0],[0,0]],"totals":{"goal":0,"save":4,"keeperDive":4,"keeperCatch":0,"keeperDistribution":0,"keeperRecovery":4}}   |
| v08203_bayern_psg_verified.mjs | PASS | 0.10 | PASS current FC27 source and positional club contract: Bayern Munich, Paris Saint-Germain   |
| v08206_lafc_roles.mjs | PASS | 0.10 | PASS current FC27 LAFC positional and named-player contract   |
| v0821_ball_lift_super_bicycle.mjs | PASS | 0.10 | d-order lift, both teams, grounded carrier, airborne follow-up, unified special-power shot, no duplicates, invalid states, timeout and possession loss, ordinary bicycle preserved   |
| v08232_audio_reliability.mjs | PASS | 0.40 | PASS v0.8.23.2 audio reliability: no autoplay, scene music crossfade, crowd volume and loop, mute/unmute, suspend/resume, cleanup, preference sanitation and touch lifecycle   |
| v082411_keeper_collection.mjs | PASS | 0.09 | PASS v0.8.24.11 goalkeeper/outfield collection candidate eligibility (4 scenarios)   |
| v082412_release_context.mjs | PASS | 0.05 | PASS v0.8.24.12 release-pressure context, inertness, mirroring, and legacy compatibility   |
| v08244_match_matrix.mjs | PASS | 4.91 | als":0,"saves":13,"avgPeakBallSpeed":921.449},"3":{"matches":3,"goals":1,"saves":8,"avgPeakBallSpeed":905.325},"4":{"matches":3,"goals":1,"saves":19,"avgPeakBallSpeed":1004.331}}   |
| v08249_single_player_calibration.mjs | PASS | 0.61 | {"shots":24,"goals":0,"saves":20,"defenderReactions":24},"3":{"shots":24,"goals":0,"saves":19,"defenderReactions":24},"4":{"shots":24,"goals":0,"saves":8,"defenderReactions":24}}   |
| ability_icons_contract.test.cjs | PASS | 0.15 | e Chromium bundle includes shared ability icon implementation before UI (0.6601ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.6807   |
| arcade_match_ui_visual_contract.test.cjs | PASS | 0.11 |  VIZ-01 preserves safe-area, compact touch viewports and reduced motion (0.1221ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 61.8416   |
| audit_regression_shards.test.cjs | PASS | 0.59 | ard regression auditor rejects silent missing and duplicate coverage (476.4534ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 538.2322   |
| breath_hud_dribble.test.cjs | PASS | 0.13 | ntrolled-player outline and Breath ring share current human selection (0.3396ms) ℹ tests 16 ℹ suites 0 ℹ pass 16 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 75.4847   |
| career_bench_readiness.test.cjs | PASS | 0.13 |  ✔ report limits to three advice rows and counts extra unfit starters (0.1345ms) ℹ tests 11 ℹ suites 0 ℹ pass 11 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 72.6038   |
| career_recent_form.test.cjs | PASS | 0.13 | ) ✔ Career slot vault still validates and loads a legacy save unchanged (1.8175ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 78.9049   |
| career_slot_rename.test.cjs | PASS | 0.12 | plicate labels can still be renamed and all ten slots stay compatible (1.3594ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 71.4846   |
| club_creation_return.test.cjs | PASS | 0.12 | ✔ new club is selected and builder stays open for immediate edits (1.4893ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.8427   |
| concept_hero_direction_20261020.test.cjs | PASS | 0.14 | .8803ms) ✔ procedural players are not drawn or mirrored by Concept Hero (4.5371ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.7692   |
| concept_royals_owner_reference.test.cjs | PASS | 0.12 | ms) ✔ Concept Royals art contract requires directional and animation QA (0.1885ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.7948   |
| crown_royals_diego.test.cjs | PASS | 0.13 | o has a unique three-view PNG and independent runtime/render references (2.0566ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.9335   |
| crown_royals_quarter_depth.test.cjs | PASS | 0.11 | nd Kwame have authored quarter projections; Diego remains a placeholder (0.7798ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 60.5565   |
| cup_safe_load_atomic.test.cjs | PASS | 0.12 | ms) ✔ SAVE-102 invalid slot numbers are rejected without storage writes (0.2825ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.2826   |
| cup_slot_ui_dispatch.test.cjs | PASS | 0.12 | ent (0.6858ms) ✔ UI load cancellation preserves active slot and campaign (0.6122ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.886   |
| default_lineup_roster_qa.test.cjs | PASS | 0.13 | .4383ms) ✔ legacy and modular tactics both enforce the reserve-GK guard (1.1521ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.9202   |
| dortmund_player_metadata_20261016.test.cjs | PASS | 0.16 | und current 2026/27 dates, shirts, heights, source and runtime parity (41.2985ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 103.5248   |
| eight_way_heading.test.cjs | PASS | 0.12 | state (0.1363ms) ✔ existing five-kind rendering contract is not altered (0.5549ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.3278   |
| first_touch_mirror_fps.test.cjs | PASS | 0.12 | ysics, and about-version sources remain independent of acceptance suite (0.7982ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.0198   |
| halftime_coach_advice.test.cjs | PASS | 0.12 | ) ✔ halftime advice is displayed without automatic talk or save mutations (0.2221ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 70.64   |
| hide_ball_pass_counter.test.cjs | PASS | 0.12 | nd ball-possession checks still reject casts without spending resources (0.1262ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.8927   |
| keeper_ai_lunge_guard.test.cjs | PASS | 0.13 |  save contact and capped dive remain separate, with no shortcut to saves (0.2342ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.427   |
| keeper_dive_telemetry.test.cjs | PASS | 0.12 |  keeper telemetry is pure and excludes passes from shot classifications (0.3644ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.0725   |
| keeper_outcome_cohorts.test.cjs | PASS | 0.12 | eshold boundaries, snapshot stability and shot-only partition accounting (0.356ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.4593   |
| keeper_substitute_dive_state.test.cjs | PASS | 0.12 | s) ✔ replacement also clears completed dive/catch recovery presentation (0.2274ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 64.6992   |
| lan-guest-packets.test.cjs | PASS | 0.12 | 302ms) ✔ guest join and leave packets round-trip through host handshake (0.9372ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.0477   |
| lan-leave.test.cjs | PASS | 0.12 | AN authenticated leave clears running and shooting controls immediately (2.9405ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.6463   |
| lan-snapshot-channel.test.cjs | PASS | 0.13 | ) ✔ LAN-037 pre-aborted guest signal never binds or consumes a snapshot (0.7162ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 72.9718   |
| lan_auto_lobby_contract.test.cjs | PASS | 0.12 | s (1.0094ms) ✔ LAN host can recover after an approved guest disconnects (0.2892ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.3926   |
| lan_discovery_controller.test.cjs | PASS | 0.13 | bleRooms tracks occupancy, excludes own room and expires stale listings (6.1137ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.3663   |
| lan_host_approval.test.cjs | PASS | 0.12 | es room (0.7447ms) ✔ transport failure keeps pending decision retryable (0.2476ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.7903   |
| lan_host_inflight_duplicate.test.cjs | PASS | 0.12 | ✔ duplicate request rejected while decision transport is pending (4.1823ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.219   |
| lan_host_pending_lookup.test.cjs | PASS | 0.11 | ✔ pending lookup tracks expiry and host close (3.0331ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.7489   |
| lan_integration.test.cjs | PASS | 0.12 | omplete protocol DataChannel host/guest simulation and remote rendering (10.4711ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 71.393   |
| lan_metadata.test.cjs | PASS | 0.12 | ms) ✔ LAN-047 malformed phase, selected players or ownership is rejected (0.9773ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 64.944   |
| lan_protocol.test.cjs | PASS | 0.13 | network codec rejects malformed axes and retains fractional precision (0.1915ms) ℹ tests 35 ℹ suites 0 ℹ pass 35 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.1183   |
| lan_room_count.test.cjs | PASS | 0.12 | ✔ room count updates on expiry (3.0621ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.4273   |
| lan_room_snapshot.test.cjs | PASS | 0.13 | nsent broker forwards bounded guest name and original host display name (1.4792ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.4098   |
| lan_static_policy.test.cjs | PASS | 0.12 |  HTTP server rejects repository internals, traversal and symlink escapes (0.2591ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 64.319   |
| magic_bat_slide_counter.test.cjs | PASS | 0.12 | ✔ Bat JUMP counter is documented in Player Studio without a fifth action (0.7809ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.568   |
| magic_freeze_slide_counter.test.cjs | PASS | 0.12 | eze slide counter is documented without a fifth action or new save field (0.832ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.5611   |
| magic_scream_jump_counter.test.cjs | PASS | 0.11 | r Studio documents existing JUMP counter; no extra action or save field (0.8331ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.3213   |
| magic_trick_hold.test.cjs | PASS | 0.11 | s) ✔ Controls and Player Studio document holding Dribble for one second (0.1131ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.3118   |
| man_utd_fc27_official_20261016.test.cjs | PASS | 0.16 | ight (3.0711ms) ✔ Immutable Manchester United per-field metadata batch (4.0398ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 104.0083   |
| national_roster_regression_trigger.test.cjs | PASS | 0.12 | luded (0.1981ms) ✔ full census retains manual and pull request triggers (0.1131ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.7378   |
| pass_reception_audio.test.cjs | PASS | 0.12 |  engine emits passReceived accurate/friendly fields through UI to audio (1.2053ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.6149   |
| penalty_keeper_visual.test.cjs | PASS | 0.12 | ty renderer animates the defending side without mutating shootout state (1.6185ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.1469   |
| physics_tuning_v082534.test.cjs | PASS | 0.12 | e (0.8278ms) ✔ keeper catches are held at glove height until distribution (0.7613ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.03   |
| player_art_v3_contract.test.cjs | PASS | 0.13 | 4.5629ms) ✔ layered fringe option is hairstyle and no longer a headband (0.1009ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.6635   |
| player_studio_shot_guide.test.cjs | PASS | 0.12 | ✔ shot selection and tier both refresh the live guide and existing icon (0.5957ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.3924   |
| rainbow_facing_counter.test.cjs | PASS | 0.12 | rs retain odds (0.2486ms) ✔ Live engine supplies actual defender facing (0.5499ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.3367   |
| shotpaths_live_20261020.test.cjs | PASS | 0.12 | al live updateBall and keeper plane prediction invoke one shared helper (0.3974ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.3992   |
| spinning_bumper_defence.test.cjs | PASS | 0.12 | ty is a configuration extension, not a fifth action key or roster change (0.634ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.5298   |
| studio_defence_ability.test.cjs | PASS | 0.12 | 7838ms) ✔ Studio ability catalogue refreshes when selected tier changes (1.2368ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.5117   |
| studio_defence_tier_preview.test.cjs | PASS | 0.12 | ier-change callback retains unlocked moves and clears newly locked ones (0.7149ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.4608   |
| studio_eight_action_gallery.test.cjs | PASS | 0.13 | gallery frames keep their cached accessible labels without extra redraws (1.479ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 73.8881   |
| studio_gallery_v082532.test.cjs | PASS | 0.12 | all 14 attributes and saves atomically without changing player identity (1.3248ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.5378   |
| studio_magic_goalkeeper_guide.test.cjs | PASS | 0.11 | TUDIO-GK-HELP-01 goalkeeper eligibility preview never suggests equipping (1.0998ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.648   |
| studio_magic_noop_save.test.cjs | PASS | 0.12 | .7784ms) ✔ STUDIO-MAGIC-NOOP-01: real removal still writes exactly once (1.2495ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.5709   |
| studio_random_options.test.cjs | PASS | 0.13 | ndomizer explains when no alternatives exist without redraw or saving (0.4408ms) ℹ tests 20 ℹ suites 0 ℹ pass 20 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.7971   |
| substitution_advice.test.cjs | PASS | 0.11 | ms) ✔ pregame/paused wiring is confined to existing Team Command Center (0.1099ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 61.4172   |
| tactical_audio_feedback.test.cjs | PASS | 0.12 | existing gameplay sound events and engine-to-audio bridge are preserved (1.4815ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.0573   |
| ui_back_routes_20261020.test.cjs | PASS | 0.12 | tes (0.4647ms) ✔ Controller mapping footer does not skip Input Settings (0.1033ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.4346   |

Summary: {"PASS": 82, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
