# ART-C01 — Independently editable front collar and shoulder seam

**Date:** 17 Oct 2026 · **Branch:** `dev` · **Feature:** `ART-C01-EDITABLE-COLLAR` · **Owner:** `graphics-update-c01-collar-20261017-gpt6-s4`.

## Shipped graphics (bounded small batch)
- Authored `assets/characters/concept_modular_v1/source/torso_collar_front.svg`, a 112×265 transparent SVG with **18 paths** in seven individually editable groups: `neckline-shadow`, `collar-underlay`, `collar-left`, `collar-right`, `collar-center-tape`, `shoulder-seam-left`, `shoulder-seam-right`. Royal blue gradients, narrow collar detailing and shoulder seam accents use existing front hero coordinates. Art commit: [`231b7384`](https://github.com/saeedsai/SuperMagicFootball/commit/231b7384ab4b6976240b3bed19187a9decbaeee4).
- Rig `torso_collar_front_001`: pivot `[56,122]`, neckline `[56,110]`, conservative alpha estimate `[23,107,89,144]`, front paint depth 9 between far arm (8) and painted face (10). Near arm (14) and hair (20) remain in front.
- Opt-in `concept_modular_v1` runtime loads all **six** editable SVG layers; no partial front illustration if collar is missing, has invalid dimensions, or fails to load. Legacy `concept_hero` renderer is the fallback. Other six unauthored side/quarter angles still preserve original drawing.
- QA fixture embeds `CONCEPT_MODULAR_COLLAR_INLINE` for deterministic match screenshots; service worker caches one additional small source SVG and updates cache key for offline availability.
- No change to full original torso, shirt number, legs, hitboxes, ball, physics, AI, controls, player data, saves, game UI, regular renderer, or camera. This is **not** the complete independent torso. Original baked arm pixels remain; larger arm strides are intentionally still limited.

## Validation and regression gates
- Source validation `scripts/validate_concept_modular.py`: **PASS** 6 editable layers, alpha/pivots/asset groups and legacy fallback (observed in [QA #39025260961](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025260961)).
- [GitHub Pages real match PC + simulated touch #39025261009](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025261009): **PASS**, `collarLoaded:true`, six authored parts, collar SVG and compositor HTTP 200, one modular player active, zero page errors. Not a physical-phone test.
- First all-Node run: **241/242 PASS, 1 unrelated FAIL** in `tests/cpu_halftime_tactical_response.test.cjs` (`already-matched plan does not invoke applyPlan`, `true !== false`). Also prevented browser screenshot step due sequential CI; did not implicate graphics code.
- Corrective *QA ordering only* in [`concept-modular-v1-qa.yml`](../../.github/workflows/concept-modular-v1-qa.yml): dedicated graphics Node + actual desktop/touch match browser before the **unchanged full Node suite**, so graphics evidence is recorded even if an unrelated game test fails. Does not suppress failure or alter production logic.
- **Focused graphics Chromium, full 9-job regression and latest exact-source deploy:** recheck linked [Actions runs](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/concept-modular-v1-qa.yml); do not infer PASS from previous green commits.

## Outstanding acceptance
Screenshot-art compare shoulder joins against original on grass/teal/light/dark, check for visible ghosting, get human art owner approval, independently author original torso/shirt/number, mask baked arms, and finish remaining eight-direction rig. Do not count this as a fully independent torso or approved family.

## Next five small iterations
1. Inspect/adjust a single collar/shoulder seam against both arm frames on four contrasting pitches.
2. Separate the **full front jersey body/number** from the legacy underlay, with reversible painter order.
3. Occlude the original baked arm pixels without background holes or changing six-angle fallback.
4. Hand-paint one front shin and boot with stable ankle/toe pivot.
5. Pair the other leg and tune front run/stop contact, then start the first true quarter-angle part.

Source truth is the live GitHub `dev` branch and active coordination locks, not an old chat summary.
