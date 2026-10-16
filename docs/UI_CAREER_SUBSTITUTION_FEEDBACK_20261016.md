# UI-CAREER: paused substitution fitness recommendation

**Date:** 16 October 2026  
**Claim owner:** `ui-career-subfeedback-20261016-gpt6a`  
**Exclusive key:** `ui-controls`  
**Base:** claim created from `a41926787b914fa239cdb4c1809a9d7dc9c3567b`; recheck the newest `dev` before release.

## Delivered bounded requirement

The **Team Command Center**, when opened during a paused match, now displays a read-only **Bench Fitness Review**. It recommends the single largest fitness improvement among same-role substitutes only if a starter has at least 40% fatigue and an eligible bench player offers at least 20 percentage points less fatigue. Recommendations obey the three-change limit, permanent substituted-off exclusion and injury restrictions. Player names and numbers are escaped before displaying. Pregame tactical selection is unchanged; pressing **SAVE TACTICS** remains the only path to validate/apply a substitution.

The feature does not touch the engine, AI, ball, player source records, art, control mapping, persistent save schema or source-data IDs. It does not silently substitute a player; showing the recommendation has no state or localStorage side effects.

## Tests

- `node --test tests/substitution_advice.test.cjs`: five small eligibility/security/side-effect/UI integration contracts.
- `python3 scripts/build.py && python3 tests/substitution_advice_browser_qa.py`: real modular Team Command Center navigation, fatigue/hint, used substitution quota and no-save assertion on desktop and simulated-touch Chromium.
- Existing Node and sharded browser regression via `Full Regression Census`, plus JSON and roster preflight and hosted desktop/touch GitHub Pages checks. These gates must be attached to the **exact integrated commit** rather than inherited success counts.

**Initial checkpoint result:** source and tests submitted to `dev`; exact-commit GitHub Actions gate to be checked and recorded below. Do not mistake a successful push for full regression certification.

## Known gaps / owner boundaries

- This is *advisory*, not a new auto-substitution algorithm. Positional OVR, tactical match-up recommendations and interactive one-click selection remain future options.
- Exhaustive real Android/iOS touch, offline PWA and long-term restart persistence remain owner-deferred.
- Graphics `graphics-renderer`, merger `integration-tooling`, regression `qa-framework`, release `release-infra`, and roster batch files have active or separate owners. Preserve all their changes and historical QA evidence; delete only demonstrably unused files with their owners' agreement.

## Next five small iterations (for future separately claimed sessions)

1. Finish full exact-commit Node/Chromium regression and fix genuine UI-only failures before release.
2. Optional visual emphasis for fatigued starters in pause screen, with accessibility/touch regression.
3. Add lineup position-fit guidance without changing formations, match physics or save keys.
4. In coordinated future gameplay/UI scope, improve halftime coaching suitability and substitution acceptance.
5. Add broader career squad maintenance hints and compact mobile UI validation after current graphics integration.

## Handover

Scope: `src/modules/ui.js`, `tests/substitution_advice.test.cjs`, `tests/substitution_advice_browser_qa.py` and this document. No cleanup of unrelated historical/graphics files. Final code SHA, test links and claim release are to be recorded after the exact-source checks.

## Verified integration QA checkpoint

- Feature implementation: [9951b3b](https://github.com/saeedsai/SuperMagicFootball/commit/9951b3bae49d6b10197b1bb0b6f13492b36edc99).
- UI contract and exact-census trigger: [e9c99b9](https://github.com/saeedsai/SuperMagicFootball/commit/e9c99b9d6e8ed4b8b1140262f03670666b5b7cdd).
- [Modular Game Dev QA #38891495352](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891495352) **SUCCESS**: 81/81 active Node tests (including five new advice contracts), source/data validation and Python merge preflight.
- [Full Regression Census #38891468584](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468584): **preflight and four Node shards PASS**. The four Chromium shards, including the new `substitution_advice_browser_qa.py`, were **still running at this documentation checkpoint**. Run #38891495276 on a newer commit was cancelled because of active concurrent pushes; cancelled is not PASS. **Overall regression remains unverified until complete browser results are available.**
- [Deployed game desktop/touch smoke #38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528): **SUCCESS** on hosted `https://saeedsai.github.io/SuperMagicFootball/`. Chromium desktop and simulated touch each loaded version `0.8.25.32-integrated`, 224 teams, Quick Match menus, kickoff and active game; 20%-longer field invariant held. This does not certify physical phones or prove the new advice is visible on the host. Browser-specific acceptance runs in the Full Regression Census.
- Multiple agents continued pushing graphics/QA changes to `dev` during this batch. No commits were force-pushed or other agents' source paths overwritten. The tested integrated source must always be identified by its own commit SHA; later branch heads may differ.

### Paused checkpoint / follow-up

1. Inspect the final four Chromium shard logs for the first completed **same-source** full regression containing `substitution_advice_browser_qa.py`. If it fails, isolate the browser acceptance issue under a new `ui-controls` claim; do not modify graphics/QA ownership.
2. If the full regression is green, record totals and host deployment on the exact resulting SHA. If not, keep status explicitly pending/failed; do not present the previous 156-script historical green run as this release.
3. Safely release `ui-controls` once this handover is saved so another agent can claim a different bounded UI requirement. No deletion of historical tests/docs was safe or needed in this batch.

## Focused Chromium selector hotfix checkpoint

[Full Regression Census #38891468584](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468584) ran this feature's new `substitution_advice_browser_qa.py` and failed on a **test-only ambiguous locator**: the existing tactics screen legitimately contains two buttons with `data-action="returnPause"` (a screen toolbar Back and a bottom-row Back), so Playwright strict locator resolution rejected `.click()` without specifying one. The test now uses `.first.click()`, deliberately retaining both functional buttons and the actual game UI. No gameplay, save, roster, graphics or menu production code is changed by the hotfix. A companion release-contract assertion checks the existing advice ineligibility guards and re-triggers complete Full Regression Census on the new integrated SHA. Until that run completes, global Chromium regression status remains **not certified**. The original `81/81` Node pass and hosted PC/touch Quick Match success remain valid evidence on their exact source commits.

### Retest submission and next-session exact run

- The test-only hotfix landed in [commit `36ad78d`](https://github.com/saeedsai/SuperMagicFootball/commit/36ad78d06722467962e3c5dcea1b9870ed1cfa84).
- [Modular Game Dev QA #38892003132](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38892003132) completed **SUCCESS** with current Node contracts, data checks and Python compile preflight.
- [Full Regression Census #38892003186](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38892003186) was **pending** at handover. All four Chromium shards must finish on the matching commit, and any remaining failure must be classified from its script's error log. Do not present this queued run as PASS.
- Live GitHub Pages browser smoke remains verified by [#38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) on an ancestor containing the UI feature; the hotfix changes no playable runtime. Recheck hosting after newer concurrent Pages deployments.

**Ownership at checkpoint:** the follow-up `UI-CAREER-RETEST` claim `ui-career-subfeedback-retest-20261016-gpt6b` is released after this handover. New work must acquire a fresh available claim before touching `ui-controls`.
