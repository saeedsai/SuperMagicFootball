# Candidate 0.12.81.52 validation

**Status: local development candidate, not release-certified.** This adds a visual-only dribble presentation improvement to the carried-ball and narrow-Home changes in .51. Exact-head `.52` CI has not run; owner visual/gameplay and physical-device acceptance remain open.

## Changes

- Each of the ten existing dribble styles now uses a distinct on-field cue: lateral sweep, roulette orbit, elastico curves, rainbow arc, swerve trails, drag-back hook, heel-flick lift, stepover loops, nutmeg lane, or lightning cut. Existing style colors and move labels remain. The labels counter-mirror with the active view so either team reads them normally.
- VFX follow the existing successful trick action/timer. Controls, stats, trick duration, stamina/cooldowns, possession, ball trajectory, save data and player simulation state are unchanged. The cues are steady and use no flashing.

## Validation

- `node --test tests/dribble_style_vfx.test.cjs`: **2/2 passed**. Each of the ten styles emits different geometry, retains its label, works for both view sides, and leaves player fields unchanged.
- `python tests/dribble_style_vfx_browser_qa.py`: **20/20** actual-player renderer samples across all ten styles and both team-facing directions; unchanged game/ball/options/score snapshot, zero browser errors. Visual contact sheet: [dribble style VFX](evidence/browser/dribble_style_vfx_012852.png).
- `npm run test:node`: build passed (**5,218,116 JS / 5,341,168 HTML characters**); Node **2,279/2,279** and Club26/FC27 passed.
- `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`: **20/20 passed**; `.52` package, README, About module, and rotated offline cache agree.
- Exact `.51` CI and deployment passed: Full Regression Census, Modular Game Dev QA, protected promotion, Pages deploy and hosted byte/smoke. Its main Census is still running. Exact-head `.52` CI has not run.

## Remaining acceptance

- Real-player game-scale review and owner visual approval; physical touch/gamepad/accessibility review.
- Exact `.52` Full Regression Census and Modular QA, then protected promotion, Pages deployment, hosted byte/smoke and main Census.
- Public Online Career/Ultimate Team/PVP configuration and live-network tests still require the owner’s server, durable PostgreSQL, OIDC/secrets and backup/restore setup. Restarting an active live PVP simulation cannot safely resume yet because the authoritative engine has no validated state/PRNG/input export-import contract; no-result runs remain safely interrupted.
