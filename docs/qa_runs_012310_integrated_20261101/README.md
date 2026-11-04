# SuperMagic Football 0.12.31.0 — local integration evidence

Run on the current local integration on 1 November 2026. This is a development candidate, not a deployed or device-certified build.

## Results

- Before the latest Player Studio gallery focus fix, `npm run test:node` passed **1,545/1,545**, and the independent Node census passed **393/393 scripts** across four shards. Those full gates need rerunning on the final combined tree. Per-shard reports are in [`../qa_runs_012310_node_20261101`](../qa_runs_012310_node_20261101/).
- After the gallery focus fix, focused Node and FIX-UI-101 coverage passed **6/6**; desktop/simulated-touch Chromium acceptance passed. Settings → Game Settings route-focus Chromium acceptance also passed on both profiles.
- Earlier data validation (**223 teams, 2,676 player slots, 84 avatar presets**) and the **216 complete tournament campaigns** remain applicable; this candidate added no roster or tournament runtime changes.
- UX26/UX27 acceptance remains green on desktop and simulated touch for controls help, accessible zoom, fullscreen-dialog focus, rendering-quality persistence, and the Settings → Game Settings heading/Back focus path. The latest route change also has focused Node coverage.
- Read-only [Arsenal](../RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md), [Bayern](../RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md), and [Barcelona](../RATING_TIER_BATCH_AUDIT_BARCELONA_20261101.md) audits cover 36 official EA player pages. They found 126/216 same-name leaf-stat observations, 90 unresolved canonical mappings, four Bayern detailed-position mismatches and one Barcelona broad-position mismatch. No roster fields changed and no tiers were assigned.

## Scope and remaining gates

No new concept graphics or AssetStudio edits were made. The current-head broad browser census remains incomplete: the default runner selected a Linux Chromium path on Windows, and a portable four-shard run timed out during concurrent Chromium startup. Four affected scripts passed individually after retry; this does not establish a full browser census. A persistent Chromium-process restart check for Career/Cup backups also stalled and was removed without a passing result; same-origin page-reload tests remain green. Exact-head CI, protected promotion, hosted Pages verification, physical input/device acceptance, the full route/Back focus matrix, field-based gameplay practice, and art approval remain separate gates. Real two-client LAN acceptance also remains open.
