# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay and existing-player presentation while preserving four actions, roster identities/order, saves and offline play.

## Current checkpoint
- .175 AI-GROUND-SPILL-SECOND-BALL-COVER-01: the second CPU presser now covers a bounded short bounce/roll landing point after a recent low tackle/deflection spill while the primary continues toward the live ball. Helper rejects stale, slow, excessive-speed, owned/pass/shot, invalid-last-touch and implausible collection states; projection is capped and field-bounded. Focused mirrored helper/engine Node and desktop/simulated-touch Chromium regressions added.
- .174 Modular QA #44981858444 passed. Full Census #44981858446 failed only historical `lan_auto_two_browser_qa.py` in browser shard 0 (64 pass, one 10-second Playwright wait timeout); failed-job-only retry attempt 2 was still running at 05:04 CET. .174 not certified or promoted.
- .172 is latest Pages-verified release: QA-gated promotion, Pages #44981249519 and main Census/hosted smoke #44981254933 passed on main SHA 4e1bfe25ae5a8f6d28231e8578bb7c0953ecfdea.
- Current main protection #87 remains unresolved (`protected=false`). #48 physical two-phone acceptance, #86 Render drift and #10 graphics acceptance remain open.

## Next smallest action
Run exact-head Modular QA and Full Regression Census for .175; fix only confirmed failures, then verify QA-gated promotion, Pages deployment, main Census and hosted-byte smoke separately. Continue gameplay-first work.

## Ownership and exclusions
Only this checkpoint. No concept heroes, copied art, routine LAN runtime changes or other agents' private checkpoints. Preserve 223 canonical teams, 2,676 players, six formations, four actions, saves, ten Career/Cup slots, SD09 and offline/PWA behavior. No visual art approval or physical-device acceptance claimed.

## Evidence
- Dev before this increment: bb76b7f0d5494faf9933451d84a3808ecfd37504; main: 4e1bfe25ae5a8f6d28231e8578bb7c0953ecfdea.
- Render broker remains on dev with commit auto-deploy enabled; live commit is still LAN-094 (3da2f0c...). This increment does not modify broker files.

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
