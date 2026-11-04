# Windows QA — SuperMagicFootball 0.12.19.0 candidate

Run date: 1 November 2026. The local tree was on `dev` based at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` with uncommitted integration changes. The candidate was not promoted or deployed.

## Results

- `npm run test:node`: **1,302 passed, 0 failed**. This also rebuilt the single-file offline game fixture.
- Independent Node census: **328/328 scripts passed** across four shards (82 per shard); 0 failures, timeouts, errors or unrun cases.
- Chromium census: **113/113 scripts passed** across four shards (29, 28, 28, 28); 0 failures, timeouts, errors or unrun cases. Playwright ran on the pinned isolated Windows setup and portable Chromium path. LAN broker and multi-context WebRTC browser suites passed with the declared `ws` package installed.
- `scripts/validate_data.py`: **PASS**, 223 teams, 2,676 players, 84 avatar presets, no errors.
- Focused Career age/growth/readiness/history regressions: **31/31 passed**; verified DOB age handling covers strict ISO dates, birthday/leap-day boundaries, annual season dates, provisional age and legacy-save behavior.

The per-shard JSON and Markdown reports in this directory are the execution evidence. The prior diagnostic directory `qa_runs_full_regression_windows/` preserves the initial run that exposed missing local `ws` and a CRLF-sensitive ledger hash; the final census above was rerun after fixing the Windows setup and ledger normalization.

## Remaining gates

These local results do not certify remote exact-commit CI, protected promotion, deployed Pages bytes, physical Android/iOS/gamepad behavior, a real two-device LAN match, or human visual approval of player art. The candidate remains local and unpromoted.
