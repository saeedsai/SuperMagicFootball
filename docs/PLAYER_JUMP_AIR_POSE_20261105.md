# Normal and double-jump pose acceptance

## Acceptance criteria (written before implementation)

1. Animate only the visual pose of existing outfield players in normal `jump` and `doubleJump`; do not change action timing, jump physics, input, contact, hitboxes, or saves.
2. Blend run-driven arm and leg swing fully out while airborne. Use current `z`, `vz`, and `jumpCount` to produce a bounded, continuous takeoff/rise, apex-tuck, and descent/extension pose.
3. Show a readable knee tuck with arms counterbalancing the legs at a 64px character height. Keep grounded players' current pose unchanged. Do not alter headers, bicycles, goalkeeper dives, shot-launch poses, or other special aerial actions.
4. Mirror the limb pose consistently in front, quarter-front, and profile projections and their opposite facings.
5. Reduced-flash mode must produce the same stable pose at an identical physics sample; no flashing or added oscillation.
6. Actual `renderer.drawPlayer()` browser captures must cover normal and double jump across takeoff, rise, apex, descent, grounded control, and opposing facing. Every captured input player's x/y/z/vz/action/jumpCount and the ball state must remain unchanged by rendering; no blank/clipped characters or page errors.
7. Run focused pose/render tests and the existing aerial mechanics regression. Report that a post-contact normal-jump landing squash remains out of scope: the engine resets z/vz/jumpCount without a normal-jump landing phase.

## Implementation and validation record

Implemented a visual-only `jumpAirPose()` in `src/modules/characterart.js`. Its weight fades the run swing down, draws a bounded knee tuck near apex, opens/lifts the arms for counterbalance, and extends/lower limbs for descent. `src/modules/render.js` applies the pose only to non-keeper players with `jumpCount > 0`, positive z, and `jump`, `doubleJump`, or the engine's airborne `idle` state; renderer root run bob is faded with the same pose weight. No engine/action/physics files were changed. Other aerial actions remain on their existing paths.

Validation performed:

- `node --check src/modules/render.js` and `node --check src/modules/characterart.js` passed.
- `node --test tests/player_jump_air_pose.test.cjs tests/player_art_rework.test.cjs tests/shot_impact_recovery_legs.test.cjs tests/characterart_run_foot_articulation.test.cjs` passed 18/18.
- `node tests/aerial_mechanics.mjs` passed (`v0.8.1 AERIAL TEST PASS`).
- `python -X utf8 scripts/build.py` completed and built the modular runtime fixture (5,240,067 JS chars; 5,363,363 HTML chars).
- `python tests/player_jump_air_pose_browser_qa.py` passed against the actual production `renderer.drawPlayer()` path with `preview:false`. The 576×1800 QA sheet covers grounded plus normal/double takeoff, rise, apex, and descent in front, quarter, and profile views at 64px nominal character height, with each facing direction. All 54 captures report unchanged player and ball state, corrected character height 64–65px, no blank/clipped samples, and zero browser page errors. Across the 12 apex-vs-ground projections, 3,740–4,872 pixels differ; reduced-flash repeated draws differ by 0–3 pixels (18 checks).
- I visually inspected the generated sheet. The pose reads as a restrained airborne tuck/counterbalance at match scale; this is a renderer pose increment, not new frame-by-frame raster animation, and visual approval remains for the owner.

Evidence: `docs/evidence/browser/player_jump_air_pose_64px_20261105_review.png` and machine-readable measurements at `docs/evidence/browser/player_jump_air_pose_64px_20261105_review_metrics.json`. Studio asset validation was not applicable: this change authors no new or edited raster/vector asset; it changes procedural renderer pose code and was checked through the production browser renderer path instead.

Limitations: this adds procedural limb articulation to the `CHARACTER_ART` path. Players rendered by the separate Crown Royals or concept atlas renderers keep their own existing art/action paths; those renderers do not yet expose joint-level airborne pose channels. There is also no distinct normal-jump landing action/phase after contact in the current engine, so a landing squash/recovery cannot be keyed without changing engine action semantics (out of scope). This does not assert review approval, integrated release acceptance, mobile/device acceptance, or overall game readiness.
