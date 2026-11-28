# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.395 adds AI-TARGETED-GROUND-PASS-EDGE-REJECTION-01: targeted low-pass cover rejects a ball already beyond the validated 24-unit playable margin, matching untargeted-pass behavior. The CPU support defender keeps ordinary shape instead of chasing a clamped out-of-play screen; primary ball pressure and valid targeted/untargeted cover remain.
- Feature commit: `ab4101d11e4960098c872c0a4c74738e57ea8807`.
- Focused Node coverage mirrors both teams and the attacking-side x plus top/bottom y margins. Desktop and simulated-touch Chromium acceptance compares actual GameEngine support and primary targets against the no-pass fallback.
- .394 was promoted through the existing QA-gated pipeline: dev Census #46100399605 passed all eight shards, Modular QA #46100399661 passed, Pages #46101128191 succeeded and hosted-pages smoke in main Census #46101134564 passed. The main Census was still running at last observation.
- .395 exact-head Modular QA and four-Node/four-Chromium Census are pending. No .395 deployment claim.

## Next smallest action
- Inspect exact-head .395 Modular QA and Full Regression Census; repair any confirmed issue without weakening assertions.
- Continue intelligent pass interception against diagonal/late receiver cuts and second-defender support, then remaining Magic Trick counterplay.
- Keep existing-player eight-view Studio work, goalkeeper decisions, Player Studio and Career/Cup moving when a bounded acceptance is ready.

## Ownership and exclusions
Update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Repository heads
- .395 feature commit: `ab4101d11e4960098c872c0a4c74738e57ea8807`.
- Main at feature commit: `e233a6edcd3b0fcfd4bf6d6b588024287248617c`.
- Final dev head is this checkpoint commit; verify the branch API before reporting.

## Evidence
- .394 Modular QA #46100399661: passed.
- .394 Full Regression Census #46100399605: passed preflight, preview, all four Node and all four Chromium shards; QA-gated promotion succeeded.
- Main Pages deployment #46101128191: success; hosted-pages smoke in #46101134564: success. Main Full Regression Census #46101134564 was still running at last observation.
- .395 focused regressions are committed with the feature; exact-head CI results pending.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent; leave other checkpoints untouched.
