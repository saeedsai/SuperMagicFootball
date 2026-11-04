# Shot-impact get-up leg brace — 3 November 2026

## Change

The existing shot get-up animation already used its 0.24-second recovery timer to unroll the torso and brace with both arms, but its legs remained in the idle stance. The renderer now bends the near knee and draws that boot inward beneath the hips at the middle of the push-up; the far leg remains extended as support. The bend eases to zero at both ends of the existing timer. This is a Canvas-only pose; it does not change player position, timing, collision, gameplay state, saves or input.

## Validation

- Fixture build: `python scripts/build.py` passed.
- Focused shot-impact and recovery tests: **7/7** (`shot_impact_recovery_legs`, `shot_impact_recovery_pose`, `shot_impact_gameplay`). The new tests cover idle/down/recovery isolation, bounded deterministic endpoints, peak brace, near-leg bias and unchanged locomotion gait.
- Actual game-renderer Chromium gallery: `python tests/shot_impact_reaction_browser_qa.py` passed with **9/9 distinct pose hashes**, no page errors and unchanged player/ball simulation state. It includes launch ascent/apex, down pose, get-up start/push/stand, two confusion phases, and reduced-flash.
- The capture is [here](SHOT_IMPACT_RECOVERY_LEGS_20261103.png). It is an automated local render, not owner visual approval or device acceptance.

## Limits

The game still uses the existing procedural five-projection fallback. Full authored eight-view action art, human motion/balance review, physical-device review and owner art approval remain open.
