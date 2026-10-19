# Manager Career — pre-match natural-position role-fit forecast

**Date:** 19 October 2026  
**Feature:** `UI-CAREER-LINEUP-ROLE-FIT`  
**Scope/lock:** `ui-controls` (`gameplay-review-20261019-gpt6-role-fit-r10`)

## Problem

The Manager Career fixture page had a projected-six opponent scout and fitness/bench recommendations but did not tell the player when their own selected starters are deployed outside their natural role. The Team Command Center's separate formation-fit indicator was not visible from the Manager hub before pressing Play Next Match.

## Delivered

The existing **NEXT OPPONENT SCOUT** now includes a compact **STARTING SIX · ROLE FIT X/6** preview based on the actual saved plan `planFor(c.club).lineup`, the live twelve-player career roster, and the game's fixed six role slots `GK/DF/DF/MF/FW/FW`.

- An all-natural lineup reports `ROLE FIT: 6/6`; no unnecessary substitution is suggested.
- A mismatched starter shows the actual slot, name, assigned position and natural role. Only a **non-starting, non-injured, at least 60% fit reserve** with the required role may be suggested.
- Among match-ready reserves, rank by higher fitness, then positional OVR, then original roster index. Never recommend the same reserve twice.
- When no suitable player exists, explain it. Show up to three detailed warnings and count additional mismatches.
- Malformed/duplicate/invalid six-player plans fail closed; untrusted dynamic names/roles are HTML-escaped.
- **Advisory only.** No lineup edits, plan writes, localStorage writes, transfer fees, fake player identities, save migration or fifth gameplay button. Gameplay engine physics and formation selection remain untouched.

## Implementation and acceptance

| File | Purpose |
|---|---|
| `src/modules/ui.js` | Pure `careerLineupRoleFitPanel(c)` alongside prior opponent scouting and bench readiness |
| `tests/career_role_fit.test.cjs` | Ten real-source VM tests for 6/6, true role, healthy bench, exclusions, uniqueness, ranking, XSS, invalid saves, caps and purity |
| `tests/career_role_fit_browser_qa.py` | Real desktop and simulated-touch Manager Career creation, misassigned DF, healthy reserve, repeated navigation with no save/plan change and real kickoff |
| `tests/career_opponent_scout.test.cjs` | Existing isolated scout VM injects new independent read-only panel mock |
| `tests/about_revision_browser_qa.py` | Fix a **prior change made by this chat**: browser acceptance expected the obsolete `dev @` link text, now correctly asserts `v0.8.25.32-integrated+dev.<SHA>` |

## Verification and restrictions

- Node regression is run automatically by **Modular Game Dev QA**. Exact [#39223858761](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39223858761) reported **294/294 passing Node tests**, including the 10 new role-fit cases and mandatory About version tests.
- [Full Census #39212131199](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39212131199), **before this feature**, had four Node shards green and one failing browser test in `about_revision_browser_qa.py`: it expected the obsolete text from this chat's previous About update. The new browser test assertion fixes that regression. The current feature still requires **a new 4+4 census on a descendant SHA**; do not borrow an earlier run.
- Real handset, exact deployed Pages feature, and offline persistence are **not** certified by test presence. GitHub Pages currently publishes `main`, and a commit on `dev` is not itself proof of deployment.
- [Keeper roll #38](https://github.com/saeedsai/SuperMagicFootball/issues/38) belongs to a separate prior gameplay-engine owner and is intentionally untouched.
- Save identities (twelve players and stable IDs), four action buttons, the About per-commit SHA and stable `GAME BUNDLE` release number all remain protected.

## Next five bounded iterations

1. Full 4 Node + 4 Chromium regression and actual desktop/touch role-fit browser acceptance; fix only our scope.
2. Opt-in manual Career starting-six swaps from eligible reserves, with explicit confirmation, canonical plan persistence and limits.
3. Exact deployed/offline build-SHA identification in About, under coordinated `ui-controls` + `release-infra` locks (issue #12).
4. Reproduce current Android rainbow-dribble double-tap issue #3 in repeated emulation and physical handset; fix only with the appropriate input/engine lock.
5. Advance original competition/mode parity and goalkeeper/pass animation under their respective claims; source-check saved team/roster compatibility.
