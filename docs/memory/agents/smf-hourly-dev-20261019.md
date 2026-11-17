# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-17 20:57 CET

## Mission
Prioritize cheap ordinary ball carry vs expensive sprint and local-human-only Breath; then Player Studio, four-button counterable Tricks, existing-player eight-view art, goalkeeper, Career. Preserve 223 teams/2676 players, six formations, four actions, saves/offline, ten slots and SD09.

## Current checkpoint
- Read AGENTS.md, VERSIONING_POLICY.md, memory README/shared, own checkpoint and master backlog. GitHub compare before edits: dev 29 ahead of main `7247d6245b06b5ef77d8241840cb15cad5692e97`.
- Found exact-head `d9c2e4d` Census `44144249026` and Modular QA `44144248956` failed two Breath CPU-takeover Node tests. Their test override called saved `inControl` unbound, losing the game receiver. Corrected to `original.call(f.game,seat)` in `658c467`; backlog updated `21aed83`. Production code unchanged; candidate 0.12.81.71.
- Local git DNS still unavailable. New-head Node/Chromium, four+four Census, Modular QA, protected main promotion, Pages bytes not yet verified. Physical #48 remains open.

## Next smallest action
1. Inspect exact new-head CI and fix real failures; execute focused Node and actual Chromium Breath contrasts and visibility.
2. Implement player-facing Player Studio or counterable Magic Trick increment with regressions and aligned release metadata.
3. Advance existing-player eight-view assets with game-scale review.
4. Improve goalkeeper/Career with focused tests.
5. Promote only green exact dev head through protected main, verify Pages bytes; investigate Render #86, protect #87.

## Ownership and exclusions
Own checkpoint only; no new branches, force pushes, bypasses, roster changes, unapproved art or physical certification.

## Evidence
GitHub CI job logs and connector commits; no local or new-head green test claimed.

## Cleanup
Checkpoint <4KiB; no temporary branches.
