# Supermagic Football — v0.6.2 test report

**Date:** 2026-10-13. **Base:** v0.6.1 Alpha. **Outcome:** PASS for documented automated checks, with limitations below.

## Tests executed

| Verification | Result | Coverage |
|---|---|---|
| `node tests/player_stats.mjs` | PASS | 216 teams × 12 players = **2,592** slots with 12 bounded, finite numerical ratings and optional typed move metadata |
| Fatigue state/speed | PASS | Human movement/sprinting, CPU drain, passive recovery, fatigue slowdown |
| Kickoff and halftime stamina | PASS | Fatigue preserved through kickoff, limited recovery at halftime |
| Tackle strength/aggression/defence | PASS | Distinct knockdown contest outputs |
| Shooting/accuracy/goalkeeping | PASS | Shot velocity differences, aim error and GK reach attributes |
| Passing & GK reach | PASS | Separate pass precision, tested numeric goalkeeper vertical/horizontal reach |
| Career stat growth | PASS | Career training raises relevant new role-specific attribute (not only old power/shoot) |
| `node tests/simulation.mjs` | PASS | Classic shot data, match physics, goal detection, penalties |
| `node tests/career.mjs` | PASS | League fixtures, contracts, transfers, training and season reset |
| `node tests/continental.mjs` | PASS | 151 participating club slots across six confederations and completion |
| `node tests/ai_difficulty.mjs` | PASS | All five CPU difficulty levels, selection and AI difference |
| `python tests/stats_browser_qa.py` | PASS desktop and simulated mobile | Squad stats, GK details, in-match stamina bar, pause/resume, zero JavaScript page exceptions |
| Existing Chromium QA (`npm run qa`) | PASS desktop and simulated mobile | Club competition UI, recruiting/contracts, team category filters/export-import UI, AI difficulty |
| Standalone `tests/build.py`, `node --check` | PASS | All JavaScript modules packaged into offline HTML, no syntax failures |

## Findings and deferred test gates

- The new stat model is **an original design based on existing legacy attributes**, not a claim of historic or officially verified real-player scouting data.
- Advanced special abilities for defenders/GKs are **not activated as distinct mechanics** in this release. Super-shot projectiles from previous versions still function.
- Heading currently modifies airborne-shot effectiveness; **physical header collisions/receiving logic** are not complete. Crossing currently uses wide-field context, not a dedicated manual command.
- The automated tackle/shot unit tests verify calculations and numerical differences, not match-balance realism. No multi-hour human-experience tuning or original Famicom frame capture in this milestone.
- Browser tests use headless Chromium with mobile viewport/touch simulation, not actual Android/iOS hardware. Prior QA tests use an in-memory localStorage substitute, not persisted disk storage across real process restarts. Physical controllers, Firefox, Safari and online remain unverified.

## Next gate

v0.7.0: all flags/crests and shared team management before and during matches. v0.7.1: fatigue/fitness integrated with substitutions and career health.
