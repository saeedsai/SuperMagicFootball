# Cup league round coverage — 4 November 2026

## Acceptance criteria

- Every scheduled league round pairs every member of each active group exactly once.
- An odd-sized group may have exactly one bye per round.
- Omitted, duplicate, unknown, or cross-group participants fail validation in the slot, modular, and standalone tournament validators.
- Intentionally empty legacy/placeholder schedules remain accepted by Cup-slot validation, including the historic `[[]]` single-empty-round sentinel.

## Change

The three Cup validators now verify per-group participant coverage for every nonempty active league round. Group schedules require each team to appear once, except one unpaired team when a group is odd. A rechecksummed backup that deletes a non-player fixture from an otherwise valid round now fails before it can be accepted as a save slot. The older XSS-history fixture with a single empty round remains loadable as a compatibility sentinel; a mixed schedule with an empty round and played rounds is still rejected.

## Validation

- `node --test tests/cup_tournament_state_validation.test.cjs` — **2/2 passed**. Covers standalone, modular and slot validators rejecting a removed non-player fixture; accepts a valid odd-group bye; rejects multiple missing teams; preserves the empty legacy schedule placeholder.
- `python -X utf8 tests/browser_runner_compat.py tests/cup_history_markup_browser_qa.py` — desktop and simulated-touch passes, including the historic `[[]]` campaign and score-markup escaping.
- `python -X utf8 tests/browser_runner_compat.py tests/cup_empty_active_restart_browser_qa.py` — desktop and simulated-touch passes for empty active-slot behavior.
- `python -X utf8 tests/browser_runner_compat.py tests/ux27_partial_save_preserves_career_cup_browser_qa.py` — desktop and simulated-touch passes.

This focused state validation does not claim browser, physical-device, hosted, or owner gameplay acceptance.
