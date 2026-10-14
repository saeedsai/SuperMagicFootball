# Supermagic Football — v0.8.24.11 Alpha final QA and development report

**Baseline:** v0.8.24.10 Alpha complete source ZIP. **Date:** 14 October 2026.

## Automated tests — actual execution

| Test area | Completed | Result and evidence |
|---|---:|---|
| Node gameplay and regression (`npm test`) | **71 / 71 scripts** | PASS. Actual terminal output captured during release; includes three new v0.8.24.11 tests. |
| Node master content/release contract | **1 / 1 script** | PASS. Source and PWA release consistency, roster/gameplay invariants, QA catalog count. |
| Chromium full browser regression | **40 / 40 scripts** | PASS. Sequential completed run with **0 failures / 0 timeouts / 0 unexecuted**; `docs/qa_runs/master_full_browser_s0of1_v082411_full.json`. |
| Expanded complete-engine controller-vs-CPU replay | **45 / 45 matches** | PASS. Nine per difficulty; deterministic repeat check passes; every match finishes including necessary penalty shootouts. |
| Keeper collection | **4 targeted scenarios** | PASS. Vertical and horizontal reach, absence of eligible keeper, normal closer-outfielder priority. |
| Event attribution | **Synthetic shot/pass/goal/deflection/interception cases** | PASS. `tests/v082411_opportunity_telemetry.mjs`. |
| QA requirement catalog | **444 requirements** | Documented acceptance cases, **not 444 individually executed certifications**. |

## Confirmed defect corrected

Previously, a player unable to collect a ball based on height or distance stopped the search for *all* subsequent players; thus an eligible goalkeeper could be prevented from collecting. Now the loop skips only the ineligible player. No radius, rare save odds, collision damage, Super Shot strength or four-button combinations were retuned. The added `kick` event metadata is backwards compatible.

## Current match telemetry

**45 seeded scripted matches** (9 per difficulty, three team and tactic combinations with three seeded variants each) recorded **526 event-backed attempts:** 324 ordinary shots, 23 Super Shots and 179 passes. Among these, the telemetry classified 26 regulation goals, 90 caught/dive goalkeeper saves, 168 keeper deflections, 28 defender interceptions, 87 passes completed, 85 passes intercepted, 25 teammate recoveries and 17 period-end outcomes. Each attempt has only one primary outcome; rebound-follow-up chains require future enrichment.

| Difficulty | Matches | Controller regulation goals | CPU regulation goals | Shot attempts | Pass attempts | Linked keeper save/deflect events |
|---|---:|---:|---:|---:|---:|---:|
| Rookie | 9 | 10 | 0 | 74 | 20 | 53 |
| Easy | 9 | 5 | 0 | 85 | 33 | 64 |
| Normal | 9 | 0 | 0 | 57 | 31 | 49 |
| Hard | 9 | 2 | 3 | 60 | 42 | 42 |
| Expert | 9 | 0 | 6 | 71 | 53 | 50 |

The data shows a difficulty gradient for this **specific scripted controller policy**, not human difficulty fairness. Policy and fixture repetitions, goal position, defensive pressure, rebound recovery, shot quality and physical controller behavior must be expanded before judging goalkeeper strength. There is no evidence-based reason in this release to alter global save probability or attack power.

## Compatibility and preserved functionality

The existing five-category menu, Pass/Shoot/Dribble/Jump actions, six formations, six World Cup BPW squads, seventh All-Time Legendary 12, save formats, active career/competition routes, audio, Super Shot/Header/Bicycle combinations and late penalty tiebreak fairness are covered by the inherited suites. Historical versioned calibration reports are preserved separately.

## Open issues / hardware limitations

- Physical Android and iOS touch input, gamepad hardware, low-end FPS and audio latency are **not verified**.
- Safari/Firefox and audio settings persisted under real ordinary browser origins remain unverified.
- Scripted controller policy and 45-game sample do not support statistical claims about human win rates or competitive balance.
- Richer defensive-pressure metrics and keeper rebound-to-goal chains are planned.
- BPW historical personality is the next major visual milestone; Super Defense/Tricks and routine roster corrections remain deferred.

## Cleanup and packaging

The current package keeps all executable tests, required code, documented user requirements, historical specifications and the deferred ability backlog. Historical changelogs are organized in `docs/history/changelogs/`; old per-run QA output and temporary screenshots/cache are removed. Source SHA-256 manifest and playable HTML/ZIP equality checks accompany the release.
