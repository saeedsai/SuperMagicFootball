# Keeper dive silhouette polish — 3 November 2026

## Change

The existing visual-only keeper dive root pose now leans farther into the saved lane, rotating the existing torso and trailing-leg silhouette along with the glove reach. The lean follows the existing 0.60-second `diveElapsed` phase and the existing `diveDy` direction. Dive/recovery still share the same terminal transform. Player coordinates, contact depth, ball/save logic, goal geometry, timing, controls and state remain unchanged.

## Validation

- `node --test tests/keeper_dive_silhouette.test.cjs tests/penalty_keeper_visual.test.cjs tests/keeper_glove_action_art_contract.test.cjs`: focused pose and existing goalkeeper contract checks.
- `python -X utf8 scripts/build.py`: game bundle build.
- `python -X utf8 tests/keeper_dive_silhouette_browser_qa.py`: actual renderer preview of up/down dives at takeoff, early, middle, late, full reach and matched recovery; verifies visible/bounded pixels, animation frame distinction, and unchanged live keeper/ball state.
- Contact sheet: `evidence/browser/keeper_dive_silhouette.png`.

## Limits

This improves the procedural renderer fallback and not authored modular keeper art. Reduced-flash and all timing/physics behaviors are unchanged. Owner visual approval, physical-device review, and broader seeded save/fairness validation remain separate.
