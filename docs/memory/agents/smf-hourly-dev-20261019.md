# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 00:06 CET

## Mission
Sole developer. Continue a bounded tested feature each run on existing dev regardless of release queue; only dev/main, no force push or protection bypass. Preserve 223 teams/2676 players, six formations, exactly four controls, Career/Cup 10 slots, SD09, saves and offline.

## Current checkpoint
- Starting dev/main `45dd7a13b6a1f756c573b5c9fed85e3318e062ec` (PR #57 merged 2026-10-27 23:06 UTC). Prior SHA passed Full 4 Node + 4 Chromium #40599258942 and Modular #40599258872; main/Pages hosted bytes and physical two-client certification require independent checks.
- LAN-073 implemented on dev: reset host held buttons and frozen-phase dedupe after RTC readiness loss, including fast false→true transitions between frames; reconnected guest gets paused/finished snapshot without physics, and new Jump press is not swallowed. Two focused tests committed. Candidate 0.11.4.15 metadata/package/README/SW/version contract updated. New exact-head CI not yet certified.
- Pending: inspect current-head workflows, protected PR merge, Pages hosted byte smoke, Render broker health and two physical phones. Do not claim QA or deployment prematurely.

## Next smallest action
1. Verify exact-head 4 Node + 4 Chromium, Modular and focused LAN-073 tests; repair failures on dev.
2. Promote only fully green unchanged dev through protected PR, verify main exact SHA.
3. Verify GitHub Pages deployment and hosted HTML/JS/CSS byte checks.
4. Exercise two phones for LAN/P2P discovery, consent, input edges, pause/resume, graphics; distinguish emulator from physical proof.
5. Implement next small Player Studio, counterable four-button Trick or directional-art improvement on dev even if release waits.

## Ownership and exclusions
Only own checkpoint; no edits to other agents' memories. No new branches, force pushes, bypassed security/CI, false device or deployment claims.

## Evidence
Source and Node regression committed; full exact-head CI pending. Previously certified green checks belong to prior SHA only. Preserve current dev head and continue hourly development.

## Cleanup
No unmerged branch cleanup; only dev/main are allowed. Keep the hourly cadence and retry exact-head QA and protected promotion.
