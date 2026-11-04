# ART-102 Spin Bumper timed defense pose — 3 November 2026

## Acceptance for this increment

- Give the existing Spin Bumper defense a distinct, readable anticipation pose.
- Drive the pose from Spin Bumper's existing `.42 s` pending tell across all eight renderer headings.
- Keep activation, counters, hit timing, collision geometry, physics and gameplay state unchanged.
- Keep the existing character painter as fallback; do not claim final art approval.

## Implementation and validation

`src/modules/render.js` maps `spinBumperPending.remaining` into a normalized art phase. `src/modules/characterart.js` spreads both arms from a low brace to a wide, raised guard as the tell progresses. This is a separate pose from the one-handed Mace Sweep wind-up and only uses the active pending move record.

Validation run on 3 November:

- `node --test tests/art102_spin_bumper_pose.test.cjs tests/supernova_defense.test.cjs` — **6/6 passed**.
- `python -X utf8 scripts/build.py` — passed.
- `python -X utf8 tests/browser_runner_compat.py tests/art102_spin_bumper_pose_browser_qa.py` — passed. Actual renderer gallery: 40 samples (eight headings × five phases), five distinct phases per heading, at least five distinct projected headings per phase, no page errors.
- Gallery: `evidence/browser/art102_spin_bumper_gallery.png`. Visually inspected; the arm spread progresses clearly in front, quarter, profile, and rear projections.

## Status and limits

This remains procedural fallback art. Studio-authored body animation, transitions through the resolved effect and recovery, live-size motion/video review, device acceptance, and owner art approval remain open. ART-102 stays **PARTIAL** under the requirements in `docs/GRAPHICS_AGENT_WORKFLOW.md` and `docs/concept_character_pipeline/ANIMATION_SPEC.md`.
