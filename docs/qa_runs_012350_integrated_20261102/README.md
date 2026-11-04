# 0.12.35.0 integrated local QA — 2 November 2026

Candidate `0.12.35.0` was validated from the current local integration based on `dev` at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`. The integration remains uncommitted; this report does not claim CI, promotion, deployment, hosted, device, or owner approval.

## Changes covered

- Controls help adds a mapped PASS hold/release practice that reports measured hold duration without dispatching a match action. It cancels on pointer cancellation/loss, window blur, tab backgrounding, and leaving Controls through either `page()` or shared `show()` routing.
- Home and touch-action labels were adjusted to meet a 4.5:1 computed text contrast minimum in the checked normal, active, hover, and focus states.
- The untouched Player Studio route remains free of a false unsaved-change prompt, and Back/Escape route/focus coverage remains in place.
- Browser QA selectors were corrected where Back and the primary button intentionally share a resume action. The pause-tactics regression now verifies live match edits do not overwrite the saved pre-match plan.
- No new concept graphics or Studio assets were authored.

## Local results

| Gate | Result | Evidence |
|---|---:|---|
| Integrated Node | **1,559/1,559 passed** | [`node_full.log`](node_full.log) |
| Independent Node census | **398/398 passed**, four shards | [`node report`](../qa_runs_012350_node_20261102/README.md) |
| Portable desktop/simulated-touch browser census | **152/152 passed**, four shards | [`browser report`](../qa_runs_012350_browser_20261102/README.md) |
| UX26 PASS practice | Desktop and simulated touch passed, including elapsed time, completion, cancellation, Back route and no match dispatch | `tests/ux26_pass_charge_practice_browser_qa.py` |
| UX101 contrast | Desktop and simulated touch passed; all checked pairs **≥4.5:1** | `tests/ux101_text_contrast_browser_qa.py` |
| Club roster validator | **32 clubs / 384 player slots** validated | Integrated Node log |
| `git diff --check` | Passed; Git emitted existing LF→CRLF working-copy notices | Current working tree |

## External acceptance still open

The exact commit is not pushed or CI-certified. Protected promotion, hosted Pages verification, physical-device/two-client LAN checks, owner visual review, and art acceptance remain unverified. Production art coverage remains incomplete and unapproved; this increment did not change it.
