# QA-MANIFEST-FILENAME-INTEGRITY — checkpoint (2026-10-16)

Exclusive owner: `qa-manifest-extensions-dev6-20261016-gpt6`, lock `qa-framework`. Starting dev SHA `03c3ff1f30e601922828966f86b7e5276d97e2bb`.

## Requirement fixed
The independent cross-shard census auditor previously accepted complete internally consistent PASS manifests containing arbitrary script names, even names that the actual full regression runner cannot discover. This created a potential false-green offline audit of fabricated test inventories.

`tests/audit_regression_shards.py` now rejects paths, traversal, and scripts that are not in the runner's discoverable root-level Node (`*.mjs` or `*.test.cjs`) or Python browser (`*browser_qa*.py` plus the runner's documented legacy extra suites) filename categories. Existing round-robin, return code, duration, output-tail, exact-commit and shard-completeness checks remain unchanged.

New independent `tests/test_audit_regression_shards.py` contracts cover relative/path-separator traversal, invalid Node extensions, and unrelated Python scripts. `tests/audit_regression_shards.test.cjs` now asserts 21 offline Python auditor contracts, so normal Node CI executes them. No game, build, match/saves, UI, roster, graphics, CI workflow, or release assets changed.

## Verification and caveats
- [Modular Game Dev QA #38961347691](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961347691) **SUCCESS** on complete three-file source `f305a4385e1174b0a8a66e4c3408482d996e97bb`: **228/228 active Node cases PASS**; includes 21/21 auditor Python tests through Node bridge.
- Intermediate [#38961320507](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961320507) **FAILED** only because the bridge still expected the old 18-test count. Corrected at `f305a438`.
- Another agent's Manchester United roster edits temporarily broke a later run [#38961350055](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38961350055) with `club26_5 source vs runtime`; do not attribute that separate roster mismatch to the auditor. Subsequent integrated active QA passed; check latest before claiming full head certification.
- **Full 4+4 census on exact feature code** not verified as green at this checkpoint; workflow dispatches were queued/cancelled amid concurrent changes. Previous full census runs cannot substitute for the exact commit.
- About's dev SHA lookup remains unchanged. Its source contract test is part of active Node suite; every new dev SHA is visible as development revision when About opens, distinct from the deployed game bundle.
- Latest available hosted desktop and simulated-touch smoke of the public site is historical, not specific physical-device certification. https://saeedsai.github.io/SuperMagicFootball/.

## Files, cleanup, next actions
Changes: `tests/audit_regression_shards.py`, `tests/test_audit_regression_shards.py`, `tests/audit_regression_shards.test.cjs`; this report, project milestone checkpoint and own agent memory. No historical QA reports, assets or old tests were deleted without verified safe-reference proof.

Next five bounded iterations: (1) certify full eight-shard current-source census and hosted PC/touch after concurrent agent releases; (2) fix any residual multi-agent roster source/runtime integration issues under roster owner; (3) human-controlled keeper in penalties and expanded seeded keeper/first-touch balance under gameplay owner; (4) art-owner directional keeper glove/ball distribution and reception animation; (5) career tactics/scouting usability, physical Android/iOS and PWA/offline smoke under the respective owners. Multiplayer and broader historical arcade parity remain deferred.
