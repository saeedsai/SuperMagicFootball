# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 18:30 CET

## Mission
Continue one bounded roadmap increment per hourly run on existing `dev` despite pending CI/release. Only `dev` and `main`; never bypass security or force-push. Follow AGENTS.md and docs/VERSIONING_POLICY.md.

## Current checkpoint
Before increment: `dev=main=2e92165a1256cba19c7612eacf15331274545cd1`; exact-head Modular QA #40205918022 and Full Census #40205918023 passed, with four Node and four Chromium shards. Main synchronization verified, but Pages hosted byte smoke and physical two-device LAN not independently certified.
New About-only candidate `0.9.42.1`: LAN guest explicit leave/cancel/switch, socket-bound release of pending joins and approved seat, host cancellation notification and stale approval UI clearing. Pure helper `scripts/lan-guest-release.mjs`, wiring in server and auto lobby, tests `tests/lan_guest_release.test.cjs`. Version, README banner/heading, About, offline cache, policy and shared memory updated. No new branch.

## Current increment
Server-only host departure notification committed as 136a95d3; regression source assertion committed as 056d5491. Approved guest receives host-left, pending join-reject includes roomId. Guest lobby host-left handling, exact-head CI, visual and device QA remain unverified. No version bump for companion-server-only change.

## Latest LAN increment
Room registration confirmation commits c3c424f4 (server) and 9ecf1c4b (UI); test 1da83c4d. UI no longer claims successful hosting until server ACK; registration errors surfaced. Full CI and hosted service not verified. Player-facing change requires coordinated version/README/cache before promotion.

## Hosted signaling increment (2026-10-25)
Commits d83bcf70 (policy), a166b3fa (server wiring), d07be37c (4 tests), 62327062 (log). LAN remains default; opt-in hosted mode accepts only configured exact HTTPS Origin and exposes rooms across IPs. Three isolated Node behavioral tests passed; source wiring verified. This is server-side groundwork ONLY: no hosted service, public signaling endpoint, TURN, abuse protection, two-device verification, full 4+4 CI, graphics certification or protected promotion. Concurrent dev changes seen; re-fetch before edits. Next: bounded room/rate controls, browser auto endpoint, full CI and real hosted deployment. No version bump for this server-only increment.

## Latest bounded signaling increment
Server room capacity and per-guest/per-room pending queue bounds committed 20b3d4c2, regression source contract 98b24b72. Focused and full exact-head CI not yet observed. Hosted service provisioning and physical two-device verification remain open. Continue dev despite pending promotion.

## Latest rate protection increment
Per-WebSocket signaling budget 120 messages/60 seconds, policy close 1008 committed a09c6d58; regression contract abe0fcfe. Full exact-head 4+4 and Modular QA, two-device testing and hosted infrastructure not yet verified. Do not promote before green CI.

## Next smallest action
Check latest exact dev SHA and Modular/Full 4 Node+4 Chromium CI, repair regressions without stopping further increments. Verify protected main promotion and Pages hosted hashes separately. Next feature: two-client LAN reconnect/approval and Player Studio/tricks/graphics.

## Ownership and exclusions
Only sole developer edits this checkpoint. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saved-game compatibility.

## Evidence
Isolated Node v22.16.0 behavioral helper tests 3/3 PASS, source parsed. Added fourth wiring contract test in repository, not yet locally executed against full checkout. GitHub connector writes succeeded; local git remote DNS unavailable. Full exact-head CI, two-device LAN, graphics QA, hosted byte smoke and promotion of this candidate are pending verification.

## Cleanup
Continue hourly development, investigate blockers, promote only exact green dev via protected workflow. Checkpoint stays below 4 KiB.
