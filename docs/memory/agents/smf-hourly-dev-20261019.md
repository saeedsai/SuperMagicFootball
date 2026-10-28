# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 22:08 CET

## Mission
Continue bounded, tested work on existing dev only; no new branches, force pushes, CI bypass or disabled hourly development.

## Current checkpoint
- 0.11.4.41 LAN-090: host ignores delayed join-request during approved negotiation/after kickoff, and ignores post-kickoff broker error. Two-mode test preserves legitimate pre-kickoff approval and checks status/decision/transport stability. Focused LAN-090 test passed in 959-test Node preflight; exact-head full CI blocked by missing checkpoint heading, protected promotion and Pages verification pending.
- 0.11.4.40 LAN-089: post-kickoff host guest-left/host-registered isolation. Previous dev/main synchronized at 127260992415f0e9e11f096faaa214c5ff5d847f, QA and Pages previously reported green.
- Render broker auto-deploy configured for dev but has required manual API deployments; verify exact broker commit after promotion. Physical two-device discovery, approval, sprint, Jump, reconnect and mobile acceptance remains open in issue #48.
- Preserve 223 teams/2676 players, six formations, four buttons, saves/offline, Career/Cup ten slots and SD09.

## Next smallest action
1. Check LAN-090 focused test and exact-head 4 Node + 4 Chromium plus Modular QA.
2. Repair any real CI failures without weakening gates.
3. Promote exact green dev head through protected pipeline; verify main/Pages hosted bytes.
4. Verify Render revision and physical two-client acceptance; keep LAN open until certified.
5. Then prioritize Player Studio, counterable Tricks, eight-view art, gameplay and Career.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019; only own checkpoint edited. Git log is authoritative history.

## Evidence
- LAN-090 focused test passed twice; Full Regression #40769305171 and #40769410058 preflights each ran 959 Node tests, 958 passed. Remaining failure was a checkpoint heading contract, not gameplay; fixed all required headings.

## Cleanup
- Own checkpoint below 4 KiB; no other agent memory touched.
