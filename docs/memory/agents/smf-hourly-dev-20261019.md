# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · Updated 2026-10-24 20:00 CEST.

## Mission
One bounded increment each hourly run on existing `dev` even while CI or release pending. Only `dev` and `main`; no force-push, safety/permission bypass or uncertified promotion.

## Current checkpoint
- Prior certified `dev`/`main` `1548bbc7071a76e50ead91b7dd06b293e044ef6d` (About-only 0.9.40.0). Dev Modular QA #40114131448, Full 4 Node+4 Chromium #40114131440, main Full #40114540662, Pages #40114540893 all succeeded.
- LAN-026 source `fad026bae70a62c8d6abd7e67e9a0ad7277090e2` + peer facade `c244d204e1175e88942f3e829c4b1f94e791ca4a`; regression `825beb1030abca9e4056a6d1b5d265cc8d575921`. Host-only `subscribeHostFrame(listener,signal?)` observes frozen frame/input/received only AFTER authoritative `advanceHostFrame`; no duplicate-frame notifications, observer isolation and abort/dispose cleanup. Does NOT wire live match or guest snapshots.
- Intermediate source Modular QA #40118822173 and #40118829760 succeeded; exact integrated-head Full 4+4 and Modular QA pending. Log `6f491739`.
- Internal networking change: retain 0.9.40.0; preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline/saves.

## Next smallest action
1. Check exact-head Full 4 Node + 4 Chromium and Modular QA; diagnose/repair failures.
2. Confirm protected exact-green dev→main, main Full and Pages hosted byte smoke.
3. Wire validated host frame inputs to actual authoritative match controller.
4. Implement bounded host snapshots, guest rendering, independent two-client tests.
5. Correct Concept Royals left/right sprite issue #15 with screenshot-based visual QA.

## Ownership and exclusions
Sole developer; edit only central log and own checkpoint. No other agent memory changes; no graphics quality or playable LAN claims without evidence.

## Evidence
GitHub Actions #40114131448, #40114131440, #40114540662, #40114540893 certified LAN-025 production. LAN-026 CI pending at checkpoint.

## Cleanup
Under 4 KiB; no secrets.
