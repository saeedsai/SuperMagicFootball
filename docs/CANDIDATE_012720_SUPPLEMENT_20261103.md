# Candidate 0.12.72 supplemental validation — 3 November 2026

This adds focused evidence after the original `.72` report; it does not change player-facing behavior or the installed version.

- Full local `npm run test:node`: **1,861/1,861**; build and club fixture passed.
- UTF-8 data validation: **223 teams, 2,676 player slots, 84 avatar presets**, no errors.
- Release gate and version-policy contract tests: **21/21**.
- `tests/lan_server_join_replay.test.cjs`: **2/2**. A deterministic fake clock confirms replay rejection at 29,999 ms, expiry exactly at 30,000 ms, and expired-ID capacity reclamation; actual local WebSocket coverage confirms duplicate suppression, fresh IDs, and capped memory.
- `tests/viz01_standard_focus_browser_qa.py`: passed in simulated landscape-touch Chromium. Fullscreen, Pause, Jump, Pass, Shoot and Dribble expose accessible names, receive visible focus outlines, remain in view, and follow the tested Tab order.
- The previous `.71` four-shard Chromium census remains **203/203**. No `.72` full census was run by this supplement; exact-head CI, hosted, physical-device and real two-device acceptance remain separate.

The independent experimental player-frame assembly is documented at [EXPERIMENTAL_AI_RUN_FRONT_ASSEMBLY_20261103.md](EXPERIMENTAL_AI_RUN_FRONT_ASSEMBLY_20261103.md) and remains outside production status.
