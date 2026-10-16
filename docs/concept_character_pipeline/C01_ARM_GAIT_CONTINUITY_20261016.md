# C01 — Reciprocal arm gait continuity checkpoint

**2026-10-16 · Feature ART-C01-ARM-GAIT-CONTINUITY · owner graphics-c01-arm-gait-20261016-gpt6-chat3**

## Purpose and implementation
The experimental opt-in Concept Royals player already has two independently painted front arms. Both used an abrupt `abs(run)>0.07` rotation cutoff, producing a small animation pop when walking settles into idle or starts again. This batch changes **only** the front-arm visual interpolation in `src/modules/conceptmodular.js`: the first 0.18 of the finite clamped run phase is weighted by a smoothstep `t*t*(3-2*t)`; the arms still rotate symmetrically at +/−0.035 radians per phase. At `|run|>=0.18`, previous art angles are exactly retained. Existing source SVGs, hero body, face, hair, physics, hitboxes, gameplay, roster, saves, buttons and ordinary renderer are unchanged.

A new executing Node test instantiates the actual browser-art compositor with image mocks, captures Canvas rotation calls at idle and ±phases, checks the former cutoff for continuity, reciprocal shoulders, unchanged full strides, non-authored side fallback and unaffected back view. Existing graphics browser QA continues to compare actual game screenshots on desktop/touch and pixel-identical side fallback.

## Acceptance and evidence
- **Art/source/Node QA:** PASS [#38961042607](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961042607) — XML/source contract, all five editable SVGs, 228/228 Node, actual game desktop and simulated touch including unchanged side fallback, no page errors.
- **Hosted Pages:** PASS [#38961042443](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961042443) on [exact source check commit `2be32a64`](https://github.com/saeedsai/SuperMagicFootball/commit/2be32a646124930a75a5941c0a4487273bb6a9a1); desktop and simulated touch match, all five SVG assets + module HTTP 200, and `armIdleBlend: true` confirms Pages actually serves the newly eased renderer.
- **Full sharded regression:** [#38961042564](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961042564) pending at this checkpoint. Prior [#38960642802](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38960642802) encountered unrelated `pass_reception_audio_browser_qa.py` browser failure (`Game players unavailable`); failed-shard rerun was requested but superseded by newer pushes. No unrelated gameplay/audio files were modified.
- Source/manifest and art alpha unchanged. No new asset URL, service-worker cache entry, or test fixture embedding is necessary.
- [Latest specialist handover](NEXT_CHAT_HANDOVER.md), [tracker](PROGRESS_TRACKER.json) and [existing seam/torso follow-up issue #10](https://github.com/saeedsai/SuperMagicFootball/issues/10).

## Known limitations
One opt-in Concept Royals player only; original flattened body still has baked static arms and kit number; six world headings have no authored layered body; smooth arm interpolation does not solve collar overlap, dynamic expressions or keeper moves. No artist signoff or physical-device verification.

## Next five graphics-only iterations
1. Audit and correct one front shoulder/collar seam on grass/teal/light/dark at idle and both run extremes.
2. Author first independently editable painted front torso and collar, preserving old underlay fallback.
3. Mask exposed baked legacy arm pixels without introducing canvas transparency holes.
4. Isolate one planted front shin/boot with stable ankle and toe pivots.
5. Author opposite leg and synchronize arm/leg silhouettes before attempting quarter-view rig.

Never delete historical source/test snapshots without provenance and reference checks.
