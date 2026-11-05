# Candidate 0.12.81.41 — local validation (5 November 2026)

## Scope

- Online Career and Ultimate Team asynchronous UI work is scoped to the account sign-in generation that started it. Late responses and cleanup from a previous account cannot replace the current account's records/balances/lineups, clear current loading state, or overwrite status. Stale sign-in redirect cleanup also avoids signing out a newer session.
- If Cup vault storage is denied at startup, Cup campaigns continue in a session-only in-memory vault. Cup save-slot UI and tournament progress now clearly warn that session data is lost when the page closes; successful memory-only writes do not clear the warning.
- No offline save, roster, match rule, four-action input, or local team/player identity is changed. This does not make remote service storage durable.

## Validation run

- `npm run test:node`: passed; build produced **5,167,368 JavaScript / 5,290,380 HTML characters**, tracked Node suite passed **2,216/2,216**, and the roster script completed successfully.
- `python tests/online_account_ui_browser_qa.py`: passed the mocked PKCE/account/API/WebSocket browser flow, including delayed Career, marketplace and lineup responses across account switches, online match/result behavior, preserved offline saves, and accessible statuses. The test harness now releases its deliberately deferred routes before its follow-up reload checks.
- `node --test tests/cup_save_slots.test.cjs tests/cup_slot_ui_dispatch.test.cjs tests/cup_storage_rollback.test.cjs`: **15/15 passed**, including denied startup reads, usable session-only Cup operations, accessible warning wiring, rollback behavior and quota failure handling.
- `git diff --check`: passed.

## Release gates and hosted status

- Exact-head `dev` Full Regression Census [41957676888](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41957676888) and Modular Game Dev QA [41957676919](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41957676919) passed for SHA `47b70f9bc8f3fbf2b9dad6b83429d162d12c2507`. The first main census attempt had one `lan_auto_two_browser_qa.py` timeout; the same exact-main census rerun passed all shards [41958609621](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41958609621).
- GitHub Pages deployment [41958609511](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41958609511) and hosted smoke passed. Live root, service worker, release module and online config all returned HTTP 200; the service worker and release module report `.41`. `online-config.js` still has empty API/OIDC fields, so authenticated online play is not enabled.
- Automated visual/device and physical-device acceptance remain open. The Cup warning has UI integration assertions but has not received owner visual review. Session-only Cup progress remains temporary by design.
