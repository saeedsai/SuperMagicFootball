# G5 modular runtime integration

The opt-in `concept_modular_v1` renderer now reads the existing Studio `smf-concept-modular/1` manifest. It resolves only the current eight authored layer IDs (front/back hair, front face, two front arms, front collar/front torso, and back torso), using each entry's manifest-relative source path, source canvas and pivot. The runtime validates schema, fallback model, authored views, required layer IDs, dimensions, unique asset paths and safe local SVG paths before requesting any artwork. Unsupported or invalid manifests keep the legacy renderer active.

Production browser runtime fetches `assets/characters/concept_modular_v1/manifests/rig.json`; the service worker precaches that manifest and all eight current source SVGs for offline loads. The isolated build fixture embeds the same manifest and a path-keyed SVG payload map. The existing strict Python source validator remains unchanged and continues to check the full art/manifest contract.

If a modular SVG request fails, the renderer keeps its legacy fallback, avoids retrying every animation frame, and retries only failed layers after the browser's `online` event. It replaces the fallback only when all layers required for the selected view are ready. It does not expand beyond the current front/back authored views or change the default player presentation.

Focused checks:

- `node --test tests/concept_modular_v1.test.cjs` covers fetched manifest lookup, path validation, fallback, recovery and view behavior.
- `python -X utf8 scripts/validate_concept_modular.py` preserves the full source/manifest validator contract.
- `python -X utf8 scripts/build.py` builds the inherited offline browser test fixture with the embedded manifest and assets.

Studio save/export/reimport, general user-imported package support, frame package selection, golden-image review, broader art coverage and production approval remain open under G5 in `MASTER_BACKLOG.md`.
