# Candidate 0.12.81.62 — normal and double-jump pose

## Scope

The existing procedural `CHARACTER_ART` renderer now gives normal and double-jump actions a bounded airborne pose: arms counterbalance, knees tuck near the apex, and the limbs extend during descent. The change is visual-only. It does not change movement, jump timing, physics, contacts, hitboxes, controls, or saves. Grounded poses and unrelated aerial actions keep their existing paths.

This release follows `.61`, whose exact-head Census `42074560236` and Modular QA `42074560131` passed, protected promotion succeeded, Pages deployment `42076154200` succeeded, and main regression `42076154150` passed.

## Local evidence

- `node --check src/modules/characterart.js` and `node --check src/modules/render.js` passed.
- Focused player-art and jump-pose checks passed **18/18**.
- `node tests/aerial_mechanics.mjs` passed.
- `npm run test:node` passed the production build, full Node suite **2,329/2,329**, and Club26/FC27 runtime/data parity executable. Built fixture: **5,240,528 JS / 5,363,824 HTML characters**; release/version contract checks are included in the suite.
- Actual production `renderer.drawPlayer()` browser QA passed **54 captures** across grounded and normal/double-jump phases, front/quarter/profile views and mirrored facings at 64px nominal character height. Captures showed no clipping or blank players, zero browser errors and no player/ball state mutation. Apex-vs-ground projections differed by 3,740–4,872 pixels; reduced-flash repeated draws differed by at most three pixels.
- Visual evidence: [jump pose review sheet](evidence/browser/player_jump_air_pose_64px_20261105_review.png), [measurements](evidence/browser/player_jump_air_pose_64px_20261105_review_metrics.json), and [acceptance details](PLAYER_JUMP_AIR_POSE_20261105.md).
- Studio asset validation was not applicable because no raster/vector asset was authored or edited; validation used the actual production renderer.

## Release gates

Candidate SHA, exact-head Full Regression Census, Modular QA, protected promotion, Pages deployment, and hosted verification are **pending**. Owner visual review and physical-device acceptance are also open. Do not treat the automated image sheet as owner approval.

## Limits

Joint-level airborne pose applies to the procedural `CHARACTER_ART` renderer. Crown Royals and concept-atlas renderers do not currently expose these joint channels. The engine has no distinct normal-jump landing phase, so no landing squash was added. New Concept Hero/Royal Concept creation remains deferred per owner direction.
