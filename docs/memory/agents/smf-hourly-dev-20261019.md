# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-29

## Mission
Sole incremental developer directly on existing `dev`. No extra branches, force pushes, security/CI bypass or manual `main` edits. Preserve 223 teams/2676 players, six formations, Pass/Shoot/Dribble/Jump only, ten Career/Cup slots, SD09, offline saves and LAN/P2P.

## Current checkpoint
- **EIGHT-VIEW-MIRROR-FALLBACK-01 (non-player-facing):** opt-in mirrored frame fallback for sparse eight-view packs, with exact-facing priority, no front/back reflection, immutable selection and safe generic idle. Also fixed cross-realm Set/Map recognition in both resolvers and guarded spoofed catalog tags. Source commits 93a7655f, 73b847c3, 339e67b3; tests 8d2e8c30, 60b97ffa, 84ef28d3. Seven committed regressions; isolated mirrored tests 5/5, cross-realm 2/2. Exact-head repository CI and renderer integration pending; no version bump.

- **0.12.7.0 CAREER-SLOT-RENAME-01:** Career slot menu now offers RENAME; `careerSlots.rename(n,name)` preserves original `savedAt`, active selection, career payload and 10-slot vault, rejects blank/nontext names, avoids no-op writes and rolls back in-memory state if storage fails. UI uses cancelable prompt. Commits: 10a805b8, 11601fd1.
- Regression: c800de80 and f9cc4948; seven committed tests including UI wiring. Six isolated Node tests passed on manually mirrored slot module; module syntax checked. Actual repository test file, 4 Node + 4 Chromium, Modular QA not run due GitHub clone DNS failure. Green CI not established.
- About/package/README heading and banner/SW cache/policy/roadmap/shared memory updated to 0.12.7.0. Development log commit 250bca65. No main promotion or Pages byte verification.
- Prior 0.12.6.0 gallery keyboard navigation, 0.12.5.0 selectable views and 0.12.4.0 motion-phase scrubber remain. Independently authored eight-view art not yet integrated into live renderer.

## Next smallest action
1. Run exact-head focused + four Node/four Chromium + Modular QA and repair any observed failures.
2. Integrate original eight-view directional action art into live renderer, inspect orientation #15.
3. Add counterable Magic Trick gameplay using only the four established buttons.
4. Improve goalkeeper catch/dive visuals and Career progression.
5. Promote only exact green dev via protected main pipeline; verify Pages bytes and hosted smoke.

## Ownership and exclusions
Sole developer; no other agents' private memory. Stop routine LAN/P2P implementation. Physical two-phone #48, Render commit-trigger drift #86 and main protection #87 remain open; no physical certification.

## Evidence
Before this increment main SHA `93af332189be3856025d90d2f9eb6b1466d09121`, dev SHA `4579d01a9926fecdb5e73111724c78e18642f837` (46 ahead). Local git ls-remote failed: `Could not resolve host: github.com`; GitHub PR-only workflow lookup and commit statuses empty. Exact current heads and CI must be rechecked next run.

## Cleanup
Keep own checkpoint under 4KiB, shared memory under 6KiB and detailed history in development log.

## Latest checkpoint — JUMPING-STAT-01 (2026-10-29)
0.12.8.0 dev candidate: canonical Jumping 1–100 via mechanics numericStats; STATS.withStats defaults to overall rating, preserving edited values and legacy saves. Engine single/double jumps scale impulse sqrt(.30+.70*(jumping-1)/99); at 100 retain 420/535 and 14 lift. Jump stamina multiplier 1+(100-jumping)/100. Tests: tests/jumping_stat.test.cjs committed, full CI not verified. Next: run tests, check 223/2676 data and save migration, QA, only green main promotion.
