# Career league draw and penalty metadata — 2026-11-02

## Acceptance criteria

- A tied league result remains a draw, even if a stale or malformed caller passes a valid `penaltyWinner` value.
- League table points, cash, player XP/growth, and match history remain identical to the ordinary draw path.
- Cup knockout ties continue to use the selected penalty winner.
- The standalone Career API and modular Career implementation remain behaviorally aligned, with no save-schema change.

## Change

Both Career APIs now apply `penaltyWinner` only to tied Cup fixtures when calculating `lastResult.win`. Previously, a tied league fixture with `penaltyWinner === 0` marked the match result as a win for rewards and player progression, even though the league table recorded a draw. League tie handling now follows its scoreline; Cup shootout behavior is unchanged.

## Validation

- `node --test tests/career_match_result_validation.test.cjs tests/career_season_review.test.cjs tests/career_growth.test.cjs tests/career_season_archive.test.cjs` — **18 passed, 0 failed**.
- The regression compares complete post-match saves for a normal league draw and a league draw with stray shootout metadata, across both Career APIs.
- Existing Cup winner and season/progression checks passed in the same focused run.
- No browser, device, or hosted deployment claim is made; this is a pure Career result calculation fix.
