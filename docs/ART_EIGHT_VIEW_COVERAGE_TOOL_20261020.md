# ART-8VIEW-SOURCE-COVERAGE — deterministic authoring audit (20 October 2026)

**Scope:** independent read-only authoring tool under the `integration-tooling` reservation; no gameplay, render, menu, roster, save, build, CI workflow or service worker changes.

## Usage

```bash
python3 scripts/report_authored_views.py > /tmp/smf-authored-views.json
python3 -m unittest discover -s tests -p test_report_authored_views.py -v
# Only for a *future* eight-view release gate, expected to fail today:
python3 scripts/report_authored_views.py --require-eight
```

The audit parses `assets/characters/concept_modular_v1/manifests/rig.json` and the SVGs referenced by its authored layer entries. It rejects duplicate layer IDs, missing/corrupt SVGs, unsafe paths outside the character asset folder, incorrectly declared authored views, and mirrored layers passed off as independently authored. Normal mode (exit 0) reports honest per-view coverage; strict `--require-eight` mode returns exit 3 until all eight views have at least one registered authored SVG. Invalid assets/manifests return exit 2. Do not put strict mode into the active CI gate while the concept rig is intentionally incomplete.

**Current canonical manifest (verified at preflight SHA `ada592804fe78d3c77b206dd8ec06d732fe37e0b`):** eight declared view IDs; two `authoredViews` (`front`, `back`); eight registered front/back source layers; the other six views still use the existing `concept_hero` fallback. Any additional source-only art not registered in `rig.json` is intentionally **not** counted as playable authored coverage. `ownerArtApproval` remains `pending`.

This is a **source-inventory and integrity aid**, not a claim of completed full-body parts, all poses, deployed renderer integration, owner art approval or physical-device performance. Re-run against the latest branch before relying on the inventory.

## Validation and handover

Local isolated fixture tests: **7/7 PASS** (partial 2/8, synthetic 8/8, missing SVG, traversal, incorrect declaration, mirroring, strict return code); `python3 -m py_compile` PASS. Fixtures were executed before publication; exact integrated-SHA CI must be checked separately. The existing game state, four controls, data and About SHA behavior remain unchanged.

Next art batch: the graphics renderer owner should author and register **one** genuine side/quarter component at a time under its own exclusive lock, verify no-mirror, fallbacks, animation and collision parity with Node and actual desktop/simulated-touch browser tests. The tooling owner may improve this validator independently; do not count side images created by mirroring existing art.
