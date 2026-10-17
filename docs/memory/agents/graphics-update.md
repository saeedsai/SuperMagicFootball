# Agent memory — Graphics update

**Agent ID:** `graphics-update` · **Updated:** 2026-10-17

## Scope
Only concept-quality player artwork and visual-only animation; protect game physics, UI, rosters, saves and other agents. Read current `dev` and live claims before each batch.

## Current C01 checkpoint
The previous experimental five-layer model gained a **sixth separately editable front collar/shoulder seam** `assets/characters/concept_modular_v1/source/torso_collar_front.svg`: 18 paths in seven named groups, rig at z=9 / pivot [56,122], composited between far arm and face with old torso still beneath. New art commit `231b7384`. QA fixture and SW cache include it; missing collar returns original hero fallback. No match mechanics or data changed.

## Mission
Improve player graphics and animation without changing gameplay, rosters, or unrelated UI.

## Current checkpoint
Existing detailed checkpoint and evidence notes below are retained; consult the current graphics roadmap and active ownership claim before the next edit.

## Next smallest action
Select a single unclaimed graphics or animation improvement, verify existing references, and run its targeted and regression tests.

## Ownership and exclusions
Graphics and animation scope only; do not modify other agents' gameplay, roster, or shared UI areas.

## Evidence / caveat
[Source validator QA #39025260961](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025260961) PASS six layers; initial active Node 241/242 due to unrelated CPU halftime tactic mismatch, preventing its browser stage. [Hosted desktop/touch #39025261009](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025261009) PASS `collarLoaded`, sixth SVG HTTP 200 and live opt-in match. Graphics-specific QA step order updated so focused Node and actual browser run before full Node; new run results must be checked before calling fully green. Full regression not certified. No artist signoff.

## Next smallest task
Check and checkpoint focused art screenshot/canvas-alpha test, full suite and deployment. Release live three bounded locks after verified handover. Next separate batch: one painted front torso body panel to begin hiding baked old arms while preserving the original fallback. See [C01 report](../../concept_character_pipeline/C01_COLLAR_SEAM_BATCH_20261017.md), [handover](../../concept_character_pipeline/NEXT_CHAT_HANDOVER.md).

## Hygiene
Keep only this current checkpoint, not long logs; never modify other agents' memory.

## Cleanup
Keep only the latest graphics checkpoint, relevant test evidence, and the next action; remove stale notes in the graphics agent's next owned update.
