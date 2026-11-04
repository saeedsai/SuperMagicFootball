# VIZ-02 responsive route census refresh — 3 November 2026

Updated `scripts/audit_viz02_responsive_routes.py` to expect the current Home Online route title, **ONLINE MATCHES**. No audit assertions or game source changed.

After rebuilding the current modular fixture, `python -X utf8 tests/browser_runner_compat.py scripts/audit_viz02_responsive_routes.py` passed all **54 route/viewport samples**: 18 routes at 320×568, 390×844 and 1280×800. Every route stayed within viewport width, all visible controls had accessible names, and there were no browser page errors.

This is portable Chromium emulation, not physical-device or assistive-technology acceptance.
