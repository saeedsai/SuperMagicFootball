# AI opponent difficulty — engineering specification v0.6.1

**Status: implemented as a first behavioral pass, requires play balancing.**

## Levels

| Difficulty | Relative CPU speed | Response delay | Shot spread (max offset) | Passing preference | Press radius | Tackle probability per defensive decision |
|---|---:|---:|---:|---:|---:|---:|
| Rookie | 0.69 | 0.78s | 170 | 0.08 | 260 | 0.23 |
| Easy | 0.78 | 0.53s | 115 | 0.18 | 365 | 0.39 |
| Normal | 0.86 | 0.32s | 65 | 0.30 | 470 | 0.54 |
| Hard | 0.95 | 0.18s | 33 | 0.42 | 590 | 0.74 |
| Expert | 1.02 | 0.09s | 12 | 0.55 | 730 | 0.91 |

Shot spread is the symmetric input aim offset in game-world units before normalization; this is not the final location of ball contact at goal. CPU player base speed still depends on its actual player speed class and team strategy. These values are *initial balance parameters*, not empirical win-rate targets.

## Architecture and acceptance

- `src/ai.js`: exports the five explicit presets and `aiTuning` which safely clamps invalid values.
- `src/engine.js`: the opponent CPU uses the selected profile. When two humans play, teammate assistants use Normal to avoid handicapping either player. Single-player teammates also use Normal.
- Direction/target intent is held over a reaction interval, so changing difficulty affects situational awareness, not merely player speed.
- CPU attacking uses a per-level pass/shoot/super-shot decision, pressure context and target prediction.
- CPU goalkeepers anticipate direction, including in penalty play.
- `src/main.js`: difficulty is set in Settings, Quick Match setup or in the paused in-match panel. Immediate in-match changes are saved.
- `tests/ai_difficulty.mjs`: independently checks all five levels, nonzero Rookie behavior, speed/awareness/accuracy/keeper progression and finite simulation.
- `tests/ai_browser_qa.py`: desktop and simulated-phone setup, match, pause and change/resume interactions.

## Known limits

1. CPU decision rules are heuristic, not goal-directed planning or learned agents.
2. Enemy team tactical styles remain basic; player-specific personality, stamina and morale are still future work.
3. Shooting/tackle balance and goalkeeper save percentage require real match telemetry and human playtests.
4. Real gamepad/phone and disk-persistence tests are not possible in this QA environment. The browser tests use an in-memory storage stand-in.
5. Bot difficulty currently affects the **opposing** computer team in single-player; local 2P assigns neutral Normal logic to AI assistants for both sides.
