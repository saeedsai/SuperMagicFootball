# SuperMagicFootball development checkpoint
**Agent ID:** `smf-hourly-dev-20261019`

## Mission
Feature-first development on the existing `dev` branch. Prioritize player-facing gameplay, Magic Trick counterplay, goalkeeper behavior, graphics/animation, Player Studio and Career/Cup. Avoid repetitive audits and tests for already-covered behavior. Preserve four actions (Pass/Shoot/Dribble/Jump), 223 teams, 2,676 players, roster ordering/ratios, six formations, saves, offline/PWA and ten Career/Cup slots.

## Current checkpoint
**Candidate 0.12.81.396 — 28 November 2026.** Feature commit: `8f04063965d433a7d0f244e75a732fd5d97a96da`.

`MAGIC-TRICK-SECOND-SCREEN-TURN-ARRIVAL-01`: the visible second-defender Magic Trick screen now evaluates the current position and a bounded 120 ms Agility-limited movement projection. A high-Agility defender turning into the pressured first-touch lane can earn the existing probabilistic read from just outside the 64-unit lateral window; low-Agility, stationary and retreating profiles cannot. Current screen geometry, ball-side shielding, 105/132-unit proximity, skill odds, READ! cue, 0.42 s counterpress, costs, cooldowns and possession remain unchanged. No new action, player state or automatic tackle.

The feature commit also corrects the .395 out-of-play targeted-pass browser-test oracle: it checks ordinary support-shape coordinates and primary ball pressure instead of comparing different support-player roles.

## Next smallest action
Inspect exact-head .396 Modular QA and Full Regression Census. Fix every confirmed failure without weakening assertions. Only a green exact dev head may enter the existing QA-gated main pipeline; then independently verify main Census, Pages deployment and hosted bytes. After the gate, select the next unfinished gameplay/counterplay item from `docs/MASTER_BACKLOG.md`.

## Ownership and exclusions
Work only on `dev`; no new branches, force-pushes, history rewrites or manual main-security bypasses. Read only this agent's checkpoint among agent checkpoints. Keep #48 physical two-phone acceptance open; avoid routine LAN/P2P work absent a confirmed regression. Monitor #86 Render drift. Authenticated online hosting requires owner resources. Main protection #87 remains unresolved and must not be described as active.

## Evidence
- Feature commit: `8f04063965d433a7d0f244e75a732fd5d97a96da`.
- Checkpoint formatting correction: current dev checkpoint commit follows the feature commit; query the branch for its exact SHA.
- .395 Modular QA #46102393957: 3,053/3,053 passed. .395 Full Census #46102393894: failed only the out-of-play targeted-pass browser assertion; its baseline compared different support roles. The observed pass target was the generic support shape and primary pressure remained on the ball.
- .396 Modular QA #46106752629: 3,059/3,060 passed; the sole failure was this checkpoint's missing indexed Agent ID/required headings. Full Census #46106752621 stopped at the same preflight failure; browser shards were skipped.
- Main .394 SHA last observed: `e233a6edcd3b0fcfd4bf6d6b588024287248617c`. Its Census, Pages deployment and hosted-byte smoke had succeeded. .396 is not promoted or deployed.

## Cleanup
Only this agent's checkpoint is updated; keep it below 4 KiB. No other agent checkpoint is to be read or changed. Record actual test outcomes, never inferred passes.
