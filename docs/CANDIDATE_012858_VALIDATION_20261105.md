# Candidate 0.12.81.58 validation

**Status: promoted to `main` and deployed to Pages for SHA `c2b251da4b5c9a6914ed3078d9b0650679c0a8c9`; dev Census `42056799184`, Modular QA `42056799178`, protected promotion, Pages deployment `42058475921`, and main hosted smoke passed. Main Census `42058476236` passed.** The existing Classic football now gets fine broken-thread highlights along its six curved panel seams. They are intended to read at featured/menu scale and stay restrained at match scale. The other four ball cosmetics, Classic artwork and all simulation behavior are retained.

## Acceptance criteria

- Preserve every ball model, base motif, rotation, drawn radius, collision radius, movement, and match state.
- Keep the seam accents clipped to the spherical artwork; keep the older-Canvas fallback functional.
- Inspect the actual renderer at a larger featured scale and at 17-unit match scale.
- Exercise rolling projection for five models × three roll angles × four travel directions with no page/runtime/network errors.
- Preserve reduced-flash and offline behavior.

## Validation

- `npm run test:node` passed the final release-version build (**5,225,763 JS / 5,349,059 HTML characters**), Node **2,310/2,310**, and Club26/FC27 runtime/data parity.
- `python3 -X utf8 scripts/validate_data.py` passed: **223 teams**, **2,676 players**, all seven roster shards, and 84 avatar presets with no errors.
- `node --test tests/game_ball_surface_render.test.cjs`: **12/12 passed**, including six-panel thread-dash coverage, exact sphere radius/rotation, existing skin coverage, renderer-only state isolation, and old-Canvas fallback.
- `node --test tests/versioning_policy_contract.test.cjs`: **16/16 passed**; `git diff --check` passed.
- `python -X utf8 tests/game_ball_cosmetic_quality_browser_qa.py`: **60/60** production-renderer samples passed across five ball models, three rotations, and four headings at 17-unit match radius. All four movement headings render distinctly; maximum painted radius **18.18**; ball/options state unchanged; page, console, request and HTTP errors: **0**. The gallery also renders all five models at 54-unit menu scale. Its capture was copied as new versioned evidence; existing files were not overwritten.
- Menu-scale visual evidence: [Classic and four themed ball skins at featured/menu scale and match scale](evidence/browser/ball_classic_thread_detail_012858.png).

## Remaining acceptance

- Rebuild and run full Node/data, release/version and roster-parity contracts after metadata is synchronized.
- Candidate .57 main Census `42052299984` passed; its protected promotion and hosted gates are complete.
- Candidate .58 exact-head dev Census `42056799184`, Modular QA `42056799178`, protected promotion, Pages deployment `42058475921`, main hosted smoke, and main Census `42058476236` all passed.
- Owner visual/gameplay and physical-device acceptance remain separate; automated render samples do not establish approval.
