# UI/UX Dashboard Redesign — v0.8.9 Phase 1

## Scope actually delivered

- Changed **only** the home-page layout, styles, version information and associated tests; engine and roster data unchanged.
- Grouped all fourteen original action IDs by activity: **Play Football** (Quick Match, Versus, Penalty, Training), **Championships & Career** (Continental, Manager, World League), **Team & Game Studio** (Squad, Player Studio, Create Club, Roster Editor, Encyclopedia, Settings, Help).
- Added four quick statistics, a readable alpha-version badge, illustrated animated preview on larger screens, clear category headers and high-contrast primary action.
- Kept semantic `button` elements and keyboard focus outlines. Reduced density on small screens; hide the decorative preview on coarse-pointer phone landscape to emphasize actual choices.
- Kept all event `data-action` names unchanged; no changes to gameplay inputs, four-touch cross, gamepad, goal HUD, careers, or saves.

## Still open

This does **not** implement a complete game-wide design system. World/national cartoon flag illustrations, 216 custom club-crest assets, improved player caricatures, submenu reorganization, keyboard/gamepad focus navigation and larger accessibility testing remain separate future milestones. The current iconography still mixes emoji and existing generated shields.

## Acceptance / regression coverage

- 3 labeled sections, 14 unique action buttons with no dead routes, five representative back/home navigation round trips.
- Desktop Chromium at 1440×900 and simulated mobile landscape 844×390. No horizontal overflow; screenshots in `tests/home_dashboard_desktop.png` and `tests/home_dashboard_mobile.png`.
- All eighteen existing game-logic suites and prior browser test scripts in `tests/run_full_browser_regression.py`.
