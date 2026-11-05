# Candidate 0.12.81.51 validation

**Status: promoted, deployed and main-verified.** Exact-head Full Regression Census and Modular Game Dev QA passed for SHA `93d5ba3745b887e9227872616a3e98e69fa234e5`; protected promotion to `main`, Pages deployment, hosted-page byte/smoke and main-branch Census run `42023528636` passed. Owner visual/gameplay and physical-device acceptance remain open.

## Changes

- A possessed field player's `moveVX`/`moveVY` now sets the renderer-only tumble direction for the projected ball panels. The ball radius (17 match units), simulation vectors, ownership offsets, roll angle, saved ball cosmetic, and collision/physics paths are unchanged. A zero-motion field player and a keeper-held ball retain the existing stationary surface fallback.
- The narrow portrait Home header wraps safely and right-aligns the wallet/tools group within the available width. No menu artwork, player art, currency balance, or unlock eligibility changed.
- The newly added Studio/browser QA fixtures use a real local origin and schema-1 wallet data for IndexedDB migration instead of opaque-origin localStorage fakes. This fixes the .50 census fixture assumptions without changing user data behavior.

## Validation run locally

- `npm run test:node`: build passed (**5,215,219 JS / 5,338,271 HTML characters**); Node suite **2,277/2,277**; Club26/FC27 fixture passed.
- `node --test tests/game_ball_surface_render.test.cjs`: **11/11 passed**.
- `python tests/game_ball_carrier_roll_browser_qa.py`: **40/40** production-renderer samples passed across five skins and eight carrier headings at the 17-unit game radius; state snapshots stayed identical and Chromium reported no page errors. Contact sheet: [carried-ball roll gallery](evidence/browser/ball_carrier_roll_012851.png).
- The Home narrow-layout QA passed on desktop, 390px and 320px viewports; a 390px stress case with a nine-digit displayed token balance retained a 390px document width.
- Four previously failing Studio/customization browser fixtures passed on localhost after the IndexedDB fixture correction: FIX-UI-101 desktop/touch, frame-step gallery desktop/touch, graphics integration **19/19**, and eight-view gallery **19/19** desktop/touch.
- `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`: **20/20 passed**, including exact package/README/release/service-worker cache consistency.
- `git diff --check` passed for the renderer, layout and focused tests.

## Census follow-up and remaining acceptance

- Exact-head .50 Modular Game Dev QA passed. Its Full Regression Census failed in browser shards 1 and 2: several older Studio/customization fixtures still seeded wallet unlocks only in fake localStorage after the app moved wallet storage to IndexedDB, and the Home tools row exceeded a 390px viewport by 3px. .51 updated those fixtures and layout; its full four-shard Census, protected promotion, Pages deployment, hosted byte/smoke and main Census passed.
- Server-side live PVP match resume remains intentionally unimplemented. The authoritative engine has no validated simulation/PRNG/input-state export/import contract; restoring its filtered public snapshot would desynchronize play and could enable result manipulation. The safe recovery continues to mark active no-result matches interrupted. True live resume requires an engine checkpoint contract plus owner-hosted PostgreSQL failure drills.
- Customer hosting/database/OIDC/secrets/backups, two-device network play/reconnect, physical Android/iOS and screen-reader checks, and owner visual/gameplay approval remain open.
