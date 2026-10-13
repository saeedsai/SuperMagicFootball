# Fitness, fatigue and substitution specification — v0.7.1

## Model

All ratings and costs are gameplay design parameters, not physiological or medical facts. Player stat `stamina` (1–100) determines capacity. Runtime `fatigue` is 0 (fresh) to 1 (exhausted), stored in `GameEngine.fatigueLedger[side][playerId]` for **all twelve players**, including the bench.

Per second fatigue step (clamped to [0,1]):

`cost = (.0011 + .010 * intensity) * (120 - stamina) / 65`, minus recovery `.00165` when near idle and `.00018` otherwise. Intensity: sprint 1.0; running .45; CPU pressing .69; idle 0. Extra action costs (multiplied by `(120 - stamina)/65`): jump .008, pass .004, ordinary shot .012, tackle .019, slide tackle .029, super shot .045. Halftime deducts .13 fatigue; bench fatigue is remembered. Existing `endurance` slows player speed as fatigue rises.

The shoot, pass, strength and keeper effects use preexisting independent numeric attributes with additional fatigue adjustments in v0.7.1. The game has **five CPU difficulty levels** unaffected by the stamina update.

## Substitutions

3 maximum per team (arcade rule), only when the match is paused or halftime, no return of a substituted-off player. Tactical repositioning of the same six on-field players is free. A player with `injuryWeeks > 0` cannot be *brought on* from bench in this release. A queued CPU replacement at halftime selects the highest-net-benefit rested field player; no coach AI while the match is running. There is no official substitution window limit or stoppage replay.

## Career integration

After a played career fixture `recordMatchFitness(career,game.getFitnessReport(0))` updates individual condition with fatigue/seconds of match. Unused bench players recover +2 condition. Low-condition/high-fatigue participants can receive 1–2 match-weeks of injury (deterministic seed per player/season/week). Existing career weekly condition modifier still applies after result registration. No real-world medical inference.

## Acceptance evidence

`tests/fitness_substitutions.mjs` (action costs, stamina and speed, 3-sub cap, no reentry, halftime, CPU, career), `tests/fitness_browser_qa.py` (desktop and mobile simulated screens), and entire earlier suites. Offline bundle compiled by `tests/build.py`. See `TEST_REPORT_v071.md`.
