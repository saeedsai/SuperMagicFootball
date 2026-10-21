# SuperMagicFootball — sole developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-21

## Mission
Sole developer. Read AGENTS.md each run; diagnose and repair blockers rather than just reporting. Preserve 223 teams/2676 players, six formations, four actions, saved-game and offline compatibility, About-only 0.9.0.0, Career slots and opt-in SD09.

## Current checkpoint
Last verified production main `7e90a40ca5ec0c991943ec2d86389093b85bd863` green 4+4 and Pages workflow #39594234058. Dev baseline `e77cfc46` Full Census #39604967299 failed Chromium v060_qa.py (Cup result skipped when storage unavailable) and intermittent v08249_zero_human_control.mjs; 3/4 browser and 3/4 Node shards passed, Modular QA #39604967962 passed.

## Next smallest action
Check exact current dev/main SHA and Actions. Source fixes for Cup restricted-origin match autosave (`bc2584c7`) + focused test (`440f03ff`), AI test trajectory (`db5d4a46`), Studio 14-stat editor (`d5ac760f`) + tests (`5c69b6af`) are on dev. Central log updated (`b44bba89`). Verify current-head focused/4+4/Modular and real Cup/Studio desktop+touch; fix failures, promote only green, then hosted Pages smoke.

## Ownership and exclusions
No legacy claim gates. Read shared docs and only this private checkpoint. No force push, bypass or concurrent overwrite; don't claim unobserved tests or deployment.

## Evidence
CI baseline #39604967299 failure and Modular #39604967962 success. Latest source/test commits listed above. New exact-head CI runs were not yet visible when writing this note; green certification and deployment pending.

## Cleanup
<4KiB. Next five: CI repair; Cup browser reload and autosave; Studio live QA; green-only Pages release; Studio ability chooser, Tricks, LAN, graphics.
