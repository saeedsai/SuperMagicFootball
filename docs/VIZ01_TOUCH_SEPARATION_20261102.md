# VIZ-01 touch joystick/action separation — 2 November 2026

`[scripts/audit_viz01_touch_separation.py](../scripts/audit_viz01_touch_separation.py)` reveals the mobile controls in Chromium's touch emulation and compares the rendered joystick hit area with the four-action pad. The script also checks for browser page errors.

All four layouts pass: **320×568**, **390×844**, **844×390**, and **568×320**. The joystick and action pad have no intersecting hit-area rectangles; no page errors occurred.

Run on Windows with the portable browser adapter:

```powershell
$env:PYTHONUTF8='1'
..\.qa-browser-venv\Scripts\python.exe tests/browser_runner_compat.py scripts/audit_viz01_touch_separation.py
```

This covers simulated browser geometry only. Actual touch accuracy, safe-area behavior, hand reachability, and physical-device acceptance remain open. No game UI code or artwork changed in this audit.
