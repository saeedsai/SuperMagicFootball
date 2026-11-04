# Cup winner and restore integrity — 2026-11-02

## Acceptance criteria

- An active tournament has no winner.
- A finished champion must be one of the saved participants; eliminated or nonqualified campaigns may have `winner: null`.
- Cup slot writes and runtime restore validation reject a foreign winner before activating or persisting the campaign.
- Standalone and modular tournament validators stay aligned.

## Change

The Cup vault's structural validator now requires a non-null winner to belong to `participants`, and permits a winner only when `phase` is `finished`. The standalone and modular runtime `validateTournament` APIs enforce the same state rules. This prevents a corrupted or edited save from carrying an unrelated club as champion or claiming a champion before the knockout phase is complete.

## Validation

- `node --test tests/cup_winner_integrity.test.cjs tests/cup_save_slots.test.cjs tests/cup_tournament_state_validation.test.cjs` — **10 passed, 0 failed**.
- `node tests/continental.mjs` — full-season checks passed for all six confederations and all **151** generated solo campaigns.
- No browser, physical-device, or hosted deployment claim is made; validation covers save and runtime tournament data.
