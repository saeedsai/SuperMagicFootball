# Active gap register — v0.8.24.10 Alpha

| Priority | Issue | Status / next action |
|---|---|---|
| **Fixed** | Penalty keeper tracked the final shot target continuously after launch, producing nearly unscorable shootouts | Commit keeper lane at kick; penalty fairness regression added |
| **Fixed** | Sudden death awarded a win after an unmatched extra kick | Require equal numbers of attempts before determining sudden-death winner; preserve mathematically clinched early wins in first five |
| **Improved** | Full regulation single-player-vs-CPU game coverage missing | 15 seeded controller replay matches across five levels, with real controls and penalty resolution; data in `HUMAN_CPU_REGULATION_REPLAYS_v082410.json` |
| **High** | Representative real-person difficulty and keeper/shot balance not established | Increase independent seeds and real-controller playtesting; confidence intervals and opportunity-level classification |
| **High** | Shot vs pass, defender interception vs goalkeeper save, rebound recovery and possession chains not fully measured | Build explicit event-based opportunity telemetry |
| **High** | Physical Android/iOS/gamepad compatibility | Requires devices; Chromium emulation is insufficient |
| **Medium** | Safari/Firefox, real-origin persistence and Bluetooth audio | Requires targeted cross-browser tests |
| **Medium** | Low-end frame pacing/performance | Requires actual-device profiling |
| **Planned** | Seven BPW teams historical cartoon personality and animation | v0.8.25 |
| **Deferred** | Super Defense and Tricks | Preserve user backlog, four buttons, high fatigue and fair counterplay |
| **Postponed** | Worldwide roster corrections | Not to be resumed without milestone/approval |

No changes to ordinary or Super Shot ball speed or goalkeeper catch/save reach were made on the limited scripted-match evidence.
