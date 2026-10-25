# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 12:07 CET

## Mission
One bounded tested dev increment hourly regardless of release blockers. Only dev/main; protected exact-green promotion. No security bypass or force push.

## Current checkpoint
Before change dev=9801cbe054129336d88202c5a4c3d4240f049f42; main=fd56cddd03c749c5cfd7274aaea0600384b56acd; dev 16 ahead / 0 behind. This dev commit integrates the existing LAN room selector with live TTL-pruned discovery through `joinableRooms(search)`; excludes own/full rooms and respects occupancy, search, expiry and close. No UI/signaling integration yet. About-only candidate 0.9.41.9 unchanged.

## Next smallest action
Implement trusted LAN-scoped discovery/signaling (issue #48), authenticated host approval and safe unavailable-service UX. Continue compatible dev increments while exact-head release checks run.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019. Do not read/write other agents' memory. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline/save compatibility. No direct main writes or new branches.

## Evidence
2026-10-25 CI failure root cause: dev 9801cbe Full Regression Census #40183086173 and Modular QA #40183086171 each had 718/719 Node tests pass; `tests/project_memory_contract.test.cjs` failed because this checkpoint lacked `## Next smallest action`. Rewrote checkpoint with all six required sections. Local isolated Node 22 focused suite 9/9 PASS, including new live discovery selection; not a full clone (git DNS fails: `Could not resolve host: github.com`). New exact-head full 4 Node + 4 Chromium, Modular QA, Pages byte smoke and physical two-client/graphics QA remain unverified until GitHub workflows complete.

## Cleanup
Updated central dev log. Keep checkpoint <4KiB and continue hourly; inspect latest workflow jobs and repair any new failures. Do not claim deployment without main and hosted hash verification.

## 2026-10-25 — duplicate room cards
Dev source 80d78ea, test 03e68a0, log 4550101. Selector deduplicates room IDs. Not wired into game UI, no version bump. Tests not run this execution, full CI/main/Pages not verified. Next secure transport, UI, two-device QA, protected promotion.

## 2026-10-25 — protocol identity fix
Dev source 3cccb96, test 3db5426, log fb3221e. Explicit protocol metadata cannot be overridden by fields. Tests added, not executed this run; full exact-head CI, graphics/gameplay QA and main/Pages not verified. Continue secure LAN transport and UI, then protected promotion.
