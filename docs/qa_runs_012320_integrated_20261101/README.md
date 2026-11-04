# SuperMagic Football 0.12.32.0 — local integration evidence

Run on the current local tree on 1 November 2026. This is a development candidate, not a deployed or device-certified build.

## Results

- `PYTHONUTF8=1 npm run test:node` passed **1,546/1,546 Node tests**, then the 32-club / 384-slot club roster validation passed. On Windows, the initial `npm run test:node` attempt failed before testing because Python defaulted to cp1252; setting Python UTF-8 mode resolved that runner issue.
- Follow-up focused acceptance for Career lineups, UX26 gallery focus, FIX-UI-101 route guard, and version policy passed **43/43** Node tests. The route guard expectation now includes the Career-specific return route.
- Career-specific helpers passed **21/21**. Desktop and simulated-touch browser assertions passed for no-write preview, explicit plan save, Career roster preservation, and saved lineup use at kickoff. The Playwright runner hung while closing Chromium after both PASS results and was interrupted; clean browser-process exit was not verified.
- Player Studio gallery Escape focus passed focused Node/FIX-UI-101 coverage **6/6** and desktop/simulated-touch Chromium acceptance. Settings → Game Settings heading focus and Back restoration also passed desktop/simulated-touch Chromium acceptance.
- Earlier independent Node census passed **393/393** across four shards on 0.12.31.0. It has not yet been rerun on the final 0.12.32.0 tree. Earlier data validation (**223 teams, 2,676 player slots, 84 avatar presets**) and **216 complete tournament campaigns** remain applicable; this increment changed no roster, data or tournament runtime.
- Four read-only EA FC27 roster audits cover [Arsenal](../RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), [Bayern](../RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), [Barcelona](../RATING_TIER_BATCH_AUDIT_BARCELONA_20261101.md) and [Manchester United](../RATING_TIER_BATCH_AUDIT_MANCHESTER_UNITED_20261101.md) (48 player pages): 168/288 same-name leaf observations and 120 unresolved canonical mappings. Roster values and tiers were not changed.

## Remaining gates

The full independent Node census and broad browser census need a clean exact-tree rerun. Current broad-browser evidence remains incomplete after Chromium startup timeouts; individual focused browser checks pass. Exact-head CI, protected promotion, hosted Pages verification, real physical-device input/performance/audio, two-device LAN acceptance, full route/Back focus matrix and owner art approval remain separate. No new concept graphics or AssetStudio edits were made.
