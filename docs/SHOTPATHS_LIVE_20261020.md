# SH01 — Playable Books / Serpent Zigzag Flight (20 October 2026)

## Delivered source

- `src/modules/shotpaths.js` — pure deterministic mirrored, bounded, fading lateral path with analytic velocity and endpoint correction. Commit `cf61b82b29fe67bc1797eda7b1c793aeb166ac28`.
- `src/modules/engine.js` — imported `SHOTPATHS` and used the **same** zigzag displacement/velocity step for the live `updateBall` and short-horizon `predictKeeperShot`. Legacy non-deterministic zigzag forcing was replaced; all other shot behaviors, strike energy, swept collisions, catches, goal-mouth checks and four-button controls remain in place. Commit `3e25957c566aaf4a4b56964429ab59267909d188`.
- `data/mechanics/gameplay.json` — distinct authored tuning: Books amplitude **28**, frequency **10**; Serpent amplitude **45**, frequency **15** (clamped safe ranges, left/right mirrored). Commit `8fa1a7036377c0bb4c05e2e7cbed729e264d7336`.

The path is a lateral double/multi-bend wiggle with a zero-offset, zero-lateral-velocity fade by the 1.65-second transformation deadline. The gameplay goalkeeper gets the same bounded sampled flight path and still must move and make physical contact. There is no telepathic instant save. The launch, shot costs, existing ball collision and score rules were intentionally not rewritten.

## Focused acceptance

- `tests/shotpaths_live_20261020.test.cjs`: six Node subtests, checking profiles, mirroring, 30/60/120 FPS analytic path parity and fade, invalid/nonfinite input safety, deterministic no-mutation, and exact live/keeper shared helper source wiring. Commit `4ba59d7aa8e8734c19c35c683c3cdee3c96159d1`.
- `tests/shotpaths_live_browser_qa.py`: uses a built real game fixture in headless Chromium, desktop and simulated-touch. Each tests **12** cases (Books / Serpent × 2 mirror directions × 30,60,120 FPS), multiple samples, end-of-transform settling, all four controls, zero JS errors. Commit `24e947bd209fa8b9d57d2acb7a95614b4e16a3be`.
- Modular Game Dev QA passed on `24e947bd` ([#39486517913](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39486517913)); complete 4+4 Full Regression at the *final* integration SHA and hosted Pages must be checked independently before declaring production certified.
- Physical Android/iOS, network LAN parity and human goal/save-rate balance against expert goalkeeper **not** yet certified.

## Next improvements

1. Verify desktop/simulated-touch browser results, real keeper scenario, mirror fairness, and exact-SHA 4+4 census including historical suites.
2. Balance false-positive goal/save parity on seeded physically contactable scenarios; improve player-facing VFX for distinct silhouettes.
3. Implement another genuinely different Super Shot family (e.g., target-directed two-stage flight) under a new exclusive gameplay-engine claim only after this claim is released, without new control buttons.
4. Coordinate with graphics owner on per-ability art; keep shot movement and keeper forecast derived from shared helper.

This is a **live flight integration**, not completion of the full 30-feature Super Shot catalog, finished eight-view art, Super Defense, Tricks, or LAN.
