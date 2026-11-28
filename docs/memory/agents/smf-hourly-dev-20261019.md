# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.413: LIGHTNING-GROUNDED-READ-CUE-01. A grounded defender who wins Lightning's live 2D facing/closing and Defence-versus-Dribbling read now receives the existing reduced-flash-safe READ! ring/label at resolution. An eligible CPU backup receives the cue when it makes the read for a selected human. JUMP/slide counters retain their existing animation feedback; no false READ! cue is shown.
- Gameplay and release commit: 0ac9fd49ca9b34eabd80619a2f3189fb243d76cc. Candidate source changes are on existing dev; checkpoint update is a separate follow-up commit.
- .412 Modular QA #46161328787 and Full Regression Census #46161328822 passed on exact SHA b35c11c494ec236040ed52d753d321f13e310475; the QA-gated promotion and Pages deployment succeeded. The first .413 Modular QA/Census preflight failed only a stale source-contract regex in tests/studio_lightning_trick_policy.test.cjs; the resolver now has separate grounded-read cue assertions for target/backup while retaining the counter event contract. Rerun both workflows at the corrected exact dev head.

## Next smallest action
Inspect exact-head .413 Modular QA and Full Regression Census: all four Node and all four Chromium shards, especially direct-target and selected-human CPU-backup Lightning read cues in desktop and simulated touch. Fix only confirmed failures without weakening gameplay assertions. Promote only through the existing QA-gated main pipeline after a green exact head; then independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Run-start dev/main: f3f34f9c188462c03f8f35aa733cd91def3b26d7 (identical).
- Candidate .413 source commit: 0ac9fd49ca9b34eabd80619a2f3189fb243d76cc; exact current dev ref is the follow-up checkpoint commit.
- Open issues observed: #87 branch protection, #86 Render commit-trigger drift, #48 physical two-phone acceptance, #3 Android rainbow-dribble test-isolation follow-up, #10 graphics seam review and #12 deployed About revision.
- Main .411 Census #46159642708 and Pages deployment #46159636355 passed; hosted-byte smoke was reported successful in the main Census.
- No local clone, Node suite, Chromium suite, physical-device test or new hosted-byte smoke was run in this execution. .413 GitHub Actions exact-head evidence is required.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
