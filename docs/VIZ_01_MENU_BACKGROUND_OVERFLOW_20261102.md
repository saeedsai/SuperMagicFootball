# VIZ-01 menu background overflow audit

## Acceptance

Decorative menu background paint must not add horizontal or vertical scroll range outside the viewport. Long menu content must remain vertically scrollable inside the menu box at narrow-phone sizes.

## Finding and fix

At desktop 1360×800, a desktop Quick Match screen measured outer-menu scroll bounds 1496×912 for a 1360×800 viewport. At simulated phone sizes 390×844 and 320×568, the same issue measured 429×962 and 352×648, respectively. The menu's bottom field arc is intentionally drawn past the viewport, but as an absolutely positioned descendant it expanded the outer scroll area and created an unnecessary horizontal/vertical pan region.

Made the decorative field arc viewport-fixed. Its visible position stays the same; the outer menu now measures exactly the viewport at all tested sizes. The `.menubox` remains independently vertically scrollable: at 320×568, a 65px internal scroll range allows the final Quick Match route to be reached.

## Validation

After `PYTHONUTF8=1 python scripts/build.py`, run:

```powershell
..\.qa-browser-venv\Scripts\python.exe tests/viz01_menu_background_overflow_browser_qa.py
```

Chromium passed at desktop 1360×800, phone 390×844, and narrow phone 320×568 with no page errors. The test verifies home and Quick Match outer-menu bounds and narrow-phone inner scroll reachability. Screenshots are generated under `tests/.generated/ux101_menu_background_overflow/`; desktop and phone views were inspected. This is browser automation evidence, not physical-device signoff.
