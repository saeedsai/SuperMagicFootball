# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- 0.12.81.377 — KEEPER-HIGH-CROSS-TURN-ARRIVAL-READ-01.
- CPU goalkeeper high-cross safety now projects an active airborne opponent through the existing Agility-limited turn model when both live movement axes are available. An elite jumper turning into the cross can suppress an unsafe claim; low-Agility and aligned movement retain the prior outcome.
- The 0.22-second aerial contest horizon, 52-unit per-axis lead cap, 72-unit overlap radius, ball/jump flight, keeper claim envelope/contact, four actions, saves, rosters, persistence and offline play remain unchanged.
- Production: `src/modules/ai.js`; focused Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend `keeper_high_cross_claim`.

## Next smallest action
- .376 exact-head dev Census #46049363058 passed; Modular QA #46049363095 passed.
- .376 was promoted to main at `390ef6e6b4e012eaf5f26ae3b7c28c3bf0db0759`; Pages deployment #46050971965 succeeded. Main Census #46050981151 was still running at last inspection.
- Run exact-head Modular QA and the four-Node/four-Chromium Census for .377. Fix confirmed failures without weakening production assertions; only a green exact head may promote through the existing QA-gated pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Read/update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Previous dev/main head: `390ef6e6b4e012eaf5f26ae3b7c28c3bf0db0759`.
- .376 dev Census #46049363058 and Modular QA #46049363095 passed.
- .376 Pages deployment #46050971965 succeeded; main Census #46050981151 pending at last inspection.
- GitHub REST reports `main.protected=false` and `dev.protected=false`.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
