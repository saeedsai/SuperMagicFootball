# VIZ-02 menu card accessible descriptions — 3 November 2026

## Change

Child-route cards already showed a short explanation visually, but their explicit `aria-label` caused that copy to be omitted from the button's accessibility tree. Each button now references its existing description with a unique `aria-describedby` ID. The button's accessible name, visible text, action route, and decorative SVG behavior are unchanged. No new controls or save state were added.

## Validation

- `python -X utf8 scripts/build.py` — passed.
- `node --check src/modules/ui.js` — passed.
- `node --test tests/viz02_menu_spatial_focus.test.cjs tests/ux102_home_mode_icons.test.cjs` — **5/5**.
- `python -X utf8 tests/viz02_nav_card_descriptions_browser_qa.py` — passed. Chrome's accessibility tree confirmed all **49** child-menu buttons retain their expected accessible name and expose the matching visible description as the separate accessible description at 1280×800. Ten menus also passed link, bounds, and naming checks at simulated touch 390×844 and 320×568. Keyboard Enter and touch activation still open the existing On Device route.
- `python -X utf8 tests/browser_runner_compat.py tests/viz02_menu_spatial_focus_browser_qa.py` — passed desktop and simulated touch spatial focus/activation.
- Screenshots were inspected at desktop and simulated touch.

The existing route-census script was also attempted. Its current `ONLINE` expected heading is stale: the implemented route title is `ONLINE MATCHES`, so the test times out on that mismatch. This does not affect the dedicated checks above; the existing census expectation needs separate reconciliation.

## Limits

Chrome accessibility-tree data is a browser-level semantic check, not physical screen-reader acceptance. NVDA/JAWS/VoiceOver and owner accessibility review remain unverified.
