# Candidate 0.12.81.33 — local validation (4 November 2026)

## Scope

- Online Career exposes a bounded, account-scoped archive of up to 20 recent seasons. The current season is excluded; archived entries contain validated fixtures and standings, omit match IDs and participant identities, and render in keyboard-accessible expandable panels.
- Online UT retains the exact lineup request and idempotency key after transport failure. If the service committed but the response was lost, retry returns the original saved lineup rather than a stale-version conflict. Editing the lineup changes the request fingerprint/key; reloading a fresh server version clears the pending retry.
- Reopening Online Career refreshes server season/archive state; reopening Ultimate Team refreshes catalog, collection, token balance and saved lineup so post-match rewards and progression appear without stale menu data.
- Preserves the existing server-owned eight-fixture Career season, durable-result progression, canonical UT lineup ticket binding, PVP, offline saves, and four-action input.

## Validation run

- `npm run test:node`: build passed (**5,129,218 JavaScript / 5,252,011 HTML characters**); **2,175/2,175** Node tests passed; club runtime integrity fixture passed (32 clubs, 384 player slots).
- Focused Career service/API/client and Online UT lineup/store suites: **85/85** passed. Coverage includes account-isolated season listing, deterministic ordering, archive cap, current-season exclusion, role/ownership validation, concurrent writes, and duplicate-safe lineup request replay.
- `node --test tests/versioning_policy_contract.test.cjs tests/arena_overhaul_visual_contract.test.cjs tests/keeper_glove_action_art_contract.test.cjs`: **26/26** passed. The full test run also includes the 16/16 version-policy suite.
- `python tests/online_account_ui_browser_qa.py`: passed with mocked OIDC/API/WebSocket boundaries. It exercises archived standings/fixtures, Career season/CPU fixture flow, purchase retry, a committed lineup save with a dropped response and identical-key retry, PVP lineup ticket binding, four-action input, reward settlement, offline-save preservation and accessible statuses.
- `git diff --check` passed; Git emitted existing working-copy line-ending notices.

## Remaining gates

This is a local candidate, not deployed. There was no live PostgreSQL, OIDC tenant, public service, two-device/network acceptance, load/abuse trial, backup/restore drill, match reconnect/recovery, exact-head CI, protected promotion, or hosted smoke. The owner will provide hosting later. PVP currently uses single-process matchmaking; Career uses server CPU rather than human opponents. No real-money purchase option is enabled. Offline play and saves remain independent.
