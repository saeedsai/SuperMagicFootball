# One-tap live match tactical calls — gameplay feature handover
Date: 16 October 2026. Exclusive lock: `ui-controls`; owner: `ui-quick-match-tactics-20261016-gpt6-s13`.
Feature ID `UI-QUICK-LIVE-TACTICAL-CALLS`; request tracked in [GitHub issue #4](https://github.com/saeedsai/SuperMagicFootball/issues/4).

## Player-facing feature
During an actual Quick Match or local 2-player Versus match, opening **PAUSED** or **HALF TIME** now offers four optional **QUICK TACTICS** calls. These immediately apply pre-existing tactical gameplay mechanics without navigating the full six-player Team Command Center:

| Quick call | Attack style | Defence style | Engine mechanic |
|---|---|---|---|
| ⚔ ATTACK | Direct | High Press | AI advances/shoots more, challenges ball carrier at greater pressing intensity |
| ⚽ CONTROL | Possession | Balanced | AI favors passing and patient advance |
| 🛡 PROTECT LEAD | Possession | Deep Block | Ball retention plus deeper defensive positioning |
| ↺ BALANCED | Balanced | Balanced | Clears only the two temporary live style choices |

The implementation is **not a graphic mockup**: clicking the action calls the real `game.applyPlan(side,{...current,attack,defence})` while gameplay is paused. `tacticModifiers` in the real `src/modules/tactics.js` is already consumed in `GameEngine.driveAI`; no new AI engine/physics formula was necessary. The player controls remain exactly **Pass / Shoot / Dribble / Jump**, with no fifth action button.

**Mode and ownership guards:** side 0 is available in one-human matches, and in two-human Versus there are separate home and away controls. Away cannot be changed by the one-human player. Calls are refused outside `PAUSED`/`HALF TIME`, if the engine isn't paused, or if the plan is absent. Clicking shows the active Attack/Defence combination, a concise toast, and returns to the same Pause/Half-Time screen. The halftime team-talk opportunity remains.

**Save/lineup invariants:** changes are **match-only**. They preserve the exact existing formation, six selected starters, captain, penalty/free-kick/corner roles, substitution allowance, score, player identities and user-selected pre-match tactics saved in `legend_teamPlans`. No `store.put('teamPlans',...)` or `localStorage.setItem` occurs in quick calls. To save pregame tactics permanently, users still use the existing explicit Team Command Center `SAVE TACTICS` action. The engine's existing `applyPlan` may emit a `substitution` event with `count:0` for a style-only change; potential telemetry classification is mentioned in issue #4 and belongs to a future `gameplay-engine` owner, not this UI claim.

## Narrow owned files
- `src/modules/ui.js`: in-match tactical options, Pause + Half Time menus and safe action handler.
- `tests/quick_live_tactics.test.cjs`: isolated behavior test with real helper code executed in a VM, checks four mappings, human-only/paused-only guards, no save writes and unchanged plan fields.
- `tests/quick_live_tactics_browser_qa.py`: real playable modular game, desktop Chromium and simulated touch, one-player Quick Match and two-human Versus. Tests all four tactical calls, displayed live styles, unchanged lineup/formation/substitution usage/score/team talk and local storage, plus return to Half Time. Requires `python3 scripts/build.py` fixture build and Playwright Chromium in the GitHub regression workflow.
- This feature handover and a concise milestone addendum, with fresh `dev` claim checks.

**No other agent's scope touched:** engine, input/touch controls (concurrent dribble fixes), procedural/concept art, graphics source/rig, rosters, CI/release workflows, cache service worker, build scripts or common QA framework. Historical QA scripts and source assets are intentionally retained.

## Verification / discovered test issue
The first new Node test had a false positive: its no-storage-write regex matched a **comment mentioning** `localStorage` even though the gameplay function never wrote to storage. The assertion was corrected to detect `localStorage.setItem/removeItem/clear` **calls**, not text. [Modular Game Dev QA on fix commit `4f3b2785`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38906157809) **SUCCESS**, confirming source/test contract green. Code feature commit: [`c6627fb8`](https://github.com/saeedsai/SuperMagicFootball/commit/c6627fb8cd1884e4da571a1121f09c89d5ab313e).
A full regression after the browser test was committed must be checked for all four Node + four Chromium shards before claiming total historical acceptance. GitHub Pages smoke should be reported separately for desktop and simulated touch; neither proves physical iOS/Android compatibility.

## Next five small iterations
1. Finish exact integrated 4+4-shard Node/Chromium certification for this new feature and public desktop/touch smoke; triage any failing script without modifying foreign ownership.
2. Under released gameplay-engine ownership, distinguish real substitutions from zero-sub tactical changes in telemetry without impacting counts or saved games.
3. Extend real gameplay mechanics via pressure-aware first-touch cushioning on teammate pass reception, short capped duration and no keeper/shoot effects (requires separate engine claim).
4. Progress receiver/pass follow-through and eight-direction goalkeeper glove/catch-release animation under graphics claim, preserving fallback visuals.
5. Review physics save/goal balance and organic Super Shots, then expand halftime coaching/career tactics with isolated owner claims. Physical device, offline/PWA install and multiplayer remain larger deferred requirements.

**Owner release rule:** after QA and handover, mark the `ui-controls` claim `released` with source SHA and evidence. Check fresh `dev` first; other agents are pushing concurrently.

## Final exact-source certification and hosted gameplay — 16 October 2026

**Implementation/source+tests checkpoint:** [`afec2a6ab03add1f890f90fd8842edb7a72ae74d`](https://github.com/saeedsai/SuperMagicFootball/commit/afec2a6ab03add1f890f90fd8842edb7a72ae74d). This follows source commit `c6627fb8`, new tests `f926bf47` and `b1b4527f`, and corrects the static-test comment false positive in `4f3b2785`. All later commits before this handover are documentation or other agent-owned changes; no conflicts with the UI feature.

- [Full Regression Census #38906811431](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38906811431) **COMPLETED SUCCESS** on this exact SHA: **preflight PASS; four Node shards each 31 PASS, 124/124 total; four Chromium shards 17+17+16+16 = 66/66 PASS; aggregate 190/190 executable scripts PASS**, zero FAIL, ERROR, TIMEOUT or NOT_RUN. `quick_live_tactics.test.cjs` passed in Node shard 2, `quick_live_tactics_browser_qa.py` passed in Chromium shard 2 in **13.58 seconds**, verifying real desktop and simulated-touch one-/two-human match flows.
- [Modular Game Dev QA #38906813074](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38906813074) **SUCCESS** on the same source. Full historical game mechanics, rosters, control buttons and club data are exercised by the inherited census.
- [GitHub Pages deployment #38906954269](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38906954269) **SUCCESS**, containing this feature plus the roadmap-only checkpoint. Public URL: https://saeedsai.github.io/SuperMagicFootball/.
- [Fresh hosted desktop/simulated-touch smoke #38891468528 attempt 10](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS** after Pages deployment: HTTP 200, menus, team selection, kickoff, extended +20% field and live active match in both Chromium contexts (224 teams).
- [GitHub feature issue #4](https://github.com/saeedsai/SuperMagicFootball/issues/4) is complete; it can be closed. [Separate engine follow-up issue #7](https://github.com/saeedsai/SuperMagicFootball/issues/7) records the older zero-count `substitution` event emitted during valid style-only `applyPlan` changes, without implying substitution quota changes or editing another agent's active engine claim.
- **Cleanup audit:** current GitHub tree contains no tracked `__pycache__`, `.generated`, `node_modules`, Playwright reports, `.pyc`, `.bak`, `.swp` or `.tmp` files. Tests, source art, historical QA and roster provenance remain retained because they are dependent references.

**Outcome:** feature and tests implemented, playable on desktop and browser touch, accepted by the complete exact-code regression. Exclusive `ui-controls` lock is ready to release with this handover; the latest `dev` must be checked again at release time. Remaining deferred: real handset QA, browser/PWA offline/reinstall/restart, network multiplayer and new engine-only mechanic iterations.
