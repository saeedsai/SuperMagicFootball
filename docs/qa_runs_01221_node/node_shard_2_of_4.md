# Full regression — node, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| aerial_mechanics.mjs | PASS | 0.37 | v0.8.1 AERIAL TEST PASS: hyperdash duration/cooldown/fatigue, timed heading, ordinary GK dives, save direction, old rare abilities   |
| career.mjs | PASS | 0.13 | Career tests: PASS • 83 teams • 12/team • 2026 caricatures • training • transfer • three cup rounds • 14 league rounds • new season   |
| club_roster_batch_ledger.mjs | PASS | 0.15 | PASS 165 clubs / 1,980 current player snapshots / 207 baseline replacements + 1 subsequent recorded edits / 6 immutable batches; source, role, audit SHA and history chain valid   |
| current_fc27_club_contract.mjs | PASS | 0.14 |   |
| fitness_substitutions.mjs | PASS | 0.13 | v0.7.1 FITNESS & SUBSTITUTIONS PASS — distinct action costs, permanent three-sub limit, no re-entry, fatigue ledger, halftime recovery, CPU swap, career fitness   |
| input_buffer.mjs | PASS | 0.07 | INPUT BUFFER PASS: keyboard/touch quick taps, simultaneous buttons, held keys, multi-pointer, joystick handoff, blur cleanup   |
| penalty_controls.mjs | PASS | 0.13 | v0.8.8 PENALTY & BINDING PASS — movement, dribble, keeper dive, shooting origin, safe profiles, real polling   |
| secondary_controls.mjs | PASS | 0.13 | v0.8.12 SECONDARY CONTROLS PASS: old saves, P2 keyboard/gamepad isolation, double-jump defense, keeper dive   |
| tactics_identity.mjs | PASS | 0.14 | v0.7.0 TACTICS & IDENTITY PASS — all 216 team identities, roles, substitution, settings, invalid input safeguards   |
| v08191_input_queue.mjs | PASS | 0.12 | v0.8.19.1 INPUT QUEUE PASS — 3 keyboard / 4 touch cycles, hold duration, sprint disambiguation, reset and remapping   |
| v08194_keeper_balance.mjs | PASS | 0.12 | R-LANE COVERAGE (not real match save %) {"weakCoverage":0.3442622950819672,"strongCoverage":0.7704918032786885,"slowCoverage":0.639344262295082,"fastCoverage":0.5081967213114754}   |
| v0819_goalkeeper.mjs | PASS | 0.12 | v0.8.19 GOALKEEPERS: catches/throws/punts/pressure/blocked lanes/auto saves both teams: PASS   |
| v08205_manchester_liverpool_verified.mjs | PASS | 0.15 | PASS current FC27 source and positional club contract: Manchester City, Liverpool   |
| v08206_roster_inventory.mjs | PASS | 0.14 | icial club registration list.","Repeated identities across national teams must be canonicalized before player-tier population limits can be enforced."],"unverifiedClubRole":2531}   |
| v08221_aerial_super_rework.mjs | PASS | 0.13 | v0.8.22.1: six input variants, both directions, two taps, single-tap timeout, double jump, non-specialists, unified special shot physics/graphics, cancellation, no repeated shots   |
| v0823_audio.mjs | PASS | 0.10 | PASS v0.8.23 audio: gesture gate, event mapping, mute, volumes, cues, scenes, standalone and controls   |
| v082411_opportunity_replay.mjs | PASS | 13.06 | :6,"savesByCPU":28,"kicksByHumanTeam":43,"possessionShareHuman":0.15,"endedInTiebreak":5,"attempts":124,"shots":71,"passes":53,"keeperSavesLinked":50,"defenderInterceptions":10}}   |
| v08241_moving_keeper.mjs | PASS | 0.17 | PASS v0.8.24.3 moving-keeper forecast and 30/60/120Hz bounded integration: 96 fixtures   |
| v08245_release_alignment.mjs | PASS | 0.16 | PASS release/browser alignment 0.12.21.0 84 checks   |
| v08249_zero_human_control.mjs | PASS | 0.15 | PASS v0.8.24.9 player-control ownership 0/1/2 humans and autonomous AI-vs-AI home player   |
| ability_shot_ball_shapes.test.cjs | PASS | 0.16 | ty (0.3454ms) ✔ player ability summary ignores inherited catalogue keys (0.3106ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.0246   |
| arena_overhaul_visual_contract.test.cjs | PASS | 0.17 | lay Now and Quick Match are unique, with home focus on the primary card (0.1631ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.4393   |
| authored_directional_coverage.test.cjs | PASS | 0.17 | ) ✔ cross-realm catalogs are counted consistently without mutating them (0.3128ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.7241   |
| brighton_player_metadata_20261016.test.cjs | PASS | 0.23 | ✔ Brighton 2026/27 metadata, parity, age, shirts and immutable audit (51.9155ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 158.7277   |
| career_growth.test.cjs | PASS | 0.17 | acilities and optional fields can age into regression without migration (0.3439ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.0576   |
| career_role_fit.test.cjs | PASS | 0.16 | e evaluation is read-only and retains four-button and About contracts (0.7071ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.3867   |
| career_slot_standings_preview.test.cjs | PASS | 0.17 | 7ms) ✔ Career save-slot screen displays standings only when available (16.6838ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 105.5724   |
| club_player_identity_20261016.test.cjs | PASS | 0.19 | ✔ Aston Villa verified metadata and runtime exactly match (45.8081ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 120.8748   |
| concept_hero_roster_identities.test.cjs | PASS | 0.15 | the original illustrated eyes and face instead of painting opaque masks (0.2199ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.1639   |
| concept_royals_visual_qa_page.test.cjs | PASS | 0.15 | um screenshot workflow captures all 12 × 5 directions and 300 run poses (1.4946ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 83.8717   |
| crown_royals_hair_consistency.test.cjs | PASS | 0.17 | xels (10.2663ms) ✔ missing canvas readback falls back to original image (0.849ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 100.4872   |
| crown_royals_reference.test.cjs | PASS | 0.16 |  Shot is visually distinct and jump lift works in both phase directions (1.8863ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.9255   |
| cup_save_slots.test.cjs | PASS | 0.16 | e permits Cup autosave flow in memory but never conceals quota failures (1.6203ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.0141   |
| cup_storage_rollback.test.cjs | PASS | 0.15 | ir (0.7998ms) ✔ SAVE-102 failed first save restores absence of vault key (0.3377ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.144   |
| default_lineup_roster_qa.test.cjs | PASS | 0.17 | .3989ms) ✔ legacy and modular tactics both enforce the reserve-GK guard (1.3367ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.3562   |
| dortmund_player_metadata_20261016.test.cjs | PASS | 0.19 | mund current 2026/27 dates, shirts, heights, source and runtime parity (45.838ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 123.9211   |
| eight_way_heading.test.cjs | PASS | 0.15 | state (0.1189ms) ✔ existing five-kind rendering contract is not altered (0.8342ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.2545   |
| first_touch_mirror_fps.test.cjs | PASS | 0.15 | ysics, and about-version sources remain independent of acceptance suite (1.3848ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.5882   |
| halftime_coach_advice.test.cjs | PASS | 0.15 | ✔ halftime advice is displayed without automatic talk or save mutations (0.2233ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 81.3852   |
| hide_ball_pass_counter.test.cjs | PASS | 0.15 | nd ball-possession checks still reject casts without spending resources (0.1381ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.1602   |
| keeper_ai_lunge_guard.test.cjs | PASS | 0.15 | save contact and capped dive remain separate, with no shortcut to saves (0.3363ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 82.5225   |
| keeper_dive_telemetry.test.cjs | PASS | 0.15 |  keeper telemetry is pure and excludes passes from shot classifications (0.5613ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.7985   |
| keeper_outcome_cohorts.test.cjs | PASS | 0.15 | shold boundaries, snapshot stability and shot-only partition accounting (0.9836ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.9971   |
| keeper_substitute_dive_state.test.cjs | PASS | 0.15 | s) ✔ replacement also clears completed dive/catch recovery presentation (0.2153ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.0359   |
| lan-guest-packets.test.cjs | PASS | 0.16 | 785ms) ✔ guest join and leave packets round-trip through host handshake (1.2514ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.4884   |
| lan-leave.test.cjs | PASS | 0.14 | AN authenticated leave clears running and shooting controls immediately (3.1725ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.7694   |
| lan-snapshot-channel.test.cjs | PASS | 0.14 | ) ✔ LAN-037 pre-aborted guest signal never binds or consumes a snapshot (1.0175ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 81.1874   |
| lan_auto_lobby_contract.test.cjs | PASS | 0.15 | s (1.1087ms) ✔ LAN host can recover after an approved guest disconnects (0.3923ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.5444   |
| lan_discovery_controller.test.cjs | PASS | 0.17 | bleRooms tracks occupancy, excludes own room and expires stale listings (8.4225ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 100.824   |
| lan_host_approval.test.cjs | PASS | 0.15 | es room (1.2777ms) ✔ transport failure keeps pending decision retryable (0.3828ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.8644   |
| lan_host_inflight_duplicate.test.cjs | PASS | 0.14 | ✔ duplicate request rejected while decision transport is pending (5.774ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 82.1323   |
| lan_host_pending_lookup.test.cjs | PASS | 0.14 | ✔ pending lookup tracks expiry and host close (4.3574ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 78.8289   |
| lan_integration.test.cjs | PASS | 0.15 | mplete protocol DataChannel host/guest simulation and remote rendering (14.6043ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.6834   |
| lan_metadata.test.cjs | PASS | 0.14 | s) ✔ LAN-047 malformed phase, selected players or ownership is rejected (2.3547ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 82.0075   |
| lan_protocol.test.cjs | PASS | 0.18 | etwork codec rejects malformed axes and retains fractional precision (0.2863ms) ℹ tests 35 ℹ suites 0 ℹ pass 35 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 111.6627   |
| lan_room_count.test.cjs | PASS | 0.16 | ✔ room count updates on expiry (4.4211ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.5728   |
| lan_room_snapshot.test.cjs | PASS | 0.15 | onsent broker forwards bounded guest name and original host display name (1.3174ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.896   |
| lan_static_policy.test.cjs | PASS | 0.14 | HTTP server rejects repository internals, traversal and symlink escapes (0.3345ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.9301   |
| magic_bat_slide_counter.test.cjs | PASS | 0.15 |  Bat JUMP counter is documented in Player Studio without a fifth action (0.9584ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 85.9762   |
| magic_freeze_slide_counter.test.cjs | PASS | 0.14 | ze slide counter is documented without a fifth action or new save field (1.4763ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.4473   |
| magic_scream_jump_counter.test.cjs | PASS | 0.13 | r Studio documents existing JUMP counter; no extra action or save field (0.9382ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.1316   |
| magic_trick_hold.test.cjs | PASS | 0.14 | s) ✔ Controls and Player Studio document holding Dribble for one second (0.1233ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.3749   |
| man_utd_fc27_official_20261016.test.cjs | PASS | 0.18 | eight (3.2672ms) ✔ Immutable Manchester United per-field metadata batch (4.541ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 122.8999   |
| national_roster_regression_trigger.test.cjs | PASS | 0.14 | cluded (0.1866ms) ✔ full census retains manual and pull request triggers (0.1286ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 75.869   |
| pass_reception_audio.test.cjs | PASS | 0.14 |  engine emits passReceived accurate/friendly fields through UI to audio (1.6305ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.9971   |
| penalty_keeper_visual.test.cjs | PASS | 0.13 | ty renderer animates the defending side without mutating shootout state (1.9432ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 73.6041   |
| physics_tuning_v082534.test.cjs | PASS | 0.14 |  (0.8736ms) ✔ keeper catches are held at glove height until distribution (0.828ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.8633   |
| player_art_v3_contract.test.cjs | PASS | 0.15 | 7.6488ms) ✔ layered fringe option is hairstyle and no longer a headband (0.1479ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.8093   |
| player_studio_shot_guide.test.cjs | PASS | 0.14 |  ✔ shot selection and tier both refresh the live guide and existing icon (0.851ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 75.8376   |
| rainbow_facing_counter.test.cjs | PASS | 0.13 | ers retain odds (0.2411ms) ✔ Live engine supplies actual defender facing (0.5957ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 70.551   |
| shotpaths_live_20261020.test.cjs | PASS | 0.14 | ual live updateBall and keeper plane prediction invoke one shared helper (0.4545ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 84.432   |
| spinning_bumper_defence.test.cjs | PASS | 0.13 | y is a configuration extension, not a fifth action key or roster change (0.9182ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.8214   |
| studio_appearance_save_state.test.cjs | PASS | 0.13 | udio save-state hint and accessible button respond to appearance inputs (0.2433ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 75.0538   |
| studio_defence_save_state.test.cjs | PASS | 0.13 |  accessible and updates for both ability and tier without writing saves (0.2244ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 74.5711   |
| studio_dribble_save_state.test.cjs | PASS | 0.13 | Style preview wires accessible live state without automatic persistence (0.1959ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 73.5512   |
| studio_gallery_pick.test.cjs | PASS | 0.14 | vertises shortcuts and delegates keydown without extra gameplay controls (0.6384ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.308   |
| studio_magic_counter_playbook.test.cjs | PASS | 0.13 | ield and goalkeeper Studio share the same playbook without a new action (0.1815ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.5304   |
| studio_magic_locked_preview.test.cjs | PASS | 0.14 |  tricks are discoverable but locked save remains disabled and validated (0.2666ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.3572   |
| studio_magic_unlock_progress.test.cjs | PASS | 0.13 | progress only for outfield Trick equipment, never saves through preview (0.2891ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 77.0563   |
| studio_trick_help.test.cjs | PASS | 0.13 | -HELP-01 selected Magic Trick explains existing DRIBBLE hold activation (0.7265ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 73.2694   |
| tackle_defence_reach.test.cjs | PASS | 0.13 | lide movement budget uses Defence reach and keeps existing speed/timing (0.1932ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 71.4567   |
| touch_dribble_pulse.test.cjs | PASS | 0.14 | celling second DRIBBLE touch discards deferred edge without phantom tap (0.4231ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.3162   |
| versioning_policy_contract.test.cjs | PASS | 3.70 | 5 release notes describe duplicate pending host approval protection (0.7133ms) ℹ tests 16 ℹ suites 0 ℹ pass 16 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 3641.7481   |

Summary: {"PASS": 83, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
