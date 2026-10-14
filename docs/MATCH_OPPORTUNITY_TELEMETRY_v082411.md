# v0.8.24.11 — Goalkeeper collection and event-attributed match calibration

## Confirmed bug and correction

`src/engine.js:updateBall()` examines outfield and goalkeeper collection candidates in distance order. Previously, **the first player who failed their own reach test ended the entire search**, even if another player had a larger legitimate reach. The fix skips that candidate and examines the remaining players. Earlier qualifying candidates retain priority. These assertions are reproduced by `tests/v082411_keeper_collection.mjs`.

## Additive event contract

`emit('kick', { player, super, kind, origin, targetY })`: `kind` is `pass`, `shot`, `superShot` or `clearance`. Legacy fields stay intact. No additional controls or player abilities are introduced. `src/match_telemetry.js` is a pure optional diagnostic sidecar used by tests; it does not alter match state.

`MatchOpportunityTracker` counts **attempts** rather than converting every kick into a shot or every goalkeeper event into a separate save. It records each attempt's team, kind, origin, outcome, elapsed flight and (for successful saves) catch/dive and deflection status. Passes are separately attributed as completed or intercepted. Unlinked save events are reported separately rather than fabricated as shots.

## Expanded seeded replay evidence

Run `node tests/v082411_opportunity_replay.mjs`. The harness uses the normal input API, both regulation halves, half-time progression, CPU defenders and goalkeepers, and penalty shootouts when required. It repeats a seed/policy and requires identical event results. It emits `docs/HUMAN_CPU_OPPORTUNITY_REPLAYS_v082411.json` with **45 complete matches, 9 per difficulty**.

Current sample: **526 attempts**, consisting of **324 ordinary shots, 23 Super Shots and 179 passes**. The diagnostic classified **168 keeper deflections, 90 keeper saves, 87 completed passes, 85 intercepted passes, 28 defender interceptions, 26 regulation goals and 25 teammate recoveries**. Another 17 attempts reached period end before attribution. These numbers describe scripted policies, not player shooting percentages. The sample uses repeated matchups and policies with different seeds; it is not a representative random sample of human gameplay.

For balance work, keeper catches and keeper deflections must remain separate; goals and interceptions have different denominators. A save event without an attributed shot is not automatically a unique scoring chance. Proper calibration still requires real player input distributions, shot location and quality models, pressure, and independent matchups before tuning GK reach or Super Shot powers.

## Regression and compatibility

`v082411_keeper_collection.mjs` covers failure/success of candidate reach. `v082411_opportunity_telemetry.mjs` covers synthetic event sequencing, separation of passes/shots, keeper deflections, goals, interceptions, superseded and unlinked events. `v082411_opportunity_replay.mjs` covers complete game-engine replays and determinism. The historical 15-match and earlier fixed-lane keeper reports remain historical rather than silently substituted by the new sample.
