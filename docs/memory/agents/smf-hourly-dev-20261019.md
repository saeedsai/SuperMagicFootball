# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-30

## Mission
Develop only on existing `dev`; never create branches, force-push, bypass CI or manually change `main`. Preserve 223 teams/2676 players, six formations, Pass/Shoot/Dribble/Jump, ten Career/Cup slots, SD09, saves/offline and LAN/P2P.

## Current checkpoint
- **0.12.8.0 JUMPING-STAT-01:** Added canonical `jumping` numeric attribute to mechanics; `STATS.withStats` infers it deterministically from overall rating, respecting existing overrides. Single/double jump velocity scales by sqrt(.30+.70*(jumping-1)/99). Rating 100 retains original 420/535 impulses and 14-unit double-jump boost. Jump fatigue multiplier `1+(100-jumping)/100`.
- **2026-10-30 fatigue correction:** `FITNESS.actionFatigue` formerly capped all multipliers at 1.5, flattening jump costs at ratings 1–50. Jump now permits up to 2.0; other actions remain capped at 1.5. New `tests/jumping_fatigue_real.test.cjs` tests the real engine spendStamina path and fitness function. Seven focused tests passed in a **locally mirrored subset**, not the full repository. Exact-head CI, Chromium, Modular QA, and hosted bytes remain unverified.
- Earlier: 0.12.7.0 Career slot rename; Player Studio gallery selection/keyboard; eight-view mirror fallback. Independently authored live art remains incomplete.

## Next smallest action
1. Obtain exact-head 4 Node + 4 Chromium + Modular QA and repair failures.
2. Check all 2676 players, legacy save imports and Jumping editor display.
3. Integrate original eight-direction art into live renderer.
4. Implement counterable Magic Trick, keeper improvements and Career progression.
5. Promote only exact green dev through protected main; verify Pages hosted bytes.

## Ownership and exclusions
Sole developer. Do not read other agents' memory or resume routine LAN/P2P. Physical two-phone #48 remains open; Render auto-deploy drift #86 and main protection #87 remain open.

## Evidence
Local `git ls-remote` failed DNS: `Could not resolve host: github.com`. GitHub connector can commit using fresh blob SHAs, but combined commit statuses and PR-only workflow lookup did not establish green exact-head CI. Render service autoDeploy=yes, trigger=commit, latest listed deployment API-triggered at 2026-10-29 02:02 UTC for LAN-094. No main promotion attempted.

## Cleanup
Keep this file under 4KiB and shared memory under 6KiB; preserve full history in development log and GitHub commits.
