# Knockout penalty-result validation — 2026-11-02

## Acceptance criteria

- A player-entered knockout draw must include the final penalty winner; it cannot silently use the seeded tie-break fallback.
- Only numeric team-side values `0` and `1` are valid penalty winners.
- Invalid or missing results leave the tournament bracket, prize total and history unchanged.
- Valid winner values continue to advance or eliminate the player deterministically.
- Standalone and modular tournament APIs enforce the same contract.

## Change

Both tournament APIs now validate penalty-winner values before any mutation. For the player's knockout fixture, a tied score without a penalty winner is rejected instead of selecting a side from the deterministic hash fallback. Non-player simulated fixtures retain their existing deterministic resolution.

## Validation

- `node --test tests/tournament_result_validation.test.cjs tests/cup_tournament_state_validation.test.cjs` — **4 passed, 0 failed**.
- `node tests/continental.mjs` — full-season check passed for all **151 selectable solo campaigns** across UEFA, AFC, CAF, CONCACAF, CONMEBOL and OFC.
- No browser, physical-device, or hosted deployment claim is made; this increment validates tournament-result data handling.
