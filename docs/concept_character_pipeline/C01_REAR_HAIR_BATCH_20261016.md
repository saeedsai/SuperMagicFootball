# C01 rear-hair artwork iteration — 16 October 2026

**Scope:** second genuinely editable painted hair component on the **back** view of the existing approved concept atlas. Opt-in Concept Royals forward only. No game data, mechanics, roster, store keys, controls or user-facing setup changed.

## Changed code/artwork

- `assets/characters/concept_modular_v1/source/hair_back_back.svg` — 115×265 transparent hand-authored shaded crown, nape and strand SVG groups; stable pivot (57,60), color material gradients and no opaque background.
- `assets/characters/concept_modular_v1/manifests/rig.json` — front/back isolated hair references and alpha bounds. These count as two *experimental overlay views*, not two production-complete characters.
- `src/modules/conceptmodular.js` — both assets preloaded once, loaded dimensions checked, original CONCEPT_HERO underlying player retained and controlled fallback for six unfinished headings/load errors. Small run-phase hair pivot for front/back, visual-only.
- `scripts/build.py`, `sw.js` — test-only inline second SVG and versioned offline source asset. No unrelated game files changed.
- `scripts/validate_concept_modular.py`, `tests/concept_modular_v1.test.cjs`, `tests/concept_modular_browser_qa.py`, `tests/concept_modular_live_qa.py` — schema/alpha bounds, original model isolation, browser front/back comparisons, exact original side fallback, run-phase, simulated touch + desktop, four-background screenshot output and real-host HTTP 200 checks.

## Test commands and CI gates

```sh
python3 scripts/validate_concept_modular.py
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/*.test.cjs
python3 tests/concept_modular_browser_qa.py
python3 tests/concept_hero_browser_qa.py
python3 tests/concept_hero_animation_qa.py
python3 tests/concept_modular_live_qa.py
```

GitHub workflows: [dedicated modular art](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/concept-modular-v1-qa.yml), [real hosted modular preview](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/concept-modular-live-smoke.yml), [full regression](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml).

## Pending/known risks

Until exact-commit CI returns, pass/fail of new art is **not** certified. The source is an overlay and may need aesthetic fit/halo changes after screenshot review. Six angles still use the original; arms/face/body are not an independently editable rig; gait sway is deliberately subtle and cannot substitute for body animation; no per-character unique numbers or goalkeeper clothing; owner artwork approval outstanding. No unrelated files are deleted as other agents may own them.

## Next five bounded iterations

1. Review exact-commit rear/front game screenshots over grass, teal, light and dark; tune nape/hairline edges only if necessary.
2. Extract a first independently editable front painted head/face part with matching ear and neck registration; no change to original face until validated.
3. Extract one near/far arm pair for front view, then implement a modest real painted hand stride.
4. Extract torso and separately editable leg/boot parts; verify planted feet and anchored idle/run loop in one view.
5. Start first true front-right quarter illustrated head/hair and check mirrored crest and number fallback; progress toward eight independently drawn views.
