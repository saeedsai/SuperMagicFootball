# SuperMagicFootball hourly development checkpoint — smf-hourly-dev-20261019

## Mission
Feature-first development on the existing `dev` branch. Prioritize player-facing gameplay, counterplay, goalkeeper behavior, graphics/animation, Player Studio and Career/Cup. Do not spend runs on repetitive audits or tests for already-covered behavior. Preserve four actions (Pass/Shoot/Dribble/Jump), 223 teams, 2,676 players, roster ordering/ratios, six formations, saves, offline/PWA and ten Career/Cup slots.

## Current candidate
**0.12.81.396 — 28 November 2026.**

Feature commit: `8f04063965d433a7d0f244e75a732fd5d97a96da`.

`MAGIC-TRICK-SECOND-SCREEN-TURN-ARRIVAL-01`: the visible second-defender Magic Trick screen now evaluates the current position and a bounded 120 ms Agility-limited movement projection. A high-Agility defender turning into the pressured first-touch lane can earn the existing probabilistic read from just outside the 64-unit lateral window; low-Agility, stationary and retreating profiles cannot. Current screen geometry, ball-side shielding, 105/132-unit proximity, skill odds, READ! cue, 0.42 s counterpress, costs, cooldowns and possession remain unchanged. No new action, player state or automatic tackle.

The same commit repairs the .395 out-of-play targeted-pass browser-test oracle: it now checks the ordinary support-shape coordinates and primary ball pressure instead of incorrectly comparing a specific support player's target with a no-pass baseline where that player is not selected as support.

## Branches and release truth
- Before this checkpoint update, dev was `8f04063965d433a7d0f244e75a732fd5d97a96da`; this checkpoint update adds one docs-only commit on top.
- Main last observed: `e233a6edcd3b0fcfd4bf6d6b588024287248617c`, release .394.
- Main .394 Census, Pages deployment and hosted-byte smoke were previously independently successful. .396 is not promoted or deployed.
- GitHub branch protection remains unresolved: #87; do not describe main as protected.

## Validation
- .395 Modular QA #46102393957 passed 3,053/3,053 Node tests.
- .395 Full Regression Census #46102393894 failed only the out-of-play targeted-pass browser assertion. The observed support target was the correct generic shape and the primary remained on the live ball; the assertion compared different support-player roles. Diagnosis and correction are recorded in `docs/MASTER_BACKLOG.md`.
- .396 Modular QA and exact-head eight-shard Census have not yet been observed. Do not claim passing tests until Actions results are inspected.
- Keep #48 physical two-phone acceptance open; LAN/P2P is out of scope absent a confirmed regression. Monitor #86 Render drift separately. No authenticated online hosting without owner resources.

## Next action
Inspect Modular QA and the four-Node/four-Chromium Full Regression Census at the exact final .396 dev head. Fix any confirmed failure without weakening assertions. If green, permit only the existing QA-gated main pipeline to promote, then independently verify main Census, Pages deployment and hosted bytes. After the release gate, continue with the smallest meaningful unfinished gameplay/counterplay item in `docs/MASTER_BACKLOG.md`.
