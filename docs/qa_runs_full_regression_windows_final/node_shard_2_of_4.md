# Full regression — node, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| aerial_mechanics.mjs | PASS | 0.10 | v0.8.1 AERIAL TEST PASS: hyperdash duration/cooldown/fatigue, timed heading, ordinary GK dives, save direction, old rare abilities   |
| career.mjs | PASS | 0.08 | Career tests: PASS • 83 teams • 12/team • 2026 caricatures • training • transfer • three cup rounds • 14 league rounds • new season   |
| club_roster_batch_ledger.mjs | PASS | 0.09 | PASS 165 clubs / 1,980 current player snapshots / 207 baseline replacements + 1 subsequent recorded edits / 6 immutable batches; source, role, audit SHA and history chain valid   |
| current_fc27_club_contract.mjs | PASS | 0.10 |   |
| fitness_substitutions.mjs | PASS | 0.10 | v0.7.1 FITNESS & SUBSTITUTIONS PASS — distinct action costs, permanent three-sub limit, no re-entry, fatigue ledger, halftime recovery, CPU swap, career fitness   |
| input_buffer.mjs | PASS | 0.06 | INPUT BUFFER PASS: keyboard/touch quick taps, simultaneous buttons, held keys, multi-pointer, joystick handoff, blur cleanup   |
| penalty_controls.mjs | PASS | 0.09 | v0.8.8 PENALTY & BINDING PASS — movement, dribble, keeper dive, shooting origin, safe profiles, real polling   |
| secondary_controls.mjs | PASS | 0.09 | v0.8.12 SECONDARY CONTROLS PASS: old saves, P2 keyboard/gamepad isolation, double-jump defense, keeper dive   |
| tactics_identity.mjs | PASS | 0.11 | v0.7.0 TACTICS & IDENTITY PASS — all 216 team identities, roles, substitution, settings, invalid input safeguards   |
| v08191_input_queue.mjs | PASS | 0.09 | v0.8.19.1 INPUT QUEUE PASS — 3 keyboard / 4 touch cycles, hold duration, sprint disambiguation, reset and remapping   |
| v08194_keeper_balance.mjs | PASS | 0.09 | R-LANE COVERAGE (not real match save %) {"weakCoverage":0.3442622950819672,"strongCoverage":0.7704918032786885,"slowCoverage":0.639344262295082,"fastCoverage":0.5081967213114754}   |
| v0819_goalkeeper.mjs | PASS | 0.09 | v0.8.19 GOALKEEPERS: catches/throws/punts/pressure/blocked lanes/auto saves both teams: PASS   |
| v08205_manchester_liverpool_verified.mjs | PASS | 0.10 | PASS current FC27 source and positional club contract: Manchester City, Liverpool   |
| v08206_roster_inventory.mjs | PASS | 0.11 | icial club registration list.","Repeated identities across national teams must be canonicalized before player-tier population limits can be enforced."],"unverifiedClubRole":2531}   |
| v08221_aerial_super_rework.mjs | PASS | 0.10 | v0.8.22.1: six input variants, both directions, two taps, single-tap timeout, double jump, non-specialists, unified special shot physics/graphics, cancellation, no repeated shots   |
| v0823_audio.mjs | PASS | 0.06 | PASS v0.8.23 audio: gesture gate, event mapping, mute, volumes, cues, scenes, standalone and controls   |
| v082411_opportunity_replay.mjs | PASS | 11.57 | :6,"savesByCPU":28,"kicksByHumanTeam":43,"possessionShareHuman":0.15,"endedInTiebreak":5,"attempts":124,"shots":71,"passes":53,"keeperSavesLinked":50,"defenderInterceptions":10}}   |
| v08241_moving_keeper.mjs | PASS | 0.13 | PASS v0.8.24.3 moving-keeper forecast and 30/60/120Hz bounded integration: 96 fixtures   |
| v08245_release_alignment.mjs | PASS | 0.12 | PASS release/browser alignment 0.12.19.0 84 checks   |
| v08249_zero_human_control.mjs | PASS | 0.11 | PASS v0.8.24.9 player-control ownership 0/1/2 humans and autonomous AI-vs-AI home player   |
| ability_shot_ball_shapes.test.cjs | PASS | 0.12 | ty (0.2231ms) ✔ player ability summary ignores inherited catalogue keys (0.2564ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 71.6236   |
| arena_overhaul_visual_contract.test.cjs | PASS | 0.12 | lay Now and Quick Match are unique, with home focus on the primary card (0.1806ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.3441   |
| authored_directional_coverage.test.cjs | PASS | 0.13 | ) ✔ cross-realm catalogs are counted consistently without mutating them (0.1776ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.9575   |
| brighton_player_metadata_20261016.test.cjs | PASS | 0.15 | ✔ Brighton 2026/27 metadata, parity, age, shirts and immutable audit (33.7172ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.6624   |
| career_growth.test.cjs | PASS | 0.13 | acilities and optional fields can age into regression without migration (0.3086ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 78.2229   |
| career_role_fit.test.cjs | PASS | 0.12 | e evaluation is read-only and retains four-button and About contracts (0.6133ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.2399   |
| career_slot_standings_preview.test.cjs | PASS | 0.14 | 58ms) ✔ Career save-slot screen displays standings only when available (20.5963ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 86.0469   |
| club_player_identity_20261016.test.cjs | PASS | 0.15 | ✔ Aston Villa verified metadata and runtime exactly match (32.3049ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.7342   |
| concept_hero_roster_identities.test.cjs | PASS | 0.12 | the original illustrated eyes and face instead of painting opaque masks (0.1492ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.3699   |
| concept_royals_visual_qa_page.test.cjs | PASS | 0.12 | um screenshot workflow captures all 12 × 5 directions and 300 run poses (1.2337ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.1631   |
| crown_royals_hair_consistency.test.cjs | PASS | 0.12 | pixels (5.2568ms) ✔ missing canvas readback falls back to original image (0.6393ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.789   |
| crown_royals_reference.test.cjs | PASS | 0.12 |  Shot is visually distinct and jump lift works in both phase directions (1.2919ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.4517   |
| cup_save_slots.test.cjs | PASS | 0.12 | e permits Cup autosave flow in memory but never conceals quota failures (1.3458ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.5154   |
| cup_storage_rollback.test.cjs | PASS | 0.13 | ir (1.319ms) ✔ SAVE-102 failed first save restores absence of vault key (0.3903ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 73.1267   |
| defence_bat_mace.test.cjs | PASS | 0.12 | E-SWEEP-04: existing four-action grammar and defense event are retained (0.2284ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.3771   |
| dribble_fatigue_defence.test.cjs | PASS | 0.12 | ✔ Rainbow Flick aerial counter requires nearby closing fresh defender (0.2219ms) ℹ tests 14 ℹ suites 0 ℹ pass 14 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.3351   |
| everton_player_metadata_20261016.test.cjs | PASS | 0.17 | e preserving all gameplay and current unresolved club-selection issues (37.4263ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 113.319   |
| full_regression_runner_safety.test.cjs | PASS | 0.61 | on census rejects empty shards and migrates only owned browser tests (495.9522ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 556.5583   |
| halftime_fatigue_spotlight.test.cjs | PASS | 0.13 | s only rendered in halftime coaching panel, never applies substitutions (0.1017ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 64.9921   |
| inter_player_metadata_20261016.test.cjs | PASS | 0.15 | ✔ Inter Milan official age and height metadata batch (33.6685ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 98.9296   |
| keeper_clearance_corridor.test.cjs | PASS | 0.12 |  (0.0862ms) ✔ mirrored team 1 retains safe teammate as a valid candidate (0.067ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.9556   |
| keeper_emergency_clearance.test.cjs | PASS | 0.12 | 363ms) ✔ safe receiver is still preferred to blocked empty turf, team 1 (0.0761ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.8166   |
| keeper_physical_lunge.test.cjs | PASS | 0.12 | called only for AI, and genuine saves still require depth-plane contact (0.1574ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.9816   |
| lan-data-channel.test.cjs | PASS | 0.13 | end failure does not advance sequence and invalid controls are rejected (0.5169ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 78.1973   |
| lan-host-adapter.test.cjs | PASS | 0.12 | er clears held input on leave and stale socket cannot eject replacement (0.4232ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.6173   |
| lan-manual-signaling.test.cjs | PASS | 0.11 | ets (1.2358ms) ✔ manual LAN signaling surfaces peer connection failures (0.2872ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.8642   |
| lan-state-snapshot.test.cjs | PASS | 0.12 |  signed goalkeeper dive direction without breaking old visual snapshots (0.3692ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.4815   |
| lan_auto_lobby_flow.test.cjs | PASS | 0.15 |  busy room rejection restores search and retry in LAN and Online P2P (0.4012ms) ℹ tests 49 ℹ suites 0 ℹ pass 49 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 104.4761   |
| lan_guest_lobby.test.cjs | PASS | 0.12 | trips (3.4284ms) ✔ guest options reject invalid identifiers and timeout (0.3778ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.9473   |
| lan_host_async_delivery.test.cjs | PASS | 0.12 | .2256ms) ✔ late async acknowledgement never extends expired request TTL (0.1852ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.6015   |
| lan_host_invalid_clock.test.cjs | PASS | 0.11 | ft (0.2705ms) ✔ unsafe and fractional clocks cannot create join requests (0.809ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.0318   |
| lan_host_restart.test.cjs | PASS | 0.11 | ✔ same-room restart preserves pending request; switching clears it (3.7878ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 64.1686   |
| lan_join_requests.test.cjs | PASS | 0.12 | ry (0.6907ms) ✔ pending and remembered requests are bounded and cleared (0.2451ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.5759   |
| lan_pages_gateway.test.cjs | PASS | 0.12 | s) ✔ host consent is not falsely acknowledged after signaling disconnect (0.2114ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 64.457   |
| lan_public_network.test.cjs | PASS | 0.12 | 401ms) ✔ hosted rooms appear only to the same public IPv4 or IPv6 network (0.963ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.328   |
| lan_room_directory.test.cjs | PASS | 0.12 | irectory bounds unique rooms but allows updates and expired replacement (7.5342ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.2751   |
| lan_safe_send.test.cjs | PASS | 0.14 | ) ✔ host approval checks guest readiness before occupying a room seat (0.8063ms) ℹ tests 17 ℹ suites 0 ℹ pass 17 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 87.8674   |
| lan_unavailable_join.test.cjs | PASS | 0.12 | AN server invokes unavailable join reply only on inaccessible room path (1.2073ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 67.5528   |
| magic_fireball_jump_counter.test.cjs | PASS | 0.12 | ✔ The Fireball counter uses existing JUMP, and Player Studio explains it (0.779ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.9469   |
| magic_hazard_arming_telegraph.test.cjs | PASS | 0.12 | 0.3332ms) ✔ expired traps and unrelated hazards never draw arming rings (0.1011ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.5092   |
| magic_scream_slide_counter.test.cjs | PASS | 0.12 | am slide counter is documented without a fifth action or new save field (0.8364ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 66.3158   |
| magic_wall.test.cjs | PASS | 0.13 | l expires, expires in bounded time, and kickoff reset clears wall state (0.5671ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 70.1562   |
| manager_avatar.test.cjs | PASS | 0.13 | io uses existing appearance editing without player or gameplay controls (0.3074ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.6056   |
| nutmeg_facing_counter.test.cjs | PASS | 0.11 |  counter uses existing four controls and does not modify player or saves (0.3151ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.095   |
| penalty_audio_feedback.test.cjs | PASS | 0.13 | ✔ real playable engine/UI forward resolved PK goal flag to modular audio (1.343ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 76.3331   |
| penalty_round_scorecard.test.cjs | PASS | 0.12 | y fulltime use read-only helper; final penalty winner uses engine event (0.3434ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 65.7099   |
| pitch_length_20pct.test.cjs | PASS | 0.13 | 1933ms) ✔ updated offline shell version includes the new mechanics file (0.2055ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 72.2387   |
| player_studio_color_accessibility.test.cjs | PASS | 0.12 | tudio preview updates when color fields change and edits remain unsaved (0.4184ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 68.0509   |
| project_memory_contract.test.cjs | PASS | 0.14 | y policies distinguish actual ACL isolation from cooperative discipline (1.4983ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.3433   |
| rating_tiers.test.cjs | PASS | 0.13 | uires explicitly verified canonical inputs and never generated defaults (0.3455ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 80.5833   |
| single_developer_policy.test.cjs | PASS | 0.12 | y feature claim remains an active reservation after the owner takeover (11.3235ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 73.0846   |
| studio_appearance_noop_save.test.cjs | PASS | 0.13 |  ✔ STUDIO-APPEARANCE-NOOP-01: missing player does not write or navigate (0.8439ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 69.3871   |
| studio_defence_catalogue.test.cjs | PASS | 0.12 | ✔ Studio defence catalogue remains bounded and read-only (0.6381ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 60.2728   |
| studio_dribble_equipment.test.cjs | PASS | 0.13 | ties require elite eligibility without revoking legacy equipped players (1.2947ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 74.8237   |
| studio_elite_position_ovr.test.cjs | PASS | 0.12 | Trick threshold is 91+ for Star/Superstar, unlike other elite equipment (0.7253ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.1977   |
| studio_goalkeeper_magic_preview.test.cjs | PASS | 0.11 | lkeeper Studio panel is preview-only with live icon and no save control (0.2497ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 63.2275   |
| studio_magic_keep_current.test.cjs | PASS | 0.12 | agic preserves existing four-action controller and has no tier selector (0.2903ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 70.4663   |
| studio_magic_save_state.test.cjs | PASS | 0.11 | o Magic UI mirrors disabled state to accessible button and explains why (0.2275ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 59.9879   |
| studio_shot_noop_save.test.cjs | PASS | 0.12 | ) ✔ STUDIO-SHOT-NOOP-01: legacy absent fields persist on explicit REMOVE (0.4306ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 71.106   |
| supernova_defense.test.cjs | PASS | 0.13 | ced-flash fallback respects OS motion preference unless saved explicitly (1.832ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 72.0374   |
| tactics_event_integrity.test.cjs | PASS | 0.13 | g tactical slots preserves each player Breath and emits no substitution (0.2421ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 74.3657   |
| ui_no_dev_banner_20261020.test.cjs | PASS | 0.11 | (0.1511ms) ✔ four controls and gameplay-specific screens remain present (0.1154ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 62.0512   |

Summary: {"PASS": 82, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
