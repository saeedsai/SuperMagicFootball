# Regression and defect report — Supermagic Football v0.8.23.2 Alpha

**Release:** 14 October 2026. Tests were run against the rebuilt `play.html` and final audio code after adding the concurrent crossfade fix. `npm test` also completed after the final code update. All test harness files updated for this release are in `tests/`.

| Executed check | Result | Detail |
|---|---|---|
| Full inherited and new Node master scripts | **57/57 PASS** | 56 npm-test scripts including both audio suites, plus `master_contracts.mjs`; master run `master_full_node_s0of1_v08232_final.json` |
| Chromium browser full regression | **37/37 PASS** | Six separately completed shards: 7+6+6+6+6+6 script executions |
| New original audio reliability Node script | **PASS** | Catches muted cue, invalid settings, no autoplay, genuine dual-sequencer crossfade, scene and resource lifecycle, match crowd gain/source and shutdown |
| New audio rehydration Chromium test | **PASS** | Simulated storage injected across new pages, desktop and simulated touch; DOES NOT certify real-origin storage |
| Existing v0.8.23 audio Node and browser suites | **PASS** | Gesture gate, UI volume and mute, event cues, no error on simulated touch |
| Master release contract | **PASS** | 223 teams, 2,676 slots, six formations, four gameplay actions, source/HTML/PWA version, 383 cases cataloged |
| Rebuild portable HTML | **PASS** | `python tests/build.py`, no external audio assets |
| Actual normal-origin browser storage navigation | **BLOCKED (not PASS)** | Chrome returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` when visiting local HTTP and file URL in this sandbox |
| Physical phones, gamepads, Safari and Firefox | **NOT RUN** | No target hardware/engines available; still open |

## Closed issues and code changes

1. Audio would cut abruptly between menu and halftime. Fixed with simultaneous music sequencers, separate gain buses, a **0.85-second overlapping fade**, and release of the outgoing timer/bus after fade.
2. Ambience slider previously did not produce audio. Fixed with an original deterministic low-pass crowd texture loop during the match, adjustable ambience gain, cleanup on leaving match, mute and background suspension.
3. Explicit master unmute could be overridden by the old SOUND option. Fixed by using the master mute selector as the authoritative setting on save and keeping the legacy `sfx` option synchronized.
4. Invalid old audio settings might produce unexpected values (`"false"` previously truthy). Sanitized invalid numbers and textual booleans.
5. Suspended AudioContext and page lifecycle handling improved for touchstart/pagehide/pageshow. It is still **not certified** on physical Safari/iOS.
6. Previous static browser title/version and PWA cache key outdated. Bumped to v0.8.23.2.

## Evidence and limits

- Final machine-readable master runs: `qa_runs/master_full_node_s0of1_v08232_final.json` and `qa_runs/master_full_browser_s0of6_v08232_final.json` through `s5of6_v08232_final.json`. Per-script outputs are recorded in those JSON files.
- **383 requirements are in the acceptance catalog; they were not 383 individually executed or signed-off cases.** Node and browser totals are **script counts**, not separate assertion counts or device certifications.
- Browser coverage includes desktop and emulated mobile/touch Chromium but has not tested actual speaker output. Original source and standalone portable HTML were rebuilt before testing.
- Normal-origin localStorage remains a genuine gap: a test was attempted using an HTTP server but browser security policy blocked navigation before app startup. New successful simulated rehydration coverage must not be represented as that missing test.
- Full browser suite passes through six bounded shards, not one uninterrupted test-process run. Automatic testing does not replace real match balance, latency and hardware playtesting.

## Remaining gaps and next actions

P0: Verify mobile hardware, physical gamepads, audio device latency, iOS Web Audio unlock, real browser-origin persistence. P1: deterministic keeper/normal/super-shot balance and animations in v0.8.24, followed by legend/BPW personality and art in v0.8.25. No bulk 2026 roster modifications until the user authorizes that postponed milestone.
