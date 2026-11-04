# Candidate 0.12.81.35 — local validation (4 November 2026)

## Scope

- Added existing canonical team and player entries to the local token shop. Purchases are checked against the item catalog and fixed category price, then recorded in the additive local wallet.
- Added an accessible **Show owned only** filter and retained search and paging for large catalogs.
- Team/player purchases add a collection entry only. Existing team selection, player identities, rosters, Career saves, and offline gameplay remain free and unchanged. No wallet ownership check was added to gameplay selectors.
- Added regressions for valid bonus catalog purchases, insufficient balance, unchanged roster/Career bytes, and lazy wallet creation with a legacy save.

## Validation run

- `python scripts/build.py`: passed; generated fixture size **5,135,118 JavaScript / 5,258,130 HTML characters**.
- `node --test tests/economy.test.cjs tests/token_appearance_unlocks.test.cjs tests/token_reward_commit_gate.test.cjs`: **22/22 passed**.
- `python tests/token_store_browser_qa.py`: **desktop PASS, touch PASS**. Covers all six store categories, team/player purchases, wallet debit/owned state, owned-only filtering, free team selection after purchase, appearance and ability unlocks, and accessible store route.
- `npm run test:node`: build passed (**5,135,564 JavaScript / 5,258,576 HTML characters**); full Node suite **2,189/2,189** and club runtime fixture passed (32 clubs, 384 player slots).
- `python -c` JSON Schema validation of `render.yaml`: passed earlier in this candidate preparation; the Blueprint was not changed for .35.
- Exact-head CI, protected promotion, hosted browser smoke and physical-device checks have not been run for .35.

## Release and hosting status

This is a local candidate and is not pushed or deployed. The online API blueprint and free-host setup remain preparation only. Supabase Postgres, Auth0 OIDC, API secrets, public browser configuration, live network tests, backup/restore, multi-device acceptance, and deployment are still not configured. Existing choices remain offline and available without accounts. Real-money token purchases remain disabled.
