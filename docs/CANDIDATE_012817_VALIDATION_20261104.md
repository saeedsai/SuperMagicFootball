# Candidate 0.12.81.17 validation — 4 November 2026

## Change

When the portrait orientation prompt auto-hides after rotating to landscape, focus now returns to an actually visible game control. Previous-focus restoration checks rendered visibility and automatic orientation changes explicitly use the match-control fallback. User dismissal remains session-scoped, and prompt re-entry on return to portrait still receives focus.

The existing morale regression had a stale bound of five even though the current renderer has 25 authored celebration poses. Its assertion now checks the valid integer range `0–24`.

## Validation

- `python -X utf8 scripts/build.py`: passed.
- `node --test tests/*.test.cjs`: **1,957/1,957**.
- `node --test tests/ux26_rotate_prompt_focus.test.cjs`: **3/3**.
- The real desktop/simulated-touch Chromium orientation-focus flow passed three consecutive standalone runs.
- Four-shard Chromium census: **228/228**, no failures, timeouts or errors; independent shard audit passed. See [census evidence](qa_runs_012817_browser_20261104/README.md).
- Candidate `.16` Cup structure coverage remains **78/78**; its focused Cup + release/version run passed **99/99**.

## Remaining gates

The `.16` historical Node-shard attempt had two 75-second whole-match Super Shot diagnostic timeouts; those diagnostics are separate from the passing 1,957-case Node test suite. Exact-head CI, hosted deployment/smoke, physical-device/screen-reader acceptance, owner visual approval, protected promotion and server readiness remain unverified.
