# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-08

## Mission
Bite-sized tested improvements on dev. Preserve 223 teams, 2676 players, six formations, four action buttons, offline, saves, Career/Cup ten slots and SD09.

## Current checkpoint
- 0.12.81.66 BREATH-DRIBBLE-LOW-DRAIN-01: exact-head Census 42461371337 and Modular QA 42461371542 failed two real-FITNESS low-Stamina carry assertions. At Stamina 1 ordinary movement .144/s + held Dribble .20/s = .344/s; too expensive relative to 3-second cap.
- Lowered held-dribble cost to .04–.07/s (minimum-Stamina combined .214/s). Sprint, one-off action costs, walking/idle recovery, Energy and ownership remain unchanged. Added focused walking-recovery test.
- Mathematical replay of failing assertions passed at four Stamina levels and 30/60/120 FPS; complete repository QA and exact-head certification pending.

- CI follow-up: initial 0.12.81.66 exact-head Census 42473072679 / Modular QA 42473072658 found one stale hard-coded .12–.20/s hold-rate assertion in tests/breath_hud_dribble.test.cjs. Updated it for the new positive .04–.07/s range; tests must run again.

## Next smallest action
Verify new exact-head GitHub Actions, fix failures, test locally selected human-only ring in Chromium, and release only after protected promotion and hosted Pages byte verification. Then advance Player Studio, counterable four-button Magic Tricks, eight-view art, keeper and Career.

## Ownership and exclusions
Edit only this checkpoint. Never create branches, force-push or bypass CI. Physical LAN #48 unverified; Render #86 and branch protection #87 open.

## Evidence
Failed CI logs show combined carry cost .688 in two seconds at minimum Stamina versus .428 after proposed fix; container Git checkout DNS unavailable. No new full Node/Chromium green claim.

## Cleanup
Below 4 KiB; keep release gates distinct from calculations.
