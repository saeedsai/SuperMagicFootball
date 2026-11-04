# 0.12.34.0 integrated local QA — 2 November 2026

This report covers the working tree based on `dev` at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`, with uncommitted candidate changes. No merge, protected promotion, or hosted deployment is claimed.

## Candidate changes

- UX26 route focus now returns to the invoking Settings action and Player Studio opener after Back or Escape. Player Studio's Super Shot “Keep Current” option now declares its initial selection, preventing a false discard warning before the player makes an edit.
- SAVE-103 browser fixtures now use valid Career rosters and Cup tournament references/schedules. Startup migration is asserted against post-migration bytes; no game runtime change was needed for the fixture repairs.
- Chelsea, Borussia Dortmund, Newcastle United, Brighton, Brentford and Sporting CP extend the read-only official EA FC27 field audit to 16 clubs / 192 players. Together the reports contain 672/1,152 direct same-name field observations; 480 canonical inputs remain unresolved. No canonical roster values or tiers changed.
- No new concept graphics or Studio assets were produced or changed.

## Local gates on the current 0.12.34.0 tree

| Gate | Result | Evidence |
|---|---:|---|
| Node project suite and club roster validation | **1,555/1,555 passed**; 32 clubs / 384 player slots validated | [`node_full.log`](node_full.log) captures `npm run test:node`; it invokes the build, full `node --test tests/*.test.cjs` suite, and `tests/club26_fc27_roster.mjs`. |
| Independent Node census | **397/397 passed**; four shards, zero failures, timeouts, errors, or unrun scripts | `../qa_runs_012340_node_20261102/README.md` and four shard JSON/Markdown reports. |
| Broad portable Chromium census | **150/150 passed**; four shards, zero failures, timeouts, errors, or unrun scripts | `../qa_runs_012340_browser_20261102/` contains all four shard reports. Desktop and simulated-touch profiles are included in the browser scripts. |
| UX26 route focus regression | **10/10 focused Node assertions passed**; route matrix passed desktop and simulated touch | `tests/fix_ui_101_back_acceptance.test.cjs`, `tests/ux26_route_focus_matrix_browser_qa.py`. |
| Career/Cup backup and restart checks | Passed desktop and simulated-touch browser paths after fixing invalid/stale QA fixtures | `tests/career_backup_browser_qa.py`, `tests/career_backup_restart_browser_qa.py`, included in the 150-script census. |

## Remaining acceptance

Local tests do not replace current exact-commit GitHub CI, protected promotion, hosted Pages byte/smoke verification, real Android/iOS/touch/gamepad testing, two independent physical-client LAN loss/reconnect testing, or owner visual approval of art. Graphics remain explicitly unapproved and unchanged by this candidate. Source-tier classification still depends on verification of all six canonical game-stat inputs and mapping all 2,676 roster identities to appropriate source fields.
