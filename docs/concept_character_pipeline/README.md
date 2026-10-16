# Concept-quality modular player graphics — document index

**Created:** 16 October 2026. **Development branch:** dev. **Scope:** future illustrated player models, customization, animation, editor and QA. **Status:** first experimental front hair overlay in code, with opt-in rendering and pending art certification. See [IMPLEMENTATION_CHECKPOINT_20261016.md](IMPLEMENTATION_CHECKPOINT_20261016.md).

Read these documents in order:

1. [MASTER_ROADMAP.md](MASTER_ROADMAP.md) — complete staged implementation and release criteria.
2. [ASSET_RIG_AND_RENDERING_SPEC.md](ASSET_RIG_AND_RENDERING_SPEC.md) — authorable art, layered rig, eight true projections, painter order, asset packaging, runtime compatibility.
3. [CUSTOMIZATION_AND_MODEL_CATALOG.md](CUSTOMIZATION_AND_MODEL_CATALOG.md) — proposed inventory of heads, faces, noses, lips, hairstyles, hair and skin tones, beards, body sizes, tattoos, accessories and the 12-player demo.
4. [ANIMATION_SPEC.md](ANIMATION_SPEC.md) — all running, shooting, defending, special move, emotions, goalkeeper actions and eight-view transitions.
5. [TEST_AND_RELEASE_PLAN.md](TEST_AND_RELEASE_PLAN.md) — actual-game screenshots, automated QA, regression, deployment and measured acceptance.
6. [PROGRESS_TRACKER.json](PROGRESS_TRACKER.json) — future completion checkpoint and proposed target counts; only increment after verified *real* modular assets are committed.
7. [NEXT_CHAT_HANDOVER.md](NEXT_CHAT_HANDOVER.md) — detailed next-agent instructions and copyable starting prompt.

### What actually exists at the starting checkpoint
- A single concept-quality *flat* illustrated player atlas at assets/concept_hero/hero_atlas.webp (532×265); it has five drawn projections and is mirrored to eight world headings.
- src/modules/concepthero.js cuts the flat sprite into torso and two leg regions for a basic running swing. The hair, eyes, hands, shirt and expression are not independently rigged.
- The Concept Royals FC demo is a 12-slot squad currently using **the same illustrated appearance for every player**, not twelve unique painted identities; the number and blue outfit are baked into the original image.
- src/modules/render.js routes that special player through CONCEPT_HERO and everyone else through the procedural CHARACTER_ART fallback. Player Studio still exposes 17 older numeric customization families.
- The original 223 game teams, existing user saves, match physics and roster statistics remain protected.

**The approved illustrated concept image is an art direction reference, NOT a delivered set of editable, recolorable, eight-direction animated body pieces.** Future progress is defined by implemented game assets and captured actual-play screenshots, not a newly generated marketing/team picture.

This is a parallel graphics workstream that supplements (does not replace) docs/MASTER_DEVELOPMENT_PLAN.md and docs/NEXT_MILESTONES.md. Other agents may update dev concurrently. Always inspect the latest branch state before work.
