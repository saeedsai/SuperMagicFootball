# Full regression — node, shard 2/4
Commit: local

These are **script executions**, not certification of every historical QA catalog case.

| Script | Status | Seconds | Evidence tail |
|---|---|---:|---|
| aerial_mechanics.mjs | PASS | 0.18 | v0.8.1 AERIAL TEST PASS: hyperdash duration/cooldown/fatigue, timed heading, ordinary GK dives, save direction, old rare abilities   |
| career.mjs | PASS | 0.18 | Career tests: PASS • 83 teams • 12/team • 2026 caricatures • training • transfer • three cup rounds • 14 league rounds • new season   |
| club_roster_batch_ledger.mjs | FAIL | 0.37 | ION',   actual: '6b8aeca4e0f7c7ecff0a8d42116d0f7487bc994a',   expected: '9ac1e7e5065df50ceaf8a9c8d1d7b55ac43685e4',   operator: 'strictEqual',   diff: 'simple' }  Node.js v24.19.0  |
| current_fc27_club_contract.mjs | PASS | 0.32 |   |
| fitness_substitutions.mjs | PASS | 0.24 | v0.7.1 FITNESS & SUBSTITUTIONS PASS — distinct action costs, permanent three-sub limit, no re-entry, fatigue ledger, halftime recovery, CPU swap, career fitness   |
| input_buffer.mjs | PASS | 0.13 | INPUT BUFFER PASS: keyboard/touch quick taps, simultaneous buttons, held keys, multi-pointer, joystick handoff, blur cleanup   |
| penalty_controls.mjs | PASS | 0.17 | v0.8.8 PENALTY & BINDING PASS — movement, dribble, keeper dive, shooting origin, safe profiles, real polling   |
| secondary_controls.mjs | PASS | 0.17 | v0.8.12 SECONDARY CONTROLS PASS: old saves, P2 keyboard/gamepad isolation, double-jump defense, keeper dive   |
| tactics_identity.mjs | PASS | 0.20 | v0.7.0 TACTICS & IDENTITY PASS — all 216 team identities, roles, substitution, settings, invalid input safeguards   |
| v08191_input_queue.mjs | PASS | 0.17 | v0.8.19.1 INPUT QUEUE PASS — 3 keyboard / 4 touch cycles, hold duration, sprint disambiguation, reset and remapping   |
| v08194_keeper_balance.mjs | PASS | 0.15 | R-LANE COVERAGE (not real match save %) {"weakCoverage":0.3442622950819672,"strongCoverage":0.7704918032786885,"slowCoverage":0.639344262295082,"fastCoverage":0.5081967213114754}   |
| v0819_goalkeeper.mjs | PASS | 0.15 | v0.8.19 GOALKEEPERS: catches/throws/punts/pressure/blocked lanes/auto saves both teams: PASS   |
| v08205_manchester_liverpool_verified.mjs | PASS | 0.16 | PASS current FC27 source and positional club contract: Manchester City, Liverpool   |
| v08206_roster_inventory.mjs | PASS | 0.17 | icial club registration list.","Repeated identities across national teams must be canonicalized before player-tier population limits can be enforced."],"unverifiedClubRole":2531}   |
| v08221_aerial_super_rework.mjs | PASS | 0.20 | v0.8.22.1: six input variants, both directions, two taps, single-tap timeout, double jump, non-specialists, unified special shot physics/graphics, cancellation, no repeated shots   |
| v0823_audio.mjs | PASS | 0.11 | PASS v0.8.23 audio: gesture gate, event mapping, mute, volumes, cues, scenes, standalone and controls   |
| v082411_opportunity_replay.mjs | PASS | 24.67 | :6,"savesByCPU":28,"kicksByHumanTeam":43,"possessionShareHuman":0.15,"endedInTiebreak":5,"attempts":124,"shots":71,"passes":53,"keeperSavesLinked":50,"defenderInterceptions":10}}   |
| v08241_moving_keeper.mjs | PASS | 0.24 | PASS v0.8.24.3 moving-keeper forecast and 30/60/120Hz bounded integration: 96 fixtures   |
| v08245_release_alignment.mjs | PASS | 0.16 | PASS release/browser alignment 0.12.19.0 84 checks   |
| v08249_zero_human_control.mjs | PASS | 0.18 | PASS v0.8.24.9 player-control ownership 0/1/2 humans and autonomous AI-vs-AI home player   |
| ability_shot_ball_shapes.test.cjs | PASS | 0.25 | ity (0.514ms) ✔ player ability summary ignores inherited catalogue keys (0.4853ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 148.082   |
| arena_overhaul_visual_contract.test.cjs | PASS | 0.26 | ay Now and Quick Match are unique, with home focus on the primary card (0.4021ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 158.9635   |
| authored_directional_coverage.test.cjs | PASS | 0.20 |  ✔ cross-realm catalogs are counted consistently without mutating them (0.3551ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 125.9051   |
| brighton_player_metadata_20261016.test.cjs | PASS | 0.28 | ✔ Brighton 2026/27 metadata, parity, age, shirts and immutable audit (62.7659ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 202.1407   |
| career_history_robust.test.cjs | PASS | 0.24 | form summary and latest results agree on what counts as a usable score (1.5071ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 149.6197   |
| career_save_slots.test.cjs | PASS | 0.23 | .9513ms) ✔ Career slot controls, legacy mirror and backup wiring exist (0.5153ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 129.4413   |
| career_slots_fixture_contract.test.cjs | PASS | 0.22 | 601ms) ✔ Career initialization handles browsers that deny localStorage (1.7477ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 126.5202   |
| concept_hero_ci_install.test.cjs | PASS | 0.24 | RT-CI-001 Concept Hero uses Playwright-managed Chromium, not snapcraft (1.2531ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 134.3267   |
| concept_hero_transparency.test.cjs | PASS | 0.25 | cleaning uses precise interleg seed points and preserves the white kit (2.8344ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 142.4199   |
| cpu_halftime_tactical_response.test.cjs | PASS | 0.23 |  the method is integrated exactly at real first-half transition only (0.3487ms) ℹ tests 10 ℹ suites 0 ℹ pass 10 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 139.3427   |
| crown_royals_kwame.test.cjs | PASS | 0.19 | urce atlas (2.6355ms) ✔ Kwame renderer preview uses his own identifier (0.8057ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 103.7912   |
| crown_royals_svg_asset_contract.test.cjs | PASS | 0.20 | wn Royals kwame quarter atlas has transparent, bounded authored frames (0.4029ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 109.0306   |
| cup_slot_duplicate.test.cjs | PASS | 0.27 | COPY only with spare slot and UI dispatch duplicates without overwrite (24.263ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 185.8526   |
| custom_club_edit_routes.test.cjs | PASS | 0.24 | dispatch guards custom ID and preserves builder route on Back and save (0.3987ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 136.1498   |
| directional_animation.test.cjs | PASS | 0.27 | ealms (0.3227ms) ✔ spoofed catalog tags fail closed without throwing (0.1714ms) ℹ tests 23 ℹ suites 0 ℹ pass 23 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 170.2514   |
| dribble_trick_audio.test.cjs | PASS | 0.21 | its success/failure and human/AI flags to the existing UI audio bridge (1.6227ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 117.7213   |
| feature_claim_protocol.test.cjs | PASS | 0.57 | clusive feature locks reject stale SHA, takeover, and invalid handover (379.058ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 493.446   |
| gk_seeded_match_trials.test.cjs | PASS | 23.87 | te matches report CPU keeper movement and outcomes by difficulty (23641.4405ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 23758.3309   |
| halftime_match_lifecycle.test.cjs | PASS | 0.18 | 23ms) ✔ halftime restores Breath independently of fatigue and cooldowns (0.7972ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.8449   |
| jumping_fatigue_real.test.cjs | PASS | 0.18 | costs 1.99x (1.2054ms) ✔ modifier cap for non-jump actions stays at 1.5 (0.2331ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.7323   |
| keeper_clearance_safety.test.cjs | PASS | 0.18 |  1 (0.1694ms) ✔ keeper clearance still permits a safe receiver, team 1 (0.1034ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 102.7361   |
| keeper_glove_action_art_contract.test.cjs | PASS | 0.25 | player-facing candidate rotates package, About notes, README and cache (5.8928ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 156.8651   |
| keeper_roll_distribution.test.cjs | PASS | 0.24 | echanism preserves original pass/shoot and four-button command routing (0.3719ms) ℹ tests 9 ℹ suites 0 ℹ pass 9 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 147.8118   |
| lan-diagonal.test.cjs | PASS | 0.19 | ✔ LAN diagonal movement is normalized without changing cardinal input (4.6556ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.12   |
| lan-ice-gathering.test.cjs | PASS | 0.16 | 18.0461ms) ✔ ICE gathering rejects closed connection and invalid timeout (0.8458ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.776   |
| lan-protocol-channel.test.cjs | PASS | 0.16 | 13 send failure retains guest sequence; close/dispose removes listeners (0.5051ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.9983   |
| lan-wire.test.cjs | PASS | 0.19 | LAN wire enforces UTF-8 byte cap and avoids mutation of caller controls (0.611ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 113.5636   |
| lan_auto_signal_reconnect.test.cjs | PASS | 0.22 | 2ms) ✔ valid explicit secure internet P2P broker remains configurable (0.1342ms) ℹ tests 17 ℹ suites 0 ℹ pass 17 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 135.439   |
| lan_guest_release.test.cjs | PASS | 0.17 | ching from guest to host releases previous guest seat and pending joins (0.2444ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.7396   |
| lan_host_cancel.test.cjs | PASS | 0.16 | ecision (7.2198ms) ✔ cancel refuses to interfere with an in-flight send (1.0576ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 92.8178   |
| lan_host_lobby.test.cjs | PASS | 0.19 | ✔ LAN host rejects invalid approval, expired requests and closed lobby (0.9822ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 117.2403   |
| lan_host_room_identity.test.cjs | PASS | 0.15 | ✔ host exposes room identity only while hosting (3.9208ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 81.9817   |
| lan_live_match.test.cjs | PASS | 0.18 | 0.2714ms) ✔ LAN-081 invalid host clock cannot flood paused heartbeat (0.2061ms) ℹ tests 35 ℹ suites 0 ℹ pass 35 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 116.1733   |
| lan_peer_connection.test.cjs | PASS | 0.40 | nd recovery update ready state without changing peer connectionState (0.5606ms) ℹ tests 46 ℹ suites 0 ℹ pass 46 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 326.8669   |
| lan_relay_backup.test.cjs | PASS | 0.27 | ✔ P2P-RELAY-10 rejects incompatible SDP on both approved relay roles (1.4828ms) ℹ tests 12 ℹ suites 0 ℹ pass 12 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 187.7064   |
| lan_room_protocol.test.cjs | PASS | 0.15 | s) ✔ caller fields cannot override explicit packet type room or version (0.2097ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 81.2368   |
| lan_signal_backoff.test.cjs | PASS | 0.18 | ect backoff (1.1894ms) ✔ stable P2P connection resets reconnect backoff (0.4362ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 99.7991   |
| lineup_role_fit.test.cjs | PASS | 0.18 | ccessible, refreshes with formation and lineup, and does not auto-save (0.7778ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.4632   |
| magic_fireball_slide_counter.test.cjs | PASS | 0.27 | l slide counter is documented without a fifth action or new save field (2.7576ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 134.3069   |
| magic_hazard_team_capacity.test.cjs | PASS | 0.20 | ensive SHOOT slide clears only enemy traps even when both teams overlap (0.6646ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 115.986   |
| magic_shoulder_ride.test.cjs | PASS | 0.25 | st on a defender counter and exposes the move through Studio/rendering (1.0462ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 148.6763   |
| magictricks_rules.test.cjs | PASS | 0.17 | nd equipped Magic Trick keep four-button controls and save compatibility (3.255ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 94.2271   |
| match_highlights.test.cjs | PASS | 0.16 | only helper is rendered in Pause, Half Time and standard Full Time only (0.5929ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.6676   |
| p2p_auto_discovery.test.cjs | PASS | 0.23 | tic room discovery requires host approval before common match handoff (28.0378ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 139.1636   |
| penalty_keeper_control.test.cjs | PASS | 0.19 |  ✔ keeper movement is bounded against invalid/out-of-range input values (0.194ms) ℹ tests 8 ℹ suites 0 ℹ pass 8 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 111.9615   |
| penalty_shootout_lifecycle.test.cjs | PASS | 0.14 | ixth pair must continue to seventh pair, then end without phantom kicks (0.1934ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 79.6766   |
| player_art_all_roster.test.cjs | PASS | 1.69 | s render across five view projections with their persisted presets (1531.4079ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 1612.9868   |
| player_studio_dribble_guide.test.cjs | PASS | 0.16 |  a Dribble Style refreshes icon and guide but never saves automatically (0.2606ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.4733   |
| psg_fc27_official_20261016.test.cjs | PASS | 0.22 |  one-player transfer and field-level metadata ledger remain consistent (9.2372ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 148.8398   |
| release_gate_contract.test.cjs | PASS | 0.16 | has no stale workflow lock, while promotion requires exact-head green QA (0.3716ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.883   |
| spain_goalkeeper_metadata_20261016.test.cjs | PASS | 0.17 | s two goalkeepers and all 32 national teams retain 12 unique identities (0.7343ms) ℹ tests 2 ℹ suites 0 ℹ pass 2 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 91.0188   |
| studio_appearance_reset.test.cjs | PASS | 0.16 | n (0.6095ms) ✔ reset button and disabled state are wired to Studio only (0.2273ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 93.4375   |
| studio_defence_noop_save.test.cjs | PASS | 0.18 | IO-DEFENCE-NOOP-01: real ability change persists, invalid tier rejects (1.7333ms) ℹ tests 5 ℹ suites 0 ℹ pass 5 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 104.9692   |
| studio_dribble_noop_save.test.cjs | PASS | 0.19 | ) ✔ invalid style is rejected before any no-op shortcut or persistence (0.7844ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 104.4516   |
| studio_gallery_frame_steps.test.cjs | PASS | 0.18 |  ✔ frame controls are accessible, delegated and limited to Player Studio (0.5449ms) ℹ tests 3 ℹ suites 0 ℹ pass 3 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 101.16   |
| studio_jumping_preview.test.cjs | PASS | 0.22 |  both offline shell and generated QA fixture include the shared module (0.7548ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 125.7031   |
| studio_magic_live_save_state.test.cjs | PASS | 0.17 | c Trick live status is accessible, refreshed on selection and read-only (0.3455ms) ℹ tests 4 ℹ suites 0 ℹ pass 4 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 95.2013   |
| studio_magic_unlock_missing_rating.test.cjs | PASS | 0.21 | STUDIO-TRICK-PROGRESS-02 distinguishes missing legacy rating from zero (2.0441ms) ℹ tests 1 ℹ suites 0 ℹ pass 1 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 126.9974   |
| studio_shot_save_state.test.cjs | PASS | 0.18 |  ✔ Super Shot save feedback is accessible and updates for shot and tier (1.4175ms) ℹ tests 6 ℹ suites 0 ℹ pass 6 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 96.1461   |
| tackle_animation.test.cjs | PASS | 0.19 | ction poses freeze locomotion gait while regular running stays animated (0.2384ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 97.7281   |
| touch_dribble_pulse.test.cjs | PASS | 0.18 | elling second DRIBBLE touch discards deferred edge without phantom tap (0.8231ms) ℹ tests 7 ℹ suites 0 ℹ pass 7 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 103.1772   |
| versioning_policy_contract.test.cjs | PASS | 4.00 | 5 release notes describe duplicate pending host approval protection (1.1869ms) ℹ tests 16 ℹ suites 0 ℹ pass 16 ℹ fail 0 ℹ cancelled 0 ℹ skipped 0 ℹ todo 0 ℹ duration_ms 3914.3053   |

Summary: {"PASS": 81, "FAIL": 1, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0}
