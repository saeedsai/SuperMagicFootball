# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-18

## Mission
Implement tested gameplay, counterable four-action Magic Tricks, Player Studio usability, existing-player eight-view graphics, keeper/Career. Preserve 223 teams/2676 players, six formations, Pass/Shoot/Dribble/Jump, ten Career/Cup slots, SD09, saves and offline.

## Current checkpoint
- Candidate .82 bounds forward ball-carrier auto-targeting by poke/slide reach; focused regression committed, exact-head CI pending.
- Candidate .81 receiver lateral-run pass safety implemented with focused regression; exact-head QA pending.
- Candidate .80 directed passing forward-moving receiver bonus implemented; focused regression added, CI pending.
- Candidate .79 pass-crossing timing guard committed for real directed passing; exact-head QA pending.
- Candidate .78 forward-facing tackle and slide target selection in production engine; focused regression committed; exact-head CI and release pending.
- Candidate .77 counts a fast defender sweeping completely across the pass lane; focused test added. Fixed .76 stale offline cache suffix (3 confirmed CI failures). Exact-head QA pending.
- Candidate .76 scales bounded defender movement prediction to pass length; game source and focused regression committed. QA/release pending.
- Candidate .75 counts defenders near the ends of a directed pass lane; focused Node regression added. CI and release gates unverified.
- Candidate .74 adds bounded secondary-defender directed passing pressure and focused regression; exact-head QA unverified.
- New .73 moving-defender directed-pass source and focused regression committed on dev; exact-head QA pending.
- Base `main`/`dev` 830f071a passed 18 Nov Census/Modular QA/Pages.
- New player-facing gameplay candidate 0.12.81.72 in `f44c4f37`: directed field and goalkeeper PASS now prefers an aligned open teammate to a tightly marked one. Focused `tests/directed_pass_lane.test.cjs` added; no controls, ball physics, saves, roster or Breath changes.
- New Full Census 44255879322 failed preflight on five release contract checks: README heading and offline sw cache suffix remained 0.12.81.71. This follow-up corrects heading, cache suffix, AGENTS current-version pointer, and records the failure in backlog. Pending exact-head CI.
- Breath .66–.68 cheap carry/expensive sprint/walking recovery and selected local-human ring already implemented/tested. No physical two-phone certification; #48/#86/#87 remain open.

## Next smallest action
1. Verify four Node/four Chromium Census and Modular QA at the newest dev SHA; fix all failures.
2. Confirm CI-gated main promotion, main regression, Pages deployment and hosted bytes independently.
3. Next gameplay increment: four-button Trick counters or goalkeeper quality with focused regression.
4. Advance original existing-player eight-view frames using Asset Studio and game-scale screenshots; then Career UI.
5. Investigate Render trigger drift without routine LAN changes and escalate main ruleset #87.

## Ownership and exclusions
Only own checkpoint. Do not create branches, force-push, bypass CI, change roster, certify hardware, or create concept heroes.

## Evidence
GitHub Full Census 44255879322 logs; preflight failure verified. New exact-head QA pending; no local checkout/Node or physical test claimed.

## Cleanup
No scratch branches, under 4KiB.
