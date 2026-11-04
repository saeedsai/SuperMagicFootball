# Player Studio control grouping — 3 November 2026

## Change

Grouped existing appearance fields into native fieldsets: Skin & Hair Color, Face & Hair, Body, and Personal Details. Each group uses a responsive two-column control layout with clearer borders, labels and spacing. The controls keep their current IDs, option catalogs, selected values, live color previews, and save/cancel behavior; no player data or stats changed.

## Validation

- `node --test tests/player_studio_control_groups.test.cjs tests/player_studio_color_accessibility.test.cjs tests/viz05_studio_gamepad_navigation.test.cjs`: **10/10 passed**.
- `python -X utf8 scripts/build.py`: passed.
- `tests/player_studio_control_groups_browser_qa.py`: desktop **1400×850** and simulated-touch **390×844** passed. All four fieldsets, 15 appearance selectors and two palette selectors remained present; controls stayed within their group, with no horizontal overflow or browser errors.
- `tests/viz05_studio_gamepad_browser_qa.py`: passed on desktop and simulated-touch landscape after making its Chromium path portable for Windows. Player Studio save/reload, D-pad control focus, B cancellation and Manager Appearance gamepad behavior remain intact.
- Reviewed screenshots in `evidence/browser/player_studio_groups_desktop.png` and the four `player_studio_group_*_mobile.png` captures.

## Limits

This is browser-emulated evidence. Physical-device, screen-reader and owner visual acceptance remain open.
