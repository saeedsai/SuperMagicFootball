# VIZ-01 mobile selected-player HUD readability — 3 November 2026

## Change

On narrow match viewports, the selected-player status line used 9px text, wrapped into multiple lines and could run into the Energy label. The mobile HUD now keeps it on one line at 11px, clips overflow with an ellipsis, and mirrors the complete unabridged line into the native title tooltip. The player tag stays above the Energy HUD. Player selection, status content, gameplay and hitboxes are unchanged.

## Validation

- `python -X utf8 scripts/build.py` completed successfully.
- `python -X utf8 tests/viz01_mobile_player_tag_browser_qa.py` passed on desktop, landscape touch (844×390), portrait touch (390×844), and narrow touch (320×640).
- The actual running match DOM confirms the 11px mobile text, ellipsis overflow, full text in `title`, and no overlap with the Energy HUD. Chromium reported no page errors.
- Inspected the actual narrow-touch live-match screenshot: the player chip remains legible, the Energy and Super Ready labels remain separate, and the four action controls remain visible.
- `git diff --check -- style.css src/modules/ui.js tests/viz01_mobile_player_tag_browser_qa.py` passed (Git only reported the repository's LF-to-CRLF normalization notices).

## Limits

Simulated-touch Chromium is not physical-device acceptance. Tooltip behavior varies across touch devices; the full value remains in the rendered DOM and `title` attribute. Screen-reader and real-device review remain open.
