# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-13

## Mission
Deliver small tested increments on existing dev. Preserve 223 teams/2676 players, six formations, four actions, offline saves, Career/Cup ten slots, SD09 and LAN-094.

## Current checkpoint
- Candidate 0.12.81.69 is the installed About-only version. Earlier .66–.68 tuned cheap normal ball carry, expensive sprint, idle/walk recovery, and selected-local-human-only Breath ring.
- At run start dev/main both `0dc02bde302f3a5b7b15d345c854671c61edc3ad`. Exact-dev Census 43355852147 and Modular QA 43355852157 passed; main Census 43356864998 and Pages 43356864592 passed. This does not certify later changes.
- Physical two-phone LAN issue #48 is open. Render auto-deploy #86 remains under investigation. Main branch protection #87 absent; do not bypass it.
- This increment extends desktop and simulated-touch production-renderer Breath regression to revoke the local guest seat mid-frame and restore it. Both teams must hide all rings on revocation; only the selected guest regains a ring on reassignment. Stale controlled flags are intentionally preserved. No runtime/version change.

## Next smallest action
1. Verify new exact-head focused Chromium, four Node/four Chromium Census and Modular QA; fix failures.
2. Protect main and promote only through approved pipeline; verify Pages hosted bytes.
3. Implement Player Studio usability with tests, then counterable four-action Magic Tricks.
4. Continue existing-player eight-view art with Studio source and visual acceptance.
5. Improve goalkeeper and Career; investigate Render #86 without routine LAN implementation.

## Ownership and exclusions
Only this checkpoint. Never create branches, force push, alter others' memory, or claim physical LAN acceptance without device evidence.

## Evidence
At start: exact-head dev [Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/43355852147), [Modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/43355852157), and main [Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/43356864998) passed. New regression not locally executed: GitHub connector provides source writes but no executable checkout. Await exact-head CI.

## Cleanup
Keep checkpoint below 4 KiB and recurring development active.
