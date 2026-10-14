> **Historical specification.** For the current four-button mapping, Jump-then-Pass cross, automatic goalkeeper defense and removed extra action buttons see `COMPLETE_COMBINATION_REFERENCE_v08181.md`.

# v0.8.17.1 — Four-Button Combination Priority and Input Reliability

## Scope

This narrowly bounded hotfix follows the v0.8.17 control reliability baseline and incorporates the v0.8.16.2 buffered keyboard/touch input path. It fixes input-order races in the current Jump+Pass cross and Jump+Dribble bicycle combinations, with no new gameplay buttons.

## Fixed behavior

| Input state | Intended result | Conflict protection |
|---|---|---|
| Ball held, Pass then Jump | Single elevated cross | Sets `crossChordLatched`, prevents ordinary Jump and delayed Pass |
| Ball held, Jump then Pass | Same elevated cross | Ground Jump pending until tap-release and canceled when cross chord recognized |
| Ball held, Pass+Jump simultaneously | Single cross | No repeated action while chord held |
| Ball held, Jump then Dribble | Single ordinary-football bicycle shot | `bicycleChordLatched` prevents double-firing; pending Jump canceled |
| Ball held, Dribble then Jump | Same bicycle shot | No extra jump that overwrites bicycle animation |
| Ball held, quick Jump tap | Normal jump on release | Hold-to-run threshold distinguishes a tap from a sprint |
| Ball held, sustained Jump with direction | Sprint, stays grounded | No late jump after long hold |
| Pass alone | Existing tap/hold short/long pass | Buffered keyboard and touch edges retained |
| Defensive Dribble / Switch | Select another player | Prior frame-start selection protection retained |

## Compatibility and architecture

- The 4-button phone layout remains Pass / Shoot / Dribble / Jump.
- `src/input.js` uses the buffered, pointer-aware implementation from v0.8.16.2 so fast touches and overlapping fingers are preserved; the frame-start selection and manual-switch hysteresis from v0.8.17 remain.
- Legacy save imports, remappable keyboard/gamepad actions, super ability levels, goalkeeper defensive actions and AI behavior remain unchanged by this bounded patch.
- The service-worker asset list includes every current JavaScript module and gets a new versioned cache key.

## Deferred combinations

Feature #217 — Hold Dribble + Jump to lift the ball without jumping, and feature #218 — follow-up Jump + Shoot high-power non-transforming super bicycle, remain **Missing** in the tracker. They require their own hold/tap distinction and staged acceptance testing.
