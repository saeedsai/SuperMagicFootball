# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-30

## Mission
Develop on existing `dev` only; no new branches, force-push, direct main writes or bypassed CI/security. Preserve 223 teams/2676 players, 12-player rosters, six formations, four Pass/Shoot/Dribble/Jump controls, saves/offline, ten Career/Cup slots, SD09 and LAN/P2P.

## Current checkpoint
- **0.12.11.0 STUDIO-JUMP-PREVIEW-01:** Added `src/modules/jumpmetrics.js` pure shared Jumping profile: 1..100 rating, 30..100% relative jump height, 420/535 max impulses, 1..1.99x jump Energy cost. Match engine's single/double jump and jump Energy spend now use this exact profile. Player Studio labels all 15 stats and updates height/energy preview on edit, reset or invalid input; no persistence until SAVE PLAYER STATS.
- Updated test-only QA build module order and PWA precache, rotated offline cache, About-only four-field 0.12.11.0 release metadata, package and README; no save/roster schema changes.
- Added seven-case `tests/studio_jumping_preview.test.cjs`; repaired `tests/jumping_fatigue_real.test.cjs` extracted engine test to inject Jumping and Breath dependencies.
- Prior 0.12.10.0: walking/idle Breath regeneration, foot-level circular Breath gauge, top ENERGY bar and Breath-based dribble pacing. Prior 0.12.9.0: Career Energy and short-term Breath. Prior 0.12.8.0: Jumping stat and monotonic jump fatigue. Earlier Studio eight-view gallery, Career rename, UI/art and LAN features remain.
- LAN-094 two-client automation delivered, physical two-phone acceptance still **unverified**. No routine LAN implementation until confirmed regression. Keep issue #48 open.

## Next smallest action
1. Verify exact-head four Node/four Chromium/Modular QA via GitHub Actions; fix real regressions without weakening checks.
2. Visually check Player Studio Jumping preview and invalid-input/reset on mobile and desktop; verify four gameplay buttons.
3. Integrate independently authored eight-view character art, including side-facing corrections (#15).
4. Implement next bounded counterable Magic Trick / goalkeeper penalty feature with regression tests.
5. Advance Career progression and promote only exact green `dev` through protected main pipeline, then verify hosted Pages bytes.

## Ownership and exclusions
Sole authorized maintainer. Historical feature locks are nonblocking. Never access or alter another agent's private checkpoint. Preserve all existing source data and LAN logic. Issue #48 physical certification open; #86 Render commit-trigger drift open; #87 main protection missing.

## Evidence
- Starting exact heads: dev `e790f0afa4df6006a23ec291603e85651f6d525c`, main `e8c07652f66071ec2da5370127966475f2f0df45` (50 commits ahead).
- Focused V8 execution: 14/14 checks passed; extracted real-engine jump fatigue strictly monotonic across nine ratings, 1.99x cost at Jumping 1. New Node tests committed but **full Node and Chromium suites not executed** here.
- Local `git ls-remote` failed DNS (cannot resolve github.com); GitHub connector writes succeeded. Commit combined status returned no statuses; PR-filtered workflow lookup returned zero runs. Push-triggered workflows may run separately; not proof of green CI. No main promotion, physical acceptance or hosted Pages certification.

## Cleanup
Keep this checkpoint below 4 KiB and shared memory below 6 KiB; Git history/development log retain full details. Continue small, SHA-checked increments.
