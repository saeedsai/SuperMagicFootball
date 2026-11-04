# Super Shot fairness matrix — 3 November 2026

## Purpose

Check the existing 32-shot catalog for mirrored directional behavior, frame-rate-sensitive goal adjudication, and basic goalkeeper interaction. This is a deterministic engine regression matrix, not a human balance study.

## Scenarios and results

`tests/super_shot_fairness_matrix.test.cjs` runs the real bundled `GameEngine` with clear weather, fixed launch speed, default catalog shot profiles, and no field-player interference. Team 0/1 shots are mirrored across the pitch. Each case runs at 30, 60, and 120 updates per second.

- **576 lane trials:** 32 shots × two attack directions × three aim offsets (`-100`, center, `+100`) × three rates. All 192 center-lane shots scored. Near-post outcomes are compared for rate and mirrored-side consistency; a special shot may legitimately turn an aimed near-post shot wide.
- **384 post/bar miss trials:** 32 shots × two directions × upper/lower lanes 210 units from center × three rates. All remain outside the scoring mouth.
- **192 keeper trials:** 32 shots × two directions × three rates against a centered default keeper. All 192 made a keeper contact/save; no goal was scored.

The three focused regression groups pass **3/3**. They assert every case above and fail if a given shot's result changes between attack directions or 30/60/120 Hz. `node --check tests/super_shot_fairness_matrix.test.cjs` passes. No gameplay/path tuning was justified by this matrix, so no physics or player-stat values changed.

## Limits

This uses a fixed start point, default shot speed/impact configuration, static target lanes, no active field defenders, and one default-strength centered keeper. It does not estimate win rates, compare all shot levels or launch positions, test online/network behavior, or replace human balance playtests and owner/device visual review. The near-post lane is allowed to miss because the catalog deliberately contains curved, oscillating, dodging, and ricocheting behavior; the regression checks only mirrored and frame-rate consistency there.
