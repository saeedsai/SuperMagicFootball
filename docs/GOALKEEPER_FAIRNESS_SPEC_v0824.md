# Goalkeeper fairness and recovery polish — v0.8.24 Alpha

## Resolved defect: frame-dependent automatic supernatural saves

Previously, an eligible transformed shot triggered a fresh 14% keeper Super Save lottery **every frame** it remained within goalkeeper vicinity. With multiple frames of overlap, the effective chance was not 14%, and varied with FPS. `keeperAutoSuperEligible()` now gates one consideration per incoming transformed shot, only once the goalkeeper has a ready compatible rare skill, the ball approaches the keeper, and the ball lane is no more than 80 world units beyond the goal mouth. A failed roll is final for that shot; ordinary saves remain permitted. A new shot object starts a new opportunity, and ability cooldowns remain unchanged. This is not a guarantee of a supernatural save.

Implementation: `src/engine.js` `keeperAutoSuperEligible` and the automatic goalkeeping branch in `updateBall`. Eligibility is checked **after swept normal diving**, so existing fast-ball collision safety is preserved. No new action button or player ability is introduced.

## Visual-only improvement

`src/render.js` adds a fading keeper landing contact ripple during the existing `keeperRecover` pose. The 0.34-second landing timer, normal dive cooldown, stamina expenditure and player physics are unchanged.

## Controlled deterministic balance matrix

- **3,450 fixed-lane trials**: 5 selectable AI difficulties x 2 mirrored goals x 3 goalkeeper profiles x 5 incoming shot types x 23 lateral offsets. Original ball update and dive code, keeper held at a fixed starting position; 30-Hz integration; rare Super Saves disabled by deterministic RNG and no GK Super ability. Synthetic *save counts*, not in-match save percentages or real human play.
- Ordinary speed 850, fast speed 1800, transformed straight level 1 (1850), zigzag level 3 and 5 (1900).
- Sample at Normal CPU setting for team-0 defended goal, saved out of **23**: Rookie ordinary **9**, zigzag level-five **6**; elite ordinary **19**, zigzag level-five **18**; tired elite ordinary **15**, zigzag level-five **14**. Other 147 profile/shot combinations appear in `KEEPER_FAIRNESS_MATRIX_v0824.json`.
- Fixed-keeper lane coverage is intentionally invariant to difficulty. Difficulty affects CPU movement, strategy and anticipation **before** the keeper arrives in position; this fixture does not measure that movement. At fixed lanes, a level-three zigzag occasionally saves one more lane than an ordinary shot because trajectory moves relative to the keeper (elite 20 vs ordinary 19). This is a known small-sample nonlinear effect, **not** evidence of overall higher save odds.
- Mirrored keeper directions differ by at most 2 lanes in these fixed cases. Existing strong-vs-rookie, fatigue and level-five bounds pass.
- A **2,000-frame** seeded Node-only gameplay benchmark covered ~33.3 seconds of simulated match time. Wall time is recorded per run and is not hardware FPS or mobile frame-time certification.

## Verification and still-open work

The full 58/58 Node and 38/38 offline Chromium browser scripts pass after v0.8.24 changes. Desktop and simulated touch run the same one-per-shot and keeper recovery checks; physical phones, Firefox/Safari, and USB/Bluetooth controllers are not certified. Real human shot distribution, match-wide difficulty curves, cross-browser render performance, and per-device frame-time profiling remain open. In particular, synthetic keeper lane fixtures are **not** statistically meaningful real-match save rates.
