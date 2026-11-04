# Candidate 0.12.81.27 validation — 4 November 2026

## Change

If both automatic LAN host wallet writes fail after a completed peer match, the result receipt can now be recovered from the same tab after reload. A small `sessionStorage` record contains only the already-issued receipt ID, nominal amount, and host role. Retrying submits the same receipt to the existing local wallet; duplicate receipts stay idempotent, failed retries keep the recovery hint, and successful durable writes clear it. Session storage is only a retry hint and is not secure/server authority. No real-money checkout or authenticated server settlement was added.

The main menu exposes a keyboard-accessible retry control with a live status message after a reload. While the receipt is pending, starting another peer match focuses the recovery control first. Existing offline selection, wallet receipts, LAN wire messages, and save formats are unchanged.

## Validation

- `python -X utf8 scripts/build.py` — passed; **5,003,049 JavaScript characters** and **5,124,911 HTML characters**.
- `node --test tests/*.test.cjs` plus `node tests/club26_fc27_roster.mjs` (`npm run test:node`) — **1,966/1,966 passed**, plus roster runtime/data integrity checks.
- `node --test tests/lan-token-result-ack-recovery.test.cjs` — **2/2 passed**, including same-tab reload, failed-retry retention, and duplicate receipt protection.
- Release/version, ART-102, and LAN recovery contracts — **26/26 passed**.
- `SMF_ACK_BROWSER_FAIL_HOST_WALLET_WRITES=2 SMF_ACK_BROWSER_RELOAD_HOST_RECOVERY=1 python -X utf8 tests/browser_runner_compat.py tests/lan_token_result_ack_host_write_retry_browser_qa.py` — passed. It injected two automatic host-write failures, reloaded the result page, found the visible accessible retry, and saved the same receipt once by keyboard. Host wallet: one durable receipt and 30 tokens; guest wallet: one receipt and 20 tokens; page errors: 0.
- `git diff --check` — passed.

## Release status

The first exact-head run, [41850661927](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41850661927), failed in the separate Modular Game Dev QA workflow because its Node step omitted the declared `ws` runtime install; seven LAN server contracts could not import the dependency. The full regression workflow already installs `ws`, and the local full Node suite passes. A workflow fix plus a guard test are prepared; the corrected exact-head run has not started. Candidate .26 passed exact-head dev regression and promotion in [run 41847351215](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41847351215), then hosted Pages verification in [run 41848789472](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41848789472). The public game is available at [GitHub Pages](https://saeedsai.github.io/SuperMagicFootball/). Physical-device and real-network acceptance remain separate.
