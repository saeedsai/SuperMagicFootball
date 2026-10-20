# SH01 build/Offline compatibility — 20 October 2026

## CI blocker fixed
The first full SH01 Chromium regression on live commit `24e947bd209fa8b9d57d2acb7a95614b4e16a3be` reported `ReferenceError: SHOTPATHS is not defined` from the **generated standalone test fixture** `tests/.generated/game.js`, even though `src/modules/engine.js` imported the valid new module for the real website. The test-only build pipeline keeps an explicit module assembly order and had not registered `shotpaths`.

- `scripts/build.py` adds `'shotpaths'` strictly after `'physicsbalance'` and before `'engine'`, commit `4b005307e08230c34890452f2837064fd3795a40`. Its existing source-import stripping now embeds the exported `SHOTPATHS` declaration once before engine.
- `sw.js` precaches the same new standalone source module and increments the cache key by `-sh01-live-v1`, commit `cb8a88cba74ce51ff459843f7c92c05e6e4d0d89`. This avoids offline installations retaining a mismatched cached engine/module pair.
- `tests/physics_tuning_v082534.test.cjs` had two obsolete exact adjacency assertions (`'physicsbalance','engine'`) and now requires strict `'physicsbalance','shotpaths','engine'` in both generator and offline precache, while retaining numerical/fatigue/super-shot tests and cache identity assertion; commit `28db5d20d6ebb8cc08e60b96bf659a11ddae012f`.
- `tests/shotpaths_build_integration_20261020.test.cjs` checks the emitted generated game fixture includes one helper declaration before ENGINE, 2 real call sites, no leftover module import, and cache freshness; commit `1e5a8b719e1ae4533f157cfe21d09a5ae95bdc12`.

## Release verification
Modular QA at `28db5d20` **PASS** [#39487919581](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39487919581). Modular QA at `1e5a8b71` **PASS** [#39487965490](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39487965490). The exact-head 4+4 Full Regression and Pages deployment must be verified separately before saying the new gameplay is live on production. The initial browser failure is a genuine regression caught before promotion; never remove or skip its test to mask the missing module.

**Ownership:** `integration-tooling` active owner `smf-hourly-dev-20261019`; `release-infra` SH01 offline addendum under the same agent's existing claim. No player data, UI, controls or physics formulas were modified by this repair. No physical-device test was conducted.
