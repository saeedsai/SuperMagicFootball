# Half-time tactics must return to half-time (UI-HALFTIME-TACTICS-RETURN)

**Date:** 16 October 2026  
**Session owner:** `ui-halftime-tactics-return-20261016-session10-gpt6`  
**Exclusive lock:** `ui-controls`

## Confirmed defect and small fix

The original playable `HALF TIME` menu offered `HOME TACTICS` and (two humans) `AWAY TACTICS`, but its Team Command Center's `BACK`, `SAVE TACTICS` and `RESTORE DEFAULT` actions always navigated to generic `PAUSED` instead of the original half-time screen. This stranded the one-time half-time team-talk controls and context-sensitive coaching even though the match was still paused at the break. Escape/Backspace within the command center also fell back to stale menu navigation rather than its explicit Back action.

The UI now records whether a live tactics editor was opened **from half-time** and routes Back, Save, Restore and Escape/Backspace to the original half-time screen. Editors opened from an ordinary active-game pause continue to return to PAUSED. Game, roster, scoreboard, stamina recovery, team-talk state, physics, save schema, arcade controls and six formations remain unchanged. Saving tactics or restoring default remains an explicit user action and still persists the existing `teamPlans` key. An ordinary Back never writes changes.

## Bounded changed files / owner exclusion

- `src/modules/ui.js`: entry-screen capture in `showSquad`, tiny `returnFromPauseTactics` route, Back/Save/Reset and keyboard Back flow.
- `tests/halftime_tactics_return.test.cjs`: five direct Node contracts: half-time/paused/playing routing, both explicit-write actions, Escape/Backspace.
- `tests/halftime_tactics_return_browser_qa.py`: actual Quick Match with desktop Chromium and simulated mobile touch; asserts half-time Back, Save, Restore, Escape preserve team-talk UI and no read-only Back side effects; ordinary pause remains distinct; four action buttons preserved.
- `docs/NEXT_MILESTONES.md`: narrow roadmap checkpoint and next five actions.

No gameplay engine, rosters (including Arsenal), graphics, QA runners, release-infra, sw.js or default saved-game format were changed. No deletion of historical tests/assets was justified: other agents depend on them. Physical iOS/Android, PWA/offline restarts, network modes and exhaustive global player reviews are still larger separate requirements.

## Release gates / handover

Source base `dev` and exact merged SHA, GitHub Modular Game Dev QA, all 4+4 Full Regression Census shards, Pages deployment, hosted desktop/sim-touch smoke and known failures must be recorded before release. If concurrent pushes cancel a run, report it explicitly rather than substituting old PASS.

## Next five small iterations

1. Complete exact-source halftime navigation Node+Chromium regression and hosted public game verification.
2. Run mirrored keeper corner and nonlinear Super Shot fatigue cohorts, tuning only with measured fair contact.
3. Advance editable keeper glove grip/release/recovery concept art with separately owned graphics.
4. Refine first-touch/pass follow-through and independently audit conflicting roster/graphics provenance.
5. Improve manager career coaching and role/substitution accessibility without migrating saves.

**Coordination:** do not overlap active release-infra national-regression trigger work or Arsenal FC27 metadata ownership. End session by releasing this lock with exact commit and CI handover.

## Integrated implementation, tests and checkpoint

- **Delivered code + tests:** [`66cf9402cbe7ed7cb0e7373f9265e1c56dfbb750`](https://github.com/saeedsai/SuperMagicFootball/commit/66cf9402cbe7ed7cb0e7373f9265e1c56dfbb750), based on latest `dev` at integration `e27deea4`. Initial push was rejected by a concurrent branch advance; rebuilt the same bounded patch on the new base and used an expected-SHA **non-force** ref update. Subsequent `dev` preserves `returnFromPauseTactics()`.
- **Exact-source active QA PASS:** [Modular Game Dev QA #38902939162](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902939162), source `66cf9402`: **116/116 Node subtests PASS**, including all 5 new half-time tactics-return contracts; **17/17 Python three-way merge tests** and **10/10 claim protocol tests PASS**, source/data and modular fixture checks successful. A descendant [active QA #38902942299](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902942299) also passed 116/116.
- **Chromium acceptance:** new `tests/halftime_tactics_return_browser_qa.py` is included in the discoverable 4-shard browser regression. Full Census [#38902939355](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902939355) on the exact feature source and [#38902942179](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902942179) on a descendant were **CANCELLED** by rapid parallel commits, so do **not** claim the new real-browser acceptance passed. Current later descendant [Full Regression Census #38903009307](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903009307) was **COMPLETED / cancelled** at this report checkpoint; review its completed four Node and four Chromium jobs and specifically `halftime_tactics_return_browser_qa.py`.
- **Hosting:** public game [SuperMagic Football](https://saeedsai.github.io/SuperMagicFootball/) already has prior **successful GitHub Pages PC/emulated-touch playable smoke** [#38891468528 attempt 5](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528), HTTP 200, 224 teams, menus, team selection, kickoff and active match. That generic smoke predates this fix. Integrated deployment [#38902942719](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38902942719) was **COMPLETED / cancelled** at checkpoint. Fresh hosted PC/touch interaction is still a follow-up gate. No physical handset, browser matrix or PWA cache/restart certification can be inferred.
- **Remaining separate gaps:** national full census CI-trigger issue #2 is owned by release-infra and current Arsenal metadata is owned by `roster-club-club26_0`; neither was touched. Device/PWA/offline resume, network multiplayer and original arcade content parity remain open. No old or template artifacts were deleted because no abandoned paths were demonstrably safe to remove while several owners continue to use graphics and historical tests.
- **Handover:** one full browser run on a later descendant containing `66cf9402`, confirm desktop/simulated touch half-time Back/Save/Reset/Escape, and retest public deployed version. Obtain a fresh claim before any further UI code edits. Release this `ui-controls` claim with this source/QA handover even if the all-shard run remains pending.
