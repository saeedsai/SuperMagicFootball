# Keeper roll-release animation — 3 November 2026

## Change

The goalkeeper's low roll pass now begins with a neutral release pose and eases the wrist through follow-through using the same **0.42-second** duration as the existing roll action. Standard throw and punt durations remain attached to their existing action timers. The ball still leaves through the same physics call, target, speed, loft and timing; only the visual pose changes.

## Validation

- Focused keeper animation/distribution Node tests: **11/11 passed**.
- Build passed.
- Desktop Chromium gallery passed for both home and away keeper directions. It rendered **5** distinct nonblank player-pixel phases in one direction and **4** in the other, preserved roster/team/score identity and ball-release behavior, kept all four actions present, and reported no page errors.
- The gallery waits for navigation `commit`, then explicitly waits for the game API before rendering and measuring pixels.

## Limits

Simulated touch, physical-device and owner visual approval remain separate.
