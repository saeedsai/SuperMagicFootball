# Candidate 0.12.81.27 validation — 4 November 2026

## Change

If both automatic LAN host wallet writes fail after a completed peer match, the result receipt can now be recovered from the same tab after reload. A small `sessionStorage` record contains only the already-issued receipt ID, nominal amount, and host role. Retrying submits the same receipt to the existing local wallet; duplicate receipts stay idempotent, failed retries keep the recovery hint, and successful durable writes clear it. Session storage is only a retry hint and is not secure/server authority. No real-money checkout or authenticated server settlement was added.

The main menu exposes a keyboard-accessible retry control with a live status message after a reload. While the receipt is pending, starting another peer match focuses the recovery control first. Existing offline selection, wallet receipts, LAN wire messages, and save formats are unchanged.

## Validation

- `python -X utf8 scripts/build.py` — passed; **5,003,049 JavaScript characters** and **5,124,911 HTML characters**.
- `npm run test:node` — **1,968/1,968 passed**, plus roster runtime/data integrity checks (the roster suite was run as part of the project command, not as player identity review).
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs tests/art102_spin_bumper_pose.test.cjs tests/lan-token-result-ack-recovery.test.cjs` — **28/28 passed**, including the storage-denial regression and workflow dependency guard.
- `SMF_ACK_BROWSER_FAIL_HOST_WALLET_WRITES=2 SMF_ACK_BROWSER_RELOAD_HOST_RECOVERY=1 python -X utf8 tests/browser_runner_compat.py tests/lan_token_result_ack_host_write_retry_browser_qa.py` — passed. It injected two automatic host-write failures, reloaded the result page, found the visible accessible retry, and saved the same receipt once by keyboard. It also denied session storage in a separate browser context and confirmed the main menu booted without page errors. Host wallet: one durable receipt and 30 tokens; guest wallet: one receipt and 20 tokens; page errors: 0.
- `git diff --check` — passed.

## Release status

The first exact-head run, [41850661927](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41850661927), failed in Modular Game Dev QA because its Node step omitted the declared `ws` runtime install. The workflow-only fix passed [41851207615](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41851207615). Full Regression Census [41851207445](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41851207445) then caught that browsers can throw on `window.sessionStorage` at an opaque origin; this could prevent app startup. Guarded access now passes local Node and browser regressions, and the corrected integrated exact-head run is pending. Candidate .27 promotion and hosted Pages checks remain pending. Candidate .26 passed exact-head dev regression and promotion in [run 41847351215](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41847351215), then hosted Pages verification in [run 41848789472](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41848789472). The public game is available at [GitHub Pages](https://saeedsai.github.io/SuperMagicFootball/). Physical-device and real-network acceptance remain separate.
