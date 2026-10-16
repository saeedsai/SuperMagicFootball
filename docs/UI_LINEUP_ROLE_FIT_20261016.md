# UI lineup natural-role fit — bounded feature and handover (16 October 2026)

## Ownership and source checkpoint
- **UI feature:** `UI-LINEUP-ROLE-FIT`, `ui-controls` lock. Session `ui-lineup-fit-20261016-1329-gpt6`.
- **Workflow path triggers:** `UI-LINEUP-ROLE-FIT-CI`, separate `release-infra` lock, same session.
- Based on latest concurrent `dev`, starting at `3face2973f4ae66e2576647425308968ea3312f3`.
- **Owned files only:** `src/modules/ui.js`; `tests/lineup_role_fit.test.cjs`; `tests/lineup_role_fit_browser_qa.py`; the push-path list in `.github/workflows/full-regression-census.yml`; this document and `docs/NEXT_MILESTONES.md`. No gameplay engine, art, player data, save keys, PWA cache or other QA harness changes.

## Requirement: explain whether selected starters fit assigned positions
The Team Command Center already calculates **position OVR**, but it did not tell the coach whether the actual player has their *natural* GK/DF/MF/FW role at that slot. A user could accidentally place a FW at DF or assign a midfielder to an attacker slot with no explicit explanation.

**Delivered:** a live, accessible `LINEUP FIT n/6 natural roles` message directly beneath the six lineup selectors. All six current formation positions are checked against the selected player's actual `role`; each mismatch reports the slot, assigned position, player name, natural role and position-specific OVR. A matching lineup says everyone fits their natural role. The role hint updates when either one of the six selected players changes or one of six permitted formations is selected; `role=status`, `aria-live=polite` makes changes readable to assistive technologies. Messages are generated from text and assigned using `textContent` so unknown names do not inject HTML. The guidance is **read-only**, with an explicit reminder that `SAVE TACTICS` is still required to apply changes.

The feature deliberately does **not** change the real team plan, block versatile player selections, pick a best lineup automatically, change positions or stats, consume a substitution, alter save formats or remap the four gameplay buttons.

## Regression and browser acceptance
- New `tests/lineup_role_fit.test.cjs` contracts guarantee pure guidance and correct redraw hooks.
- New `tests/lineup_role_fit_browser_qa.py` opens the **actual modular playable fixture** in desktop Chromium and simulated mobile touch. It navigates Quick Match → Team Tactics → Home Team, checks the six lineup slots, selects a genuinely out-of-role MF/FW for DF and confirms the label updates, then changes formation and verifies another update. It restores selections and confirms `legend_teamPlans`, the live game plan, four gameplay buttons and browser errors remain unchanged.
- `.github/workflows/full-regression-census.yml` previously omitted `src/modules/ui.js` from push triggers. It now triggers on this UI module and these two new test scripts. Shard logic and existing CI steps are untouched.
- Full regression and hosted public desktop/touch smoke must be evaluated on **exact integrated SHAs**. Do not mark pending or cancelled runs as PASS.

## Related issue and source safety
- [Issue #1](https://github.com/saeedsai/SuperMagicFootball/issues/1) concerned an inherited ambiguous Back selector in the substitution advice test. An earlier agent already changed the test locator; this batch did not overwrite their correction.
- All other agents' concept art, roster metadata, graphic state and toolchain commits are preserved. Existing `.gitignore` excludes build fixtures, `__pycache__` and `node_modules`. Do not remove old reports/tests/assets without tracing CI and provenance dependencies.
- Physical Android/iOS, actual device accessibility verification, Safari/Firefox and offline install persistence remain owner-deferred.

## Next five small iterations
1. Recheck exact full browser census / issue #1 and resolve any independently reproducible control-test failures with proper claim ownership.
2. Seed-calibrate goalkeeper actual side/corner saves and nonlinear Super Shots after the capped movement patch.
3. Coordinate eight-view goalkeeper glove holding and release art within the graphics-renderer lock.
4. Improve reception and directional pass follow-through animation and provenance guards, separating UI/art/data ownership.
5. Add context-sensitive halftime coaching and substitution suitability suggestions without altering stored lineup data automatically.

## Final acceptance and release
Update with exact CI run numbers, totals, browser smoke and SHA before releasing both ownership claims. A future agent should start by rereading `AGENTS.md`, `docs/agent_coordination/README.md` and live claims.
