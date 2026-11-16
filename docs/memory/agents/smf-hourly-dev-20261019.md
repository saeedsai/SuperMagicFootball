# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-16 23:06 CET

## Mission
Advance gameplay, Player Studio, four-button Magic Tricks, existing-player art, goalkeeper and Career. Preserve 223 teams, 2676 players, six formations, four actions, offline/saves, ten Career/Cup slots and SD09.

## Current checkpoint
- At run start dev/main both `3704ef4d528c00e85905c461ac4fef5d2e81cbcb`; dev Modular QA, four Node/four Chromium Census, main Census, Pages and hosted smoke all green.
- Existing .66–.68 mechanics: very low ordinary carrying drain, costly sprint, walking/idle recovery and ring only for local human selected player. Prior Node lifecycle regressions now deployed.
- Extended actual-game desktop/simulated-touch `tests/breath_selected_browser_qa.py` to check analog .55 walk recovery, .56 normal possession minimal drain and .56 partial-stick sprint >5x drain. Browser test commit `dcde497`, backlog `67122b0`. No player-facing change; version stays 0.12.81.71.
- New exact-head CI pending; local browser execution not claimed. Do not claim promotion/deployment for new commits until verified.

## Next smallest action
1. Inspect exact-head four Node/four Chromium Census and Modular QA; fix any failures.
2. Implement a bounded new Player Studio, four-button counterplay or existing-player animation feature with focused tests.
3. Continue goalkeeper/Career polish and desktop/touch acceptance.
4. Verify exact green promotion, main Census, Pages and hosted bytes separately.
5. Read-only investigate Render #86 when relevant; never close physical LAN #48 without real-device evidence.

## Ownership and exclusions
Own checkpoint only. No other agents' private memory, new branches, force-push, CI bypass, concept heroes or roster churn.

## Evidence
Prior `3704ef4` exact-head gates and Pages green. New Chromium regression commit accepted by GitHub, not yet verified passing.

## Cleanup
Under 4 KiB; no temporary branches.
