# 0.12.36.0 integrated local QA — 2 November 2026

Candidate `0.12.36.0` was validated from the current local integration based on `dev` at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`. The working tree is uncommitted; this report does not claim CI, protected promotion, hosted deployment, physical-device approval, or owner visual approval.

## Changes covered

- Controls help adds an isolated mapped SHOOT hold/release practice. It reports measured duration, explains that in-match charge is capped at 1.2 seconds, and never starts a match or sends a shot.
- Shoot practice cancels on pointer cancel/lost capture, window blur, hidden tab, and leaving Controls; later key release cannot complete an aborted exercise.
- Existing PASS hold/release practice continues to work with the shared cancellation path. Focused and broad checks confirm no practice event reaches match input.
- `.35` improvements remain included: mapped PASS charge practice, route/back cancellation, and 4.5:1 sampled UI text-contrast fixes.
- No new concept graphics or Studio assets were authored.

## Local results

| Gate | Result | Evidence |
|---|---:|---|
| Integrated Node | **1,563/1,563 passed** | [`node_full.log`](node_full.log) |
| Independent Node census | **399/399 passed**, four shards | [`node report`](../qa_runs_012360_node_20261102/README.md) |
| Portable desktop/simulated-touch browser census | **153/153 passed**, four shards | [`browser report`](../qa_runs_012360_browser_20261102/README.md) |
| SHOOT practice | Desktop and simulated touch passed: keyboard/pointer hold timing, release, pointer cancel/lost capture, blur, route Back and no match dispatch | `tests/ux26_shoot_charge_practice_browser_qa.py` |
| PASS practice | Desktop and simulated touch passed, including route cancellation and no gameplay action | `tests/ux26_pass_charge_practice_browser_qa.py` |
| Club roster validator | **32 clubs / 384 player slots** validated | Integrated Node log |
| Version/cache contract | Passed in integrated Node suite; About version, root README heading and rotated service-worker cache align at `0.12.36.0` | `tests/versioning_policy_contract.test.cjs` |

## External acceptance still open

The exact commit is not pushed or CI-certified. Protected promotion, hosted Pages verification, physical-device/two-client LAN checks, owner visual review, and production-art acceptance remain unverified. Player art coverage remains incomplete and unapproved; this increment did not change it.
