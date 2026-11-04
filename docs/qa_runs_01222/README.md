# SuperMagicFootball 0.12.22.0 local candidate QA

Run date: 1 November 2026. The checkout was on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`, with integrated but uncommitted changes. The candidate remains local and unpromoted.

## Results

- `npm run test:node`: **1,317 passed, 0 failed**; generated runtime/test fixtures rebuilt successfully.
- Independent Node census: **332/332 scripts passed** across four shards (83 each); no failures, timeouts, errors or unrun cases.
- Chromium census: **113/113 scripts passed** across four shards (29, 28, 28, 28), using the pinned isolated Playwright environment with a 90-second per-script timeout; no failures, timeouts, errors or unrun cases.
- `scripts/validate_data.py`: **PASS**, 223 teams, 2,676 players, 84 avatar presets, no errors.
- SH02–SH04 focused live browser checks passed on desktop and simulated touch: Banana and Tornado signed/mirrored paths at 30/60/120 Hz; Nuts/Horse two-bank cap; goal-mouth scoring, crossbar misses, keeper-plane contacts, kickoff cleanup, and unchanged ordinary rebounds; four-action HUD unchanged.
- Tornado’s actual Chromium renderer preview was visually reviewed in [`qa_runs_01221`](../qa_runs_01221/README.md). Reduced-flash and trail contracts pass Node coverage.
- Full Chromium census includes the 12,096-case graphics sweep, Studio visual integration and LAN/browser suites.

Per-shard reports are in [`qa_runs_01222_node`](../qa_runs_01222_node/) and [`qa_runs_01222_browser`](../qa_runs_01222_browser/). Windows runs require `PYTHONUTF8=1`; browser cases use the isolated `.qa-browser-venv` and portable Chromium path.

## Remaining gates

These results cover the local integrated source tree. Exact committed-head CI, protected promotion, deployed Pages bytes, physical Android/iOS/gamepad play, a real two-device LAN match, and human approval of player art remain separate. No version has been published or deployed.
