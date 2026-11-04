# Controls help narrow-screen acceptance — 3 November 2026

## Change

Expanded the Controls help browser check to cover desktop, landscape touch, portrait touch, and a narrow 320 px touch viewport. Each configuration now verifies that the four Pass/Shoot/Dribble/Jump practice targets stay at least 44 × 44 CSS pixels, do not overlap, and do not create horizontal page overflow. The Chromium launcher now resolves the installed browser portably, with Playwright-managed Chromium as the fallback.

## Validation

- `node --test tests/ux26_touch_help_practice.test.cjs tests/ux26_help_reflects_bindings.test.cjs`: **6/6 passed**.
- `python -X utf8 tests/ux26_touch_help_practice_browser_qa.py`: desktop, 844 × 390 landscape touch, 390 × 844 portrait touch, and 320 × 640 narrow touch all passed. Keyboard and touch guided-Cross flows, accessible status, no match kickoff, and no page errors remain checked.
- Each viewport had four non-overlapping, in-bounds action targets and no horizontal document overflow.

## Limits

This adds browser acceptance coverage and a portable test launcher; it does not claim physical-device acceptance. The controls flow still uses the four existing football actions and does not dispatch match input from the practice screen.
