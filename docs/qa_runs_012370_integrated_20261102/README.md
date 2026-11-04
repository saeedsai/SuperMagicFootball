# Candidate 0.12.37.0 integrated local QA — 2 November 2026

Candidate source is the current uncommitted working tree on branch `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`.

## Results

- `PYTHONUTF8=1 npm run test:node`: **1,565/1,565 passed**; club census **32 clubs / 384 player slots**.
- Independent Node regression census: **400/400 passed** across four shards.
- Portable desktop/simulated-touch Chromium census: **154/154 passed** across four shards.
- Data validator: **223 teams, 2,676 players, 84 avatar presets** passed.
- UX26 Training Cross coach: focused state tests **2/2**; desktop and simulated-touch browser acceptance passed.
- UX27 general save round trip: desktop and simulated-touch acceptance passed, including export envelope, cancellation, malformed/oversized rejection without writes, and restore after reload.
- `git diff --check`: passed (Git may report existing line-ending normalization notices).

The UX26 coach uses the mapped JUMP→PASS actions on the actual Training Arena field and confirms completion from the engine Cross event. It makes no save writes and adds no controls. UX27 browser coverage adds acceptance evidence without changing save behavior.

Exact-commit GitHub CI, protected release promotion, hosted Pages verification, two-device LAN and physical-device acceptance are not represented by this local report. Production art still needs actual-game visual review and owner approval; no concept graphics or roster data changed in this increment.
