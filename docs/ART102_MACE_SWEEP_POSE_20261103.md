# ART-102 Mace Sweep timed character cue — 3 November 2026

## Acceptance for this increment

- Give the existing Mace Sweep defense a recognizable character-held prop and visible wind-up-to-follow-through change.
- Drive the pose from the existing `.24 s` pending defense action and show it in all eight renderer headings.
- Keep mechanics, hit window, target selection, hitbox, physics, and accessibility/counter timing unchanged.
- Keep the existing renderer fallback and make no production-art or visual-approval claim.

## Implementation and validation

`src/modules/render.js` converts the existing Mace Sweep pending timer into a bounded `[0, 1]` art phase. `src/modules/characterart.js` uses the phase to move the near arm, rotate a gold-trimmed mace at the hand, and preserve the existing character painter for the other parts. The cue reads only the pending move state; it does not write to player/game state or collision geometry. Other Super Defense moves keep their current art.

Validation run on 3 November:

- `node --test tests/art102_mace_sweep_visual.test.cjs tests/mace_sweep_telegraph.test.cjs` — **5/5 passed**.
- `python -X utf8 scripts/build.py` — passed.
- `python -X utf8 tests/browser_runner_compat.py tests/art102_mace_sweep_visual_browser_qa.py` — passed. This renders 40 actual-renderer samples (eight headings × five timer phases), checks five distinct phase images per heading and at least five distinct headings per phase, and records no page errors.
- Gallery: `evidence/browser/art102_mace_sweep_gallery.png`. It was visually inspected at the generated 1520×1640 contact-sheet size; mace and arm progression are visible across front, oblique, profile, and rear projections.

## Status and limits

This is a procedural fallback improvement and one isolated ART-102 increment. It is not authored SuperMagicAssetStudio animation, full action coverage, full-speed transition/video review, physical-device acceptance, or owner-approved final art. ART-102 remains **PARTIAL**. The existing `docs/GRAPHICS_AGENT_WORKFLOW.md` and `docs/concept_character_pipeline/ANIMATION_SPEC.md` gates still apply.
