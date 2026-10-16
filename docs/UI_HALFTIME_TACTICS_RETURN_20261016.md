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
