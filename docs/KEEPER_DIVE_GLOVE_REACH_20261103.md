# Keeper dive glove reach — 3 November 2026

## Change

The existing dive root lean and recovery were phase-based, but both keeper arms held almost the same reach from takeoff to full extension. The goalkeeper's elbow and glove now ease outward along the existing 0.60-second `diveElapsed` timer. The catch and save paths still use the existing action and glove gates; Super Defence retains its full reach. This changes only character-art coordinates and does not change dive timing, ball contact, reach/collision, keeper state or gameplay.

## Validation

- Fixture build: `python scripts/build.py` passed.
- Focused pose regressions: **4/4** across `keeper_arm_reach_pose.test.cjs` and `keeper_dive_silhouette.test.cjs`. Coverage checks eased/clamped timer phases, both dive/catch actions, stable Super Defence reach, recovery/idle gates, and unchanged dive duration/direction/endpoints.
- Actual game-renderer Chromium gallery passed on desktop (**1040×390**) and simulated touch (**844×390**). Each profile rendered both save lanes at takeoff, early, middle, late, full reach and recovery: **12 samples per profile**, five distinct dive frames per lane, no clipping, no page errors, and unchanged keeper/ball state.
- Screenshots: [desktop](KEEPER_DIVE_GLOVE_REACH_DESKTOP_20261103.png) · [simulated touch](KEEPER_DIVE_GLOVE_REACH_TOUCH_20261103.png).

## Limits

These are local browser renders and simulated touch, not physical-device or owner visual approval. The character remains on the procedural five-projection fallback; authored eight-view goalkeeper animation and human motion acceptance remain open.
