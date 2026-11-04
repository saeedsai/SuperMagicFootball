# Menu accessibility-reference integrity — 3 November 2026

## Acceptance

Across the 18 existing VIZ-02 core routes, each rendered document ID must be unique, every menu `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-owns`, `aria-errormessage`, and `aria-details` token must resolve to an element, and every menu label `for` must resolve to a form-associated element. Validate at narrow phone (320×568), phone (390×844), and desktop (1280×800) Chromium viewports without page errors.

## Result

`python -X utf8 scripts/build.py` passed and generated the current modular browser fixture. Then `python -X utf8 tests/browser_runner_compat.py tests/viz02_menu_idref_integrity_browser_qa.py` passed **54/54 route/viewport samples**. No duplicate IDs or broken ID references were found. No product source change was needed; this test adds a regression guard for future route markup changes.

This is portable Chromium evidence, not physical screen-reader acceptance. The existing physical-device and owner visual review gates remain open.
