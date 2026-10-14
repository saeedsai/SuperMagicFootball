# Active gap register — v0.8.24.11 Alpha

| Priority | Issue | Status / next action |
|---|---|---|
| **Fixed** | Nearest player with inadequate aerial/collection reach prematurely prevented a different eligible player (often the keeper) collecting ball | Examine other candidates; new deterministic regression tests |
| **Improved** | Kick-event counts conflated passes with shots, and raw save events did not represent unique attempts | Add typed kick metadata and optional event-attributed diagnostics; audit unlinked events |
| **Improved** | 15 scripted replay matches were too sparse to describe shot outcomes | 45 seeded completed matches across all five difficulties; 526 event-backed attempts |
| **High** | Human-versus-CPU win-rate and keeper/shot balance not statistically established | Real user input and more representative matchups, trajectories and policies; no unjustified keeper nerf |
| **High** | Defensive pressure, shot value, possession chains, out-of-play and rebounds need richer event semantics | Further telemetry for shot pressure/rebound ownership and field position; avoid conflating save events with attempts |
| **High** | Physical Android, iOS and real gamepad input | Hardware test campaign required |
| **Medium** | Safari/Firefox audio and real-origin settings persistence | Dedicated cross-browser origin tests |
| **Medium** | Low-end mobile frame pacing | Profile on actual constrained device |
| **Planned** | BPW legendary cartoon personality/animation individuality | v0.8.25 |
| **Deferred** | High-fatigue Star/Superstar Super Defense and rare Tricks | Preserve eligibility, cooldowns, four-button interface and fairness backlog |
| **Postponed** | Routine 2026 roster corrections | Do not resume without explicit milestone |

Historical keeper/synthetic reports remain evidence but are not proof of real human play balance.
