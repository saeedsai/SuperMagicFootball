# C00/C01 small checkpoint — 2026-10-16

Experimental front-only independently editable illustrated hair source: `assets/characters/concept_modular_v1/source/hair_front_front.svg`. Paired manifest, source/provenance, validator, opt-in runtime compositor and active unit/browser tests added. Only one Concept Royals forward is routed to `concept_modular_v1`, **only** with `?conceptModularPreview=1`. Default game, all original 223 teams, existing saved identity and legacy fallback remain unchanged.

The visual is deliberately a layered hair **overlay** on the original artist-painted character; it does not constitute an independently editable full head, body or production hairstyle. Front is authored in the initial frame. All seven other world headings use the old atlas as a named fallback (not falsely represented as authored). Existing leg animation remains old. There is no new WebP derivative or source-approved complete body rig.

Run `python3 scripts/validate_concept_modular.py && python3 scripts/build.py && node --test tests/*.test.cjs && python3 tests/concept_modular_browser_qa.py`. Browser QA enters a real match on desktop and simulated touch, asserts new front pixels differ and the back fallback is unchanged, and captures actual game screenshots to `docs/qa_runs_concept_modular/` (GitHub Actions screenshot artifact). CI and owner visual review must be checked before claiming PASS or marking verified.

Next bounded task: check exact-commit screenshots for fit/halos on grass, teal, white and dark; adjust the front source, then author matching isolated hair-back/head part. Do not expand gameplay or player databases.
