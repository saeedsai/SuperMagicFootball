# Seeded goalkeeper calibration — focused real-engine browser matrix

**Date:** 16 October 2026. **Purpose:** bounded P0 keeper activity/fairness gap from `docs/NEXT_MILESTONES.md`. This is a new replay test harness, not a balance parameter adjustment.

## Fixture protocol

The Playwright script `tests/keeper_shot_calibration_browser_qa.py` starts the **actual modular `SupermagicFootball.game`** from the generated QA HTML, invokes `g.freeBall(...)` and `g.updateBall(dt)`, and reads `keeperDiveAttempt`, `keeperContact`, `save` and `goal` events from the real engine. The fixture holds other players away from the lane, disables AI movement, fixes clear/grass conditions, and creates the same team on both sides for mirrored GK ability.

Matrix per browser context: 3 frame rates (30/60/120Hz) × 2 keeper sides × 2 shot classes (ordinary and straight Super) × 3 lanes (center, offset 85, corner 132) × 2 fatigue levels (0 and 0.75) × 2 independently reseeded repeats = **144 controlled shots**; desktop plus simulated touch doubles the full execution to **288**. The replay asserts shot-level seed reproducibility, no save/contact invented outside the physical depth window, correct keeper team and at most one counted save per released shot. Each matching mirrored case is checked for unintended direction bias.

**Constraints:** These are representative fixed-position shot mechanics checks, not a sample of organically chosen in-match human/CPU attacks. They should not be presented as real gameplay save rates; nonlinear Super Shot families, keeper movement, pressure, player collisions and contextual tactics require separate cohorts. In particular, no goal or save is credited for animation-only dive intent.

## Execution

```sh
python3 scripts/build.py
python3 tests/keeper_shot_calibration_browser_qa.py
```

The complete `Full Regression Census` workflow discovers the new browser test and is triggered by changes to it. Refer to its exact git SHA and actual CI result before labelling the iteration certified. The tester prints summary counts per desktop/touch, plus PASS/FAIL acceptance, in GitHub Actions logs.

## Next five iterations

1. Interpret seeded keeper results and make at most one bounded, evidence-backed physical movement improvement with both-direction goal/corner fairness.
2. Finish eight-direction glove grip and keeper distribution visuals.
3. Improve first-touch and passing follow-through.
4. Add source-aware agent edit provenance and graphics preset reviews.
5. Enhance career/tactics substitution feedback without save migrations.

No roster, physical art asset, controls, goal geometry, ability rarity, save format or player ratings are modified by this test-only iteration.
