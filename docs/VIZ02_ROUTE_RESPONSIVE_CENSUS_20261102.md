# VIZ-02 responsive route census — 2 November 2026

`[scripts/audit_viz02_responsive_routes.py](../scripts/audit_viz02_responsive_routes.py)` opened 18 menu routes at three viewport sizes: 320×568 narrow phone, 390×844 phone, and 1280×800 desktop. It verified each route heading, checked body/document/menu widths against the viewport, checked that each visible button and form control has an accessible name, and collected browser page errors.

All **54 route/viewport samples passed** with no horizontal overflow, unlabeled visible controls, or page errors. Tested routes: Quick Match, On Device, Local Network, Online P2P, Career, Leagues & Cups, International, Club Competitions, Settings, Game Settings, Graphics, Sound, Player & Team Customization, Input Settings, Save Management, Controls, About, and Online. Existing vertical scrolling remains available where a screen needs it; this census only certifies horizontal containment and accessible names.

Run on Windows with the portable browser adapter:

```powershell
$env:PYTHONUTF8='1'
..\.qa-browser-venv\Scripts\python.exe tests/browser_runner_compat.py scripts/audit_viz02_responsive_routes.py
```

This route/width audit does not replace manual visual review, assistive-technology checks, or physical-device acceptance. No game UI code or artwork changed in this audit.
