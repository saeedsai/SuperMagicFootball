# ART-102 Spin Bumper anticipation, impact, and recovery poses — 3–4 November 2026

## Acceptance for this increment

- Give the existing Spin Bumper defense a distinct, readable anticipation pose.
- Drive the pose from Spin Bumper's existing `.42 s` pending tell across all eight renderer headings.
- Show a short defender impact and recovery reaction across all eight headings, using the existing `.28 s` post-resolution visual timer.
- Keep activation, counters, hit timing, collision geometry, physics and gameplay state unchanged.
- Keep the existing character painter as fallback; do not claim final art approval.

## Implementation and validation

`src/modules/render.js` maps `spinBumperPending.remaining` into a normalized art phase. `src/modules/characterart.js` spreads both arms from a low brace to a wide, raised guard as the tell progresses. This is a separate pose from the one-handed Mace Sweep wind-up and only uses the active pending move record.

The follow-up adds a timer-driven hit/recovery beat after the pending action resolves: the defender's near arm sweeps outward, the far arm stays guarded, and a small torso lean eases back to neutral. The renderer keys only on the defender's `spinBumperImpactFx` timer after the pending record clears. This is necessary because the engine can reset the action to `idle` before it resolves the expired pending action. The phase is presentation-only and does not affect collision, hit timing, stun, stamina, cooldown, or player coordinates.

Validation run on 3 November:

- `node --test tests/art102_spin_bumper_pose.test.cjs tests/supernova_defense.test.cjs` — **6/6 passed**.
- `python -X utf8 scripts/build.py` — passed.
- `python -X utf8 tests/browser_runner_compat.py tests/art102_spin_bumper_pose_browser_qa.py` — passed. Actual renderer gallery: 40 samples (eight headings × five phases), five distinct phases per heading, at least five distinct projected headings per phase, no page errors.
- Gallery: `evidence/browser/art102_spin_bumper_gallery.png`. Visually inspected; the arm spread progresses clearly in front, quarter, profile, and rear projections.
- `node --check src/modules/render.js; node --check src/modules/characterart.js` — passed for the impact/recovery follow-up.
- `node --test tests/art102_spin_bumper_pose.test.cjs` — **3/3 passed** for the anticipation, recovery-phase mapping, and reduced-flash telegraph contracts.
- `python -X utf8 tests/browser_runner_compat.py tests/art102_spin_bumper_impact_browser_qa.py` — passed with the defender already in `idle`, matching the actual post-resolution engine order. The production-renderer gallery contains 40 samples (eight headings × five impact/recovery phases); every heading has five distinct rendered phases, every phase distinguishes all eight headings, player/gameplay state is unchanged, and there are no browser errors.
- Gallery: [Spin Bumper impact and recovery](evidence/browser/art102_spin_bumper_impact_gallery.png). Inspected at contact-sheet scale; this remains procedural fallback animation.

## Status and limits

This remains procedural fallback art. Studio-authored body animation, live-size motion/video review, device acceptance, and owner art approval remain open. ART-102 stays **PARTIAL** under the requirements in `docs/GRAPHICS_AGENT_WORKFLOW.md` and `docs/concept_character_pipeline/ANIMATION_SPEC.md`.
