# Candidate 0.12.81.32 — local validation (4 November 2026)

## Scope

Online Ultimate Team now has a playable lineup builder over the authenticated account service. Each owned base team provides its canonical roster; separately purchased canonical players can fill compatible role slots. A lineup contains exactly twelve unique player IDs. The service validates team/player ownership, canonical IDs and slot roles, saves with optimistic versions and idempotency, and attaches the saved lineup to one-use Career/PVP tickets. The authoritative simulation resolves those IDs to shipped player assets and stats. Native-team roster entries are included in collection results with `acquiredAt: null`; a team-derived player cannot be purchased a second time. Local squad copy and offline saves remain separate.

## Validation run

- `npm run test:node`: build passed (**5,124,896 JavaScript / 5,247,268 HTML characters**); **2,171/2,171** Node tests passed; club runtime integrity fixture passed (32 clubs, 384 player slots).
- Focused online API/client, UT store/lineup, matchmaking, engine, snapshot client/renderer and WebSocket suites: **133/133** passed. These use an in-memory transaction fake, not PostgreSQL.
- `node --test tests/versioning_policy_contract.test.cjs tests/arena_overhaul_visual_contract.test.cjs tests/keeper_glove_action_art_contract.test.cjs`: **26/26** passed; the full Node run also passes the 16/16 version-policy tests.
- `python tests/online_account_ui_browser_qa.py`: passed with mocked OIDC/API/WebSocket services. It exercises server Career seasons and CPU fixtures, UT purchase retry, role-checked lineup edit/save, PVP four-action inputs and ticket-bound roster use, match rewards, offline-save preservation, and accessible status announcements.
- `git diff --check` and focused Node syntax checks passed. Git emitted only its existing LF-to-CRLF working-copy notices.

## Remaining gates

This candidate is local and not deployed. No live PostgreSQL, OIDC tenant, public service, real-network/two-device play, load/abuse trial, database backup restore drill, reconnect/recovery behavior, exact-head CI, protected promotion, or hosted smoke was tested. The owner will supply hosting later. No real-money purchase option is enabled. Online Career currently uses server CPU for its eight-fixture season; server-to-server human Career competition is not implemented. Offline play and saves remain independent.
