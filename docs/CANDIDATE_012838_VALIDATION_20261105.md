# Candidate 0.12.81.38 — local validation (5 November 2026)

## Scope

- Shot-down outfield players now plant the near hand against the pitch with open-finger detail while the far arm stabilizes the torso during the existing get-up timer. The animation blends back to neutral at both endpoints and does not affect goalkeepers.
- Pitch line markings receive a subtle dark contrast edge to remain visible across venue turf colors and patterns. Official paths, dimensions and field bounds are unchanged.
- Online Career reads the season row and fixture rows within one `REPEATABLE READ READ ONLY` transaction, avoiding a mixed-version response if a result advances the season between those reads.
- Player/ball physics, positions, collision, match results, four-button controls and offline saves remain unchanged. No new character or menu artwork was created.

## Validation run

- `python -X utf8 scripts/build.py`: passed; generated fixture size **5,141,765 JavaScript / 5,264,777 HTML characters**.
- Focused Career, pitch and shot-recovery tests: **28/28 passed**.
- Full tracked Node suite (`node --test` over tracked `tests/*.test.cjs`): **2,194/2,194 passed**.
- `node --test tests/online-career-service.test.cjs`: **13/13 passed**, including one consistent-read transaction around season/fixture projection. This uses a fake DB test seam; no live PostgreSQL concurrency test was possible.
- `python -X utf8 tests/shot_impact_reaction_browser_qa.py`: actual production renderer showed nine distinct impact/recovery/stun poses across eight heading views, with no game-state changes or browser errors. ![Shot recovery and reaction poses](evidence/browser/shot_recovery_brace_20261105.png)
- `python tests/stadium_01_render_browser_qa.py`: actual production renderer covered all **20 venues**, with distinct venue artwork, persisted picker selection and no browser errors. ![Pitch line contrast across venues](evidence/browser/pitch_contrast_venues_20261105.png)
- `git diff --check`: passed.
- Candidate .38 source SHA `1d5e84a9fd2d333ca20b56a090629ee1de77fd9a` passed exact-head Full Regression Census [41935832218](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41935832218) and Modular Game Dev QA [41935832111](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41935832111), and the protected promotion succeeded. Main Full Regression [41937788010](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41937788010) and Pages deployment [41937788355](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41937788355) passed. Public root, service worker, release module, and online config returned HTTP 200; deployed cache/release are `.38`, while online provider settings remain empty. Physical-device acceptance and owner visual approval remain open.

## Limits and remaining gates

The screenshots are automated renderer evidence, not owner visual approval. Online Career consistency was validated through the service test seam, not a configured database. The hosted game is live at `.38`, but online account/matchmaking remains unavailable until database and OIDC settings are provided and the backend is hosted. Physical-device acceptance and visual approval remain open. See [online server deployment handoff](ONLINE_SERVER_DEPLOYMENT.md) and [master backlog](MASTER_BACKLOG.md).
