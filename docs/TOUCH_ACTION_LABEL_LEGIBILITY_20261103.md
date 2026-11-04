# Touch-action label legibility — 3 November 2026

## Change

Raised the effective touch-action label minimum from 9px to 10px, removed internal button padding, and applied compact letter spacing/condensed text so PASS, SHOOT, DRIBBLE, and JUMP fit without clipping. Button dimensions, positions, colors, accessible names, safe-area offsets, and input wiring remain unchanged. The browser harness now reads the generated modular fixture and checks exact visible/accessibility labels, minimum font size, fit, and 44px minimum touch targets at 320×568, 390×844, 844×390, and 568×320.

## Validation

- `python -X utf8 scripts/build.py` — passed.
- `tests/four_button_browser_qa.py` through `tests/browser_runner_compat.py` — passed at desktop 1280×720 plus touch layouts 844×390, 390×844, 320×568, and 568×320. Keyboard/touch action behavior and Super Shot input passed on desktop and landscape touch. All four labels fit at all four touch sizes; labels and accessible names are unchanged; targets remain at least 44 CSS pixels. No browser errors.
- `tests/ux102_forced_colors_browser_qa.py` through `tests/browser_runner_compat.py` — passed; Pause, Fullscreen, all four action buttons, and visible keyboard focus retain system colors and Highlight outlines.
- Screenshots: `tests/four_button_android.png`, `tests/four_button_phone390.png`, `tests/four_button_narrow_phone.png`, and `tests/four_button_narrow_landscape.png`.

These results use Chromium emulation and do not establish physical-device or screen-reader acceptance.
