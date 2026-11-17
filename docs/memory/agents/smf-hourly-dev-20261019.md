# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-17 06:00 CET

## Mission
Prioritize Player Studio, counterable Pass/Shoot/Dribble/Jump Magic Tricks, existing-player eight-view graphics, goalkeeper and Career. Preserve 223 teams, 2676 players, six formations, offline/saves, Career/Cup ten slots and SD09.

## Current checkpoint
- Started dev `0eebd797221e7fc3e4758091360f8c00b54ad6bc`, main `d48a59e087d2dd1531a94ec63bf43853c3b741f6`.
- Exact-head Census 44014158119 and Modular QA 44014157017 failed Node preflight; Chromium shards skipped. The diagnostic test asserted incompatible adjacency after `except Exception:`: comment first in one assertion, print first in the other.
- Updated the second assertion to require preservation comment then phase print, retaining rethrow and peer diagnostics (`ea2dafc`). Backlog updated (`3cfa8c7`). No gameplay changes, no version bump; 0.12.81.71.
- Breath low-drain carry/high-drain sprint, walking recovery and selected-local-human-only ring previously implemented; physical phones #48 unverified.

## Next smallest action
1. Verify exact-head focused Node, four Node/four Chromium Census and Modular QA; repair any failures.
2. Deliver a bounded player-facing Player Studio or Magic Trick counterplay feature with regressions.
3. Improve existing-player directional graphics using Studio-backed workflow and actual game-scale review.
4. Improve goalkeeper/Career with save-safe tests.
5. Promote only green exact dev head through protected pipeline; verify Pages bytes; monitor Render #86 and protection #87.

## Ownership and exclusions
Only own checkpoint; no new branches, force pushes, bypass, roster churn, concept heroes or unapproved art.

## Evidence
GitHub CI failures verified; contract assertion corrected on dev. Local checkout/test blocked by github.com DNS. New exact-head CI, promotion, hosted bytes not yet verified.

## Cleanup
Under 4KiB; no temporary branches.
