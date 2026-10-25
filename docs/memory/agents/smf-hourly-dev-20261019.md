# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 10:01 CET

## Mission
One bounded tested increment per hourly run directly on existing dev, even with pending CI/promotion. Only dev and main; no force push or security bypass.

## Current checkpoint
Starting dev `3247e00a2d81a1fadaf74e46cacc54e89eed0e5a`, main `f4a71836a109fc85efaaee78836024731e3f43be`; four commits ahead. LAN-059 adds host join queue replay protection and bounded pending IDs. About-only 0.9.41.9 candidate. Issue #48 requests Create Game → Find Games → Join → host Accept/Reject without manual signaling; secure same-LAN discovery transport and UI not implemented.

## Next smallest action
CI root cause found: dev Modular #40175356132 and Full #40175356116 each failed one of 705 Node tests: project_memory_contract requires exact `**Agent ID:**` and six section headings. Previous checkpoint rewrite removed those fields. Restore this contract, verify exact-head CI, then implement one independent LAN increment without blocking hourly progress.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019. Do not read/edit other agents' memory. No new branches, force pushes, bypasses or premature main promotions. Preserve 223 teams/2676 players, six formations, four actions, 10 Career/Cup slots, SD09, offline/save compatibility. Player-facing changes require synchronized version, README, release notes and SW cache.

## Evidence
Failure logs from exact head: Modular 704 pass/1 fail and Full preflight 704 pass/1 fail; other jobs skipped. GitHub refs verified. Previous LAN-059 focused 4/4 Node and 8/8 V8 assertions reported in prior checkpoint; full suite was red. Fix changes metadata only and does not claim gameplay certification.

## Cleanup
Next five: (1) verify memory CI repair, (2) secure discovery/signaling design, (3) host approval and room browser UI, (4) two-client LAN/graphics QA, (5) protected green exact-head promotion + hosted Pages byte smoke. Keep checkpoint <4KiB.
