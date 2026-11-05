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

## Limits and remaining gates

Online browser coverage uses mocked services and does not establish real account-provider, production database, hosted API, two-device or network behavior. Cup session-only data is intentionally temporary when browser storage denies persistence. Exact-head CI, protected promotion, deployment and hosted smoke are pending for .41. Human visual and physical-device acceptance remain open. Candidate .40 is the latest deployed build; its online configuration is blank, so authenticated online play is not live.
