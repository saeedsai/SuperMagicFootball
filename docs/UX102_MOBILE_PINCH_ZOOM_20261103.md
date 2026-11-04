# Mobile pinch-zoom access — 3 November 2026

## Defect and acceptance

The root `html,body` rule used `touch-action:none`, and menu/scroll containers only allowed `pan-y`. Their ancestor intersection therefore blocked browser pinch zoom across responsive menus. The fix must permit pinch zoom through the page and menu scroll chain while preserving captured joystick/action-button input and the portrait-canvas drag gesture.

## Change

Root touch behavior now uses `manipulation`. Menu, dialog, roster and scroll panes allow vertical scrolling and pinch zoom. The joystick, four action buttons, and Player Studio portrait canvas keep their explicit `touch-action:none` handling.

## Validation

- `python scripts/build.py`: passed; current modular QA fixture built.
- `python tests/browser_runner_compat.py tests/ux102_pinch_zoom_browser_qa.py`: passed at 320×568 narrow portrait and 844×390 landscape touch emulation. The browser test checks every computed ancestor from the menu heading to the document root; the full chain permits pinch zoom. It also confirms joystick, action-pad and portrait-canvas targets still block browser gesture capture.
- `python tests/browser_runner_compat.py scripts/audit_viz01_touch_separation.py`: all four layouts passed (320×568, 390×844, 844×390, 568×320); joystick and action pad remain separated.
- `python tests/browser_runner_compat.py tests/ux102_reduced_motion_browser_qa.py`: desktop and simulated-touch checks passed.

## Limits

Playwright verifies the CSS ancestor intersection and simulated viewport layouts; it does not synthesize a physical two-finger pinch. Actual mobile browser/device zoom and touch accuracy remain unverified.
