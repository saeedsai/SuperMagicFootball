# UX-102 Home mode icons — 3 November 2026

## Change

Replaced the five original Home destination emoji with inline vector emblems for Quick Match, Online, Career, Leagues & Cups, and Settings. The later Store & Tokens destination also has its own bag/star vector emblem, bringing the menu to six categories. The static emblems are decorative and hidden from assistive naming; destination labels, button actions, routes, focus styling, and card content remain intact. Each badge uses its own color treatment, scales within the existing touch-size layout, and switches to system colors under forced-colors mode.

## Validation

- `npm run build:qa`: passed.
- `node --test tests/ux102_home_mode_icons.test.cjs tests/arena_overhaul_visual_contract.test.cjs`: **9/9 passed**.
- `python tests/ux102_home_mode_icons_browser_qa.py`: passed at desktop 1280×800, simulated touch 390×844, forced-colors, and reduced-motion. It checks all six distinct icons and labels, Online/Store routes, icon bounds, visible keyboard focus, no page errors, system-color badges, and static/reduced-motion behavior.
- `python tests/home_dashboard_browser_qa.py` with Python UTF-8 mode: desktop 1400×850 and simulated touch 390×844 passed for all six categories, Quick Match, Store, Settings, and overflow checks.
- Reviewed desktop and touch screenshots: `evidence/browser/ux102_home_icons_desktop.png` and `evidence/browser/ux102_home_icons_touch.png`.
- `git diff --check` passed for the edited source and test files.

## Limits

Forced-colors and touch behavior were browser-emulated; this does not establish Windows High Contrast or physical-device acceptance. Owner visual review and assistive-technology acceptance remain open.
