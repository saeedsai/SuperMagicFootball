# Candidate 0.12.81.36 — local validation (4 November 2026)

## Scope

- Online match-history paging is single-flight; repeated activation while a request is pending does not issue another API request.
- Overlapping pages are merged by immutable match ID, so a duplicate row cannot appear twice.
- Signing out invalidates in-flight history responses and clears the controller. A delayed response from the previous account cannot repopulate the displayed collection.
- The history panel marks itself busy, disables paging actions during a request, announces loading/result/error status, and leaves failed loads retryable.
- Offline matches, local saves, roster choices and rewards are unchanged.

## Validation run

- `python scripts/build.py`: passed; generated fixture size **5,138,528 JavaScript / 5,261,540 HTML characters**.
- `node --test tests/online-history.test.cjs tests/versioning_policy_contract.test.cjs tests/online-account-client.test.cjs tests/online-account-api.test.cjs`: **82/82 passed**.
- `python tests/online_account_ui_browser_qa.py`: **PASS**; the existing mocked PKCE/API/WebSocket integration covers Career, match history, UT, PVP, reward, offline-save preservation, four-action input and accessible status.
- `npm run test:node`: full Node suite **2,192/2,192 passed**; build passed and the club runtime fixture passed (32 clubs, 384 player slots).
- No live identity provider, public API, real PostgreSQL, two-network match, physical-device check, or exact-head GitHub CI was exercised for this candidate.

## Regression follow-up

- Exact-head GitHub run [41915157102](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41915157102) found two stale browser-test expectations: the token-shop keyboard test skipped the newly added owned-only checkbox, and an older menu test still expected Online Career and Ultimate Team to be placeholders.
- Updated those tests to verify the filter is keyboard reachable and to exercise the now-playable Online Server Match, Online Career and Online Ultimate Team routes. Local checks pass: `python tests/token_store_keyboard_browser_qa.py` and `python tests/v08247_menu_browser_qa.py` (desktop, portrait, landscape). Follow-up exact-head run [41917324857](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41917324857) passed all four Node and browser shards, preflight and desktop/touch preview; the failed initial run is not treated as validation.

## Release and hosting status

The source is promoted to `main` at `943ee4a2b80af38dd9839eb79940951140451929`. Exact-head `dev` full regression passed in [run 41917324857](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41917324857), including all four Node and browser shards, preflight and desktop/touch preview; Modular Game Dev QA passed in [run 41917324465](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41917324465). GitHub Pages built successfully in [run 41918769510](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41918769510), and the hosted-page smoke passed in [run 41918769608](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41918769608). The site and online UI source are deployed; its `online-config.js` remains intentionally unconfigured. The authenticated online API is not deployed: it still requires a configured database, OIDC issuer/audience/JWKS, and allowed game origin. The standalone Render Blueprint is schema-validated, but no API service has been created. Documentation-only follow-ups were promoted through `1aa60f3f612d9a099796d53831ee7dfaf2d3a036`; its dev full regression [41919669742](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41919669742), Modular Game Dev QA [41919669758](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41919669758), main full regression [41921015123](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41921015123) and Pages deployment [41921015750](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41921015750) all passed. See [online server deployment handoff](ONLINE_SERVER_DEPLOYMENT.md).
