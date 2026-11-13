# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-13

## Mission
Develop tested incremental changes on existing `dev`; preserve four actions, 223 teams, 2676 players, six formations, offline saves, Career/Cup ten slots, SD09 and physical LAN issue #48.

## Current checkpoint
- 13 Nov CI failure on exact `245836d9`: both Modular QA 43342285564 and Census 43342285638 stopped in Node memory contract with `wrong identity for smf-hourly-dev-20261019`. Restored the mandatory Agent ID header in this checkpoint, preserving all other checkpoint sections; no game code changed. New exact-head gates pending.
- Candidate 0.12.81.69: continuous arcade play and 3-second kickoff/halftime countdown; Breath low-cost normal carry, expensive sprint, walking recovery and one selected local-human ring delivered in earlier candidates.
- Verified `dev` and `main` both at `91c24a710e543eaac0436024b375623fdd6f2f50` before this increment. Exact-dev Full Regression Census 43333429037 and Modular QA 43333429076 succeeded. No main branch protection (#87); Render auto-deploy investigation #86 and physical two-phone #48 remain open.
- This run adds a focused desktop/simulated-touch Chromium regression for rapid selected-player switch-back while deliberately stale `.controlled` flags persist. It asserts only the current human selection receives Breath ring and outline; no runtime behavior or version change.

## Next smallest action
1. Inspect exact new-head four Node and four Chromium Census and Modular QA; fix any confirmed regression.
2. Do not bypass main protection or claim hosted Pages bytes without verified gates.
3. Implement Player Studio usability and counterable four-button Magic Tricks as bounded source+test increments.
4. Advance independently authored eight-view existing-player graphics with Studio and human visual review.
5. Improve goalkeeper and Career Mode; keep #48 physical acceptance and #86 Render drift separate.

## Ownership and exclusions
Only this agent checkpoint; no new branch, force push, unverified main promotion, or routine LAN work. Do not read another agent's private checkpoint.

## Evidence
Previous exact-head CI green: [Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/43333429037), [Modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/43333429076). New test must pass exact-head CI before it can be called certified. Local executable Node/Chromium QA not run in this connector-only session.

## Cleanup
Checkpoint below 4KiB. Recurring development remains enabled.
