# Full regression — node, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| aerial_mechanics.mjs | PASS | 0.19 | v0.8.1 AERIAL TEST PASS: hyperdash duration/cooldown/fatigue, timed heading, ordinary GK dives, save direction, old rare abilities   |
| career.mjs | PASS | 0.14 | Career tests: PASS • 83 teams • 12/team • 2026 caricatures • training • transfer • three cup rounds • 14 league rounds • new season   |
| club_roster_batch_ledger.mjs | PASS | 0.14 | PASS 165 clubs / 1,980 current player snapshots / 207 baseline replacements + 1 subsequent recorded edits / 6 immutable batches; source, role, audit SHA and history chain valid   |
| current_fc27_club_contract.mjs | PASS | 0.14 |   |
| fitness_substitutions.mjs | PASS | 0.15 | v0.7.1 FITNESS & SUBSTITUTIONS PASS — distinct action costs, permanent three-sub limit, no re-entry, fatigue ledger, halftime recovery, CPU swap, career fitness   |
| input_buffer.mjs | PASS | 0.06 | INPUT BUFFER PASS: keyboard/touch quick taps, simultaneous buttons, held keys, multi-pointer, joystick handoff, blur cleanup   |
| penalty_controls.mjs | PASS | 0.13 | v0.8.8 PENALTY & BINDING PASS — movement, dribble, keeper dive, shooting origin, safe profiles, real polling   |
| secondary_controls.mjs | PASS | 0.14 | v0.8.12 SECONDARY CONTROLS PASS: old saves, P2 keyboard/gamepad isolation, double-jump defense, keeper dive   |
| tactics_identity.mjs | PASS | 0.16 | v0.7.0 TACTICS & IDENTITY PASS — all 216 team identities, roles, substitution, settings, invalid input safeguards   |
| v08191_input_queue.mjs | PASS | 0.12 | v0.8.19.1 INPUT QUEUE PASS — 3 keyboard / 4 touch cycles, hold duration, sprint disambiguation, reset and remapping   |
| v08194_keeper_balance.mjs | PASS | 0.12 | R-LANE COVERAGE (not real match save %) {"weakCoverage":0.3442622950819672,"strongCoverage":0.7704918032786885,"slowCoverage":0.639344262295082,"fastCoverage":0.5081967213114754}   |
| v0819_goalkeeper.mjs | PASS | 0.13 | v0.8.19 GOALKEEPERS: catches/throws/punts/pressure/blocked lanes/auto saves both teams: PASS   |
| v08205_manchester_liverpool_verified.mjs | PASS | 0.16 | PASS current FC27 source and positional club contract: Manchester City, Liverpool   |
| v08206_roster_inventory.mjs | PASS | 0.14 | icial club registration list.","Repeated identities across national teams must be canonicalized before player-tier population limits can be enforced."],"unverifiedClubRole":2531}   |
| v08221_aerial_super_rework.mjs | PASS | 0.16 | v0.8.22.1: six input variants, both directions, two taps, single-tap timeout, double jump, non-specialists, unified special shot physics/graphics, cancellation, no repeated shots   |
| v0823_audio.mjs | PASS | 0.11 | PASS v0.8.23 audio: gesture gate, event mapping, mute, volumes, cues, scenes, standalone and controls   |
| v082411_opportunity_replay.mjs | PASS | 20.35 | :6,"savesByCPU":28,"kicksByHumanTeam":43,"possessionShareHuman":0.15,"endedInTiebreak":5,"attempts":124,"shots":71,"passes":53,"keeperSavesLinked":50,"defenderInterceptions":10}}   |
| v08241_moving_keeper.mjs | PASS | 0.17 | PASS v0.8.24.3 moving-keeper forecast and 30/60/120Hz bounded integration: 96 fixtures   |
| v08245_release_alignment.mjs | PASS | 0.13 | PASS release/browser alignment 0.12.22.0 84 checks   |
| v08249_zero_human_control.mjs | PASS | 0.14 | PASS v0.8.24.9 player-control ownership 0/1/2 humans and autonomous AI-vs-AI home player   |
| ability_shot_ball_shapes.test.cjs | PASS | 0.17 | ity (0.2687ms) ✔ player ability summary ignores inherited catalogue keys (0.264ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.6381   |
| arena_overhaul_visual_contract.test.cjs | PASS | 0.18 | ay Now and Quick Match are unique, with home focus on the primary card (0.1538ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.2239   |
| authored_directional_coverage.test.cjs | PASS | 0.15 | ) ✔ cross-realm catalogs are counted consistently without mutating them (0.2712ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.4135   |
| brighton_player_metadata_20261016.test.cjs | PASS | 0.19 | ✔ Brighton 2026/27 metadata, parity, age, shirts and immutable audit (44.9292ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 125.294   |
| career_growth.test.cjs | PASS | 0.16 | acilities and optional fields can age into regression without migration (0.4043ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.2263   |
| career_role_fit.test.cjs | PASS | 0.16 | e evaluation is read-only and retains four-button and About contracts (0.3915ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.3827   |
| career_slot_standings_preview.test.cjs | PASS | 0.18 | 6ms) ✔ Career save-slot screen displays standings only when available (16.5615ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 109.1741   |
| club_player_identity_20261016.test.cjs | PASS | 0.19 | ✔ Aston Villa verified metadata and runtime exactly match (42.7245ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 127.841   |
| concept_hero_roster_identities.test.cjs | PASS | 0.16 | the original illustrated eyes and face instead of painting opaque masks (0.2616ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.4381   |
| concept_royals_visual_qa_page.test.cjs | PASS | 0.14 | um screenshot workflow captures all 12 × 5 directions and 300 run poses (0.9985ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 75.0836   |
| crown_royals_hair_consistency.test.cjs | PASS | 0.15 | pixels (6.4665ms) ✔ missing canvas readback falls back to original image (0.8269ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.619   |
| crown_royals_reference.test.cjs | PASS | 0.18 |  Shot is visually distinct and jump lift works in both phase directions (1.7362ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 89.5808   |
| cup_save_slots.test.cjs | PASS | 0.16 | e permits Cup autosave flow in memory but never conceals quota failures (1.5356ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 90.2935   |
| cup_storage_rollback.test.cjs | PASS | 0.15 | r (1.2034ms) ✔ SAVE-102 failed first save restores absence of vault key (0.5558ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.5207   |
| default_lineup_roster_qa.test.cjs | PASS | 0.16 | 5048ms) ✔ legacy and modular tactics both enforce the reserve-GK guard (1.4355ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.2202   |
| dortmund_player_metadata_20261016.test.cjs | PASS | 0.19 | und current 2026/27 dates, shirts, heights, source and runtime parity (43.9126ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 121.1329   |
| eight_way_heading.test.cjs | PASS | 0.14 |  state (0.1833ms) ✔ existing five-kind rendering contract is not altered (0.654ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 82.9063   |
| first_touch_mirror_fps.test.cjs | PASS | 0.16 | ysics, and about-version sources remain independent of acceptance suite (0.9892ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.9136   |
| halftime_coach_advice.test.cjs | PASS | 0.17 | ✔ halftime advice is displayed without automatic talk or save mutations (0.2228ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.1765   |
| hide_ball_pass_counter.test.cjs | PASS | 0.17 | nd ball-possession checks still reject casts without spending resources (0.2331ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.3988   |
| keeper_ai_lunge_guard.test.cjs | PASS | 0.17 | save contact and capped dive remain separate, with no shortcut to saves (0.3264ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 88.7805   |
| keeper_dive_telemetry.test.cjs | PASS | 0.16 |  keeper telemetry is pure and excludes passes from shot classifications (0.9661ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.3877   |
| keeper_outcome_cohorts.test.cjs | PASS | 0.20 | hold boundaries, snapshot stability and shot-only partition accounting (0.6504ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 114.1338   |
| keeper_substitute_dive_state.test.cjs | PASS | 0.21 | ) ✔ replacement also clears completed dive/catch recovery presentation (0.3392ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 110.4956   |
| lan-guest-packets.test.cjs | PASS | 0.22 | 112ms) ✔ guest join and leave packets round-trip through host handshake (2.7722ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 127.746   |
| lan-leave.test.cjs | PASS | 0.20 | N authenticated leave clears running and shooting controls immediately (2.6681ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 115.2748   |
| lan-snapshot-channel.test.cjs | PASS | 0.20 |  ✔ LAN-037 pre-aborted guest signal never binds or consumes a snapshot (2.4363ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 118.1911   |
| lan_auto_lobby_contract.test.cjs | PASS | 0.19 |  (2.1358ms) ✔ LAN host can recover after an approved guest disconnects (1.0538ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 113.0967   |
| lan_discovery_controller.test.cjs | PASS | 0.21 | leRooms tracks occupancy, excludes own room and expires stale listings (9.2773ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 129.3954   |
| lan_host_approval.test.cjs | PASS | 0.18 | es room (2.0498ms) ✔ transport failure keeps pending decision retryable (0.6817ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.7928   |
| lan_host_inflight_duplicate.test.cjs | PASS | 0.17 | ✔ duplicate request rejected while decision transport is pending (3.7224ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.8358   |
| lan_host_pending_lookup.test.cjs | PASS | 0.17 | ✔ pending lookup tracks expiry and host close (3.354ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.5324   |
| lan_integration.test.cjs | PASS | 0.19 | plete protocol DataChannel host/guest simulation and remote rendering (19.3186ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 113.0223   |
| lan_metadata.test.cjs | PASS | 0.18 | s) ✔ LAN-047 malformed phase, selected players or ownership is rejected (1.3711ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.7189   |
| lan_protocol.test.cjs | PASS | 0.21 | network codec rejects malformed axes and retains fractional precision (0.9055ms) ℹ tests 35 ℹ suites 0 ℹ pass 35 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 127.287   |
| lan_room_count.test.cjs | PASS | 0.19 | ✔ room count updates on expiry (5.596ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 110.2062   |
| lan_room_snapshot.test.cjs | PASS | 0.19 | sent broker forwards bounded guest name and original host display name (1.9667ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 110.1429   |
| lan_static_policy.test.cjs | PASS | 0.20 | TTP server rejects repository internals, traversal and symlink escapes (0.6349ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 108.5467   |
| magic_bat_slide_counter.test.cjs | PASS | 0.21 | Bat JUMP counter is documented in Player Studio without a fifth action (1.9407ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 121.9078   |
| magic_freeze_slide_counter.test.cjs | PASS | 0.19 | e slide counter is documented without a fifth action or new save field (2.2398ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 108.6833   |
| magic_scream_jump_counter.test.cjs | PASS | 0.18 |  Studio documents existing JUMP counter; no extra action or save field (1.1882ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.0128   |
| magic_trick_hold.test.cjs | PASS | 0.17 | s) ✔ Controls and Player Studio document holding Dribble for one second (0.1681ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.9344   |
| man_utd_fc27_official_20261016.test.cjs | PASS | 0.23 | ight (4.3083ms) ✔ Immutable Manchester United per-field metadata batch (5.9938ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 149.3675   |
| national_roster_regression_trigger.test.cjs | PASS | 0.19 | uded (0.3595ms) ✔ full census retains manual and pull request triggers (0.2532ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 114.5706   |
| pass_reception_audio.test.cjs | PASS | 0.19 | engine emits passReceived accurate/friendly fields through UI to audio (1.5269ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 109.4959   |
| penalty_keeper_visual.test.cjs | PASS | 0.19 | y renderer animates the defending side without mutating shootout state (4.1299ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 115.3776   |
| physics_tuning_v082534.test.cjs | PASS | 0.19 | 1.3421ms) ✔ keeper catches are held at glove height until distribution (0.9452ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 105.4145   |
| player_art_v3_contract.test.cjs | PASS | 0.19 | .6713ms) ✔ layered fringe option is hairstyle and no longer a headband (0.2019ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 117.4615   |
| player_studio_shot_guide.test.cjs | PASS | 0.18 | ✔ shot selection and tier both refresh the live guide and existing icon (0.7707ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.1022   |
| rainbow_facing_counter.test.cjs | PASS | 0.17 | ers retain odds (0.325ms) ✔ Live engine supplies actual defender facing (1.7783ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.5894   |
| shotpaths_build_integration_20261020.test.cjs | PASS | 0.20 | l module import, offline precache and stale-cache eviction stay intact (2.6263ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 122.4882   |
| spain_national_metadata_20261016.test.cjs | PASS | 0.17 | national teams retain 12 players; Spain preserves immutable composition (0.7452ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.3834   |
| studio_appearance_reset.test.cjs | PASS | 0.18 |  (0.9659ms) ✔ reset button and disabled state are wired to Studio only (0.4148ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 107.2022   |
| studio_defence_noop_save.test.cjs | PASS | 0.18 | IO-DEFENCE-NOOP-01: real ability change persists, invalid tier rejects (2.5012ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 109.0185   |
| studio_dribble_noop_save.test.cjs | PASS | 0.18 | ) ✔ invalid style is rejected before any no-op shortcut or persistence (0.8705ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 103.3591   |
| studio_gallery_frame_steps.test.cjs | PASS | 0.18 |  frame controls are accessible, delegated and limited to Player Studio (1.0129ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 105.2789   |
| studio_jumping_preview.test.cjs | PASS | 0.18 | ✔ both offline shell and generated QA fixture include the shared module (0.5005ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 107.708   |
| studio_magic_live_save_state.test.cjs | PASS | 0.17 | c Trick live status is accessible, refreshed on selection and read-only (0.2176ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.6215   |
| studio_magic_unlock_missing_rating.test.cjs | PASS | 0.17 |  STUDIO-TRICK-PROGRESS-02 distinguishes missing legacy rating from zero (3.2222ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.9324   |
| studio_shot_save_state.test.cjs | PASS | 0.18 |  ✔ Super Shot save feedback is accessible and updates for shot and tier (1.1216ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.8066   |
| tackle_animation.test.cjs | PASS | 0.18 | ction poses freeze locomotion gait while regular running stays animated (0.3052ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.2504   |
| tornado_trail_render.test.cjs | PASS | 0.18 | n is limited to spiral shots; ordinary transformation trails stay intact (1.0135ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.913   |
| ui_no_dev_banner_20261020.test.cjs | PASS | 0.17 |  (0.349ms) ✔ four controls and gameplay-specific screens remain present (0.3029ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.4471   |

Summary: {"PASS": 83, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
