# v0.8.24.12 — Shot release geometry and match fairness evidence

## Scope and implementation

`src/match_telemetry.js` now exposes `shotReleaseContext(event, game)` and permits an optional second `game` argument to `MatchOpportunityTracker.onEvent(event, game)`. Old one-argument calls remain valid. This diagnostic-only sidecar has **no gameplay-engine changes** and does not alter the match ball, players, goalkeeper skill, saves, stamina or inputs.

At each recorded kick, if a valid live engine is supplied, telemetry snapshots: goal distance (horizontal), nearest non-stunned outfield defender distance, number of active defenders within 230 world units, goalkeeper distance and lateral target offset, goalkeeper fatigue, ball speed, release elevation, and a diagnostic defensive-pressure bucket. Buckets: `close` (<90 world units), `medium` (90–229.99), `open` (>=230), and `no_active_defender` (if none). **These arbitrary diagnostic boundaries are not calibrated expected-goals estimates, human-gameplay probabilities or metres.** Missing/invalid context becomes `null` or `unobserved`, never an invented observation. Shot/super-shot pressure counts exclude passes.

## Added fixture and replay evidence

- `tests/v082412_release_context.mjs`: missing values, mirror directions, stunned defender exclusion, no side effects, pass/shot separation, keeper distance, speed and fatigue.
- `tests/v082412_context_replay.mjs`: **30 seeded full scripted matches**, 6 team pairings x 5 CPU levels; multiple formations, attack policies and weather. Both halves, live CPU opponents and penalty ties use the real engine and four-action input API. Repeats a seed to assert deterministic replay.
- Machine-readable output: `docs/HUMAN_CPU_CONTEXT_REPLAYS_v082412.json`.

### New scripted sample results (not human playtests)

| Measure | Recorded |
|---|---:|
| Matches completed | 30 |
| Total event-backed kick attempts | 417 |
| Ordinary plus Super Shots | 250 |
| Passes | 167 |
| Shot events with valid context | 250 |
| Home regulation goals | 11 |
| CPU regulation goals | 9 |
| Event-linked goalkeeper saves/deflections | 182 |
| Event-attributed defender interceptions | 22 |
| Close / medium / open pressure releases | 120 / 111 / 19 |

The historical 45-match dataset is retained for comparison, making **75 scripted matches across two separately executed cohorts**, not a representative sample of 75 human matches. Goal and keeper outcomes are observational. Do not adjust shot power, goalkeeper reach, difficulty curves or Star/Superstar ratings from these data alone.

## Validation and limitations

Telemetry makes it possible to stratify by distance and pressure, but it does not account for all tactical actions, shot angle, player intent, rebound chains, controller skill, keeper anticipation, opponent formations at release or physically measured input delay. New checks measure world-unit geometry rather than real-world metres. End-to-end real hardware gamepad, Safari, Android/iOS and true multi-browser origin persistence remain open.
