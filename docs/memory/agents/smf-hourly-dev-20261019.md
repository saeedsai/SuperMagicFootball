# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 10:59 CET

## Mission
One bounded, focused-tested increment per hourly run directly on existing `dev`, even during pending releases. Only `dev`/`main`; never force push, bypass security, or certify unverified changes. Do not read or edit other agents' private memory.

## Current checkpoint
At 10:59 CET, `main` = `fd56cddd03c749c5cfd7274aaea0600384b56acd`; `dev` = `7e57beb2fb5843f49b66e2d61a39281f3eefefb4` before documentation update (10 commits ahead, no divergence). Exactly two branches. Source `8a161a1eb660ac5d7aded099fe8e9f29a3793802` adds LAN discovery host-approved occupancy (1/2 players), emits room updates and retains occupancy on heartbeat, preserving prior state after failed send. Tests `7e57beb2fb5843f49b66e2d61a39281f3eefefb4` cover guest sync, invalid counts and failed-send rollback. Concurrent offline-stop cleanup was reconciled, not overwritten.

## QA and blockers
Node 22 isolated LAN suite 7/7 PASS, `node --check` PASS. Source blob `361bf2576986fe3fc0cc44979778b1b539771b1d` matched GitHub. Full clone failed: `Could not resolve host: github.com`. GitHub connector source/test writes succeeded. No full exact-head 4 Node+4 Chromium, Modular QA, physical two-client/graphics QA or Pages certification for new dev. Baseline `0f1f0100e4d3644308643781b7d8420308bdcc67` was previously green, but cannot certify newer dev. Do not promote without exact-head green checks.

## Constraints
Preserve 223 teams/2676 players, six formations, exactly four controls, ten Career/Cup slots, SD09, saves/offline, and About-only four-field version. Current internal LAN foundation is not player-facing; candidate stays 0.9.41.9. On player-facing release synchronize release.js, package, README, SW cache, version tests and truthful notes.

## Next five
1. Inspect exact-head CI and resolve failing jobs; run full 4+4 + Modular QA.
2. Implement authenticated LAN-scoped discovery/signaling transport (issue #48).
3. Wire Find Games, Create Game, host Accept/Reject, occupancy and reconnect UI.
4. Test real two-client gameplay and desktop/touch graphics.
5. Promote only exact green dev head through protected main pipeline; verify Pages hosted byte smoke.

## Log
See `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md`. Never pause compatible increments for pending promotion.
