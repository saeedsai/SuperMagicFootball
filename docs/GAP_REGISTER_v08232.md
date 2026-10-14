# Active gap register — v0.8.23.2 Alpha

| Priority | Issue / feature gap | Status / action |
|---|---|---|
| DONE | All-Time Legendary 12 as seventh BPW team | Implemented v0.8.23.1, remains separately selectable; 6 historical WC BPW squads unchanged |
| DONE | Original menu/halftime music with playable crossfade | Implemented v0.8.23.2, dual music sequencers overlap during fade; Node transition/cleanup test PASS |
| DONE | Procedural match crowd ambience with slider | Implemented v0.8.23.2, deterministic noise buffer, low-pass and gain, scene cleanup; Node and Chromium simulated touch PASS |
| DONE | Master mute, invalid preference and old SFX consistency | Fixed v0.8.23.2; explicit mute controls sound, saved `opt.sfx` stays in sync; Node and browser simulation PASS |
| P0 | Real iOS/Android/USB/Bluetooth gamepad input and sound | Not testable in container; physical double-tap, audio unlock, resume and output latency manual QA outstanding |
| P1 | Actual browser-origin persisted options across reload | **BLOCKED by sandbox browser navigation policy** (`ERR_BLOCKED_BY_ADMINISTRATOR` for localhost and file navigation). Injected storage simulation PASS; requires real-origin re-test |
| P1 | Firefox/Safari, page restore, headphones, and Bluetooth speaker quality | Browser compatibility/device evidence outstanding; conservative lifecycle handlers added |
| P1 | Uninterrupted monolithic browser suite | **37/37 individually PASS across six shards**; single uninterrupted run not certified |
| P1 | Goalkeeper vs transformed Super Shot balance at each difficulty | Deterministic seeded production-like metrics and human testing planned v0.8.24 |
| P1 | Historical legend/BPW cartoon likeness and animations | Present cartoons are not authenticated historical likenesses; planned v0.8.25 |
| Later | Five-level Super Defense, tiers, stadium/weather/career enhancements | Deferred until their milestones |
| Very late | Large 2026 roster updates / transfer valuations | Explicitly postponed by user |

See `AUDIO_IMPLEMENTATION_v08232.md`, `TEST_REPORT_v08232.md`, and `NEXT_MILESTONES.md`. Historical v08231 and v08221 files are retained for traceability but are superseded on current status.
