# JSON-backed passing and keeper recovery — v0.8.25.34
Date: 2026-10-16

## Goal
Make two widely requested game-mechanism groups independently editable by agents without changing historical gameplay at the shipped defaults. Continuation baseline: GitHub `dev` commit `800b91715bf6baec024e7793807fcead2f6a0d49`. Keep the world +20% length, club/player databases, graphics/hero preview, controls, careers and save schema unchanged.

## Authoritative files
- `data/mechanics/gameplay.json`: editable **physicsTuning** groups and values.
- `src/modules/physicsbalance.js`: pure calculations + strict finite bounded validation.
- `src/modules/engine.js`: production consumer, initialized with validated JSON.
- `scripts/validate_data.py`: prevents unsafe values during CI/source validation.
- `scripts/build.py`, `sw.js`: registered source for QA and GitHub Pages caching.
- `tests/physics_tuning_v082534.test.cjs`, `tests/physics_tuning_browser_qa.py`: parity/editability and actual game action checks.

## Adjustable parameters and allowed bounds
| JSON path | Default | Inclusive safety range | Meaning |
|---|---:|---:|---|
| `passSpeed.base` | 445 | 300–650 | Base pass launch speed |
| `passSpeed.qualityMultiplier` | 2.6 | 0–5 | Velocity added for each pass quality point |
| `passSpeed.max` | 1250 | 700–1600 | Maximum launched pass speed before game-speed scalar |
| `keeperDiveRecovery.baseSeconds` | 2.05 | 1–3.5 | Baseline dive cooldown |
| `keeperDiveRecovery.referenceSkill` | 55 | 40–70 | Rating reference point |
| `keeperDiveRecovery.skillCoefficient` | 0.003 | 0–0.02 | GK Skill adjustment |
| `keeperDiveRecovery.divingCoefficient` | 0.004 | 0–0.02 | GK Diving adjustment |
| `keeperDiveRecovery.fatigueCoefficient` | 0.62 | 0–1.5 | Fatigue-based recovery penalty |
| `keeperDiveRecovery.minSeconds` | 1.45 | 0.8–2 | Minimum recovery |
| `keeperDiveRecovery.maxSeconds` | 2.85 | 2–4 | Maximum recovery |

The validator enforces `minSeconds <= baseSeconds <= maxSeconds` and that pass maximum does not fall below base. Inputs must be finite JSON numbers, not strings or booleans.

## Exact baseline formulas
Pass launch speed: `min(max, (base + passQuality * qualityMultiplier) * longScale)`.
Keeper recovery: `clamp(baseSeconds + (referenceSkill - gkSkill) * skillCoefficient + (referenceSkill - gkDiving) * divingCoefficient + fatigue * fatigueCoefficient, minSeconds, maxSeconds)`.
At defaults these equal the prior hard-coded expressions on all sampled qualities, long-pass scales, GK ratings and fatigue states.

## Regression and acceptance
1. `python3 scripts/validate_data.py` and `python3 scripts/build.py`: valid JSON and correct modular bundle order.
2. `node --test tests/*.test.cjs`: includes six active mechanics contracts, exact default-equivalence test matrices, deliberate coefficient changes and invalid-input rejection.
3. `python3 tests/physics_tuning_browser_qa.py`: on desktop and simulated touch, actually invokes a short pass and GK dive through `GameEngine`, comparing original and tuned config without touching saved data.
4. Full historical **Node + Chromium regression census** and GitHub modular QA on the *new exact commit*. See GitHub Actions, not historical test totals.
5. A successful Pages deploy confirms publishing; live direct play smoke is a separate gate.

## Known gaps
This release does **not** claim all physics is JSON-driven; ball drag, tackles, shooting spread and keeper reach remain partly hard-coded. It does not introduce new gameplay buttons, formations, player ratings or roster changes. Physical Android/iOS/PWA and exhaustive save/restart certification remain in the explicitly deferred far-future backlog.
