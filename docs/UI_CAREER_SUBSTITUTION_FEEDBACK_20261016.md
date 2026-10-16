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
