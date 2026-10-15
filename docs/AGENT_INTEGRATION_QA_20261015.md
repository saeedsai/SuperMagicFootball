# Club26 + Character-Art Agent Integration Audit — 15 October 2026

## Purpose and merge result

Audited all changes on `dev` after the v0.8.25.32 Studio release (`50c839aa5e8947176f00105dabab9582816823d9`). As of the inspection checkpoint, the latest integrated head was `28d50c31e49c9b2d259b0d465c4db2bdd82a068b`.

GitHub's direct comparison showed **65 commits ahead, zero behind**. The roster and graphics work were already in the same linear ancestry, so cherry-picking or merging the agents' commits again would duplicate their changes. This integration preserves that common branch history.

| Workstream | Representative commits | Production changes |
| --- | --- | --- |
| Club roster editor | `b607f7f31285`, `cad745419866`, `273d9dbcbd10` | `data/players/club26.json`, `src/roster_corrections.js`; 32 clubs, 384 players, role quotas |
| Graphics editor | `ce1052fd3235`, `486b682ca37c`, `1cdee9ac8bbe`, `b48f10a31120` | New `src/modules/characterart.js`, integration through `render.js`, improved face, eyebrow, beard, tattoo and rear-view shapes |
| Combined QA/remediation | `ffe09c92e3e3`, `85c658167535`, `28d50c31e49c` | Full-roster rendering, browser test maintenance, final comprehensive regression results |

## Integration improvement in this checkpoint

Nine existing Flamengo records in `club26_31` lacked an explicit `ratingSource` field. Retained all nine values, identities, roles and player IDs, and marked them `Editorial provisional; FC27 OVR not confirmed` in **both** the authoritative JSON and the legacy compatibility roster export. None is falsely described as independently checked against an EA database.

Club26 source categories are now:
- **290 records** tagged as FC27 comparison values by the roster agent (not independently rechecked here).
- **94 records** tagged editorial/provisional (85 previous replacements plus nine unlabelled Flamengo records).
- **0 records** without provenance category; **0 fictional** Club26 slots.

A new `tests/club26_player_graphics_integration.test.cjs` test checks **32 teams and all 384 players** for ID/source/stats/role consistency, verifies JSON and compatibility roster equality, then exercises the **production character-art renderer** through five directional projections with the live avatar resolver (1,920 draw calls). It checks the loader, renderer import and service-worker source registry.

The comprehensive CI workflow now reruns on material changes to the Club26 data, roster compatibility module, graphics renderer/presets or this new integration contract. `tests/club26_fc27_roster.mjs` also checks the updated 290/94 provenance split.

## QA certification and caveats

The last completed **same-commit full census before this checkpoint**, on `85c658167535357e2fce28ebc633c36807e303fd`, reports **81/81 Node scripts and 46/46 Chromium scripts**, zero failed or timed out: [GitHub Actions run 38776138459](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38776138459). The newer `28d50c31e49c` parent passed modular CI and Pages deployment.

The additional provenance and roster-graphics test changes in this integration must be certified by the **new commit's own** full regression workflow; older results are historical evidence only. Consult the new commit's `Full Regression Census` and `Modular Game Dev QA` run details for definitive post-merge PASS/FAIL and trace artifacts.

### Acceptance invariants

- 223 built-in teams and 2,676 players; all roster IDs, team ordering and 2 GK / 3 DF / 4 MF / 3 FW quotas preserved.
- Club26: 32 clubs, 384 non-fictional players; 290 agent-sourced FC27 comparison ratings, 94 explicitly provisional.
- New art renderer active for match and Studio; graphics changes do not alter gameplay physics, button count, team data or saved appearance schema.
- Full historical Node/Chromium regression, seeded matches and Studio direction checks remain part of the automated census.
- Real-world transfer registration, **independent EA FC27 rating verification**, physical-device/browser-process persistence, and subjective portrait similarity are **NOT CERTIFIED**. Do not infer these from passing automated QA.

## Active development plan

Continue graphics likeness refinement, gameplay-JSON mechanics extraction, match animation improvements, editor/data conflict diagnostics and career/tactics enhancements as previously scheduled. Exhaustive Pages reloading/saves and physical mobile/PWA/FPS testing remain owner-deferred to the far-future backlog. Production `main` was not changed by this integration.
