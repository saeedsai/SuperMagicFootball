# Supermagic Football 0.12.30.0 — local integration evidence

Run on the current local integration on 1 November 2026. This is a development candidate, not a deployed or device-certified build.

## Results

- Full local gate: `npm run test:node` — **1,544/1,544 Node tests passed**, then the 32-club/384-player-slot roster audit passed.
- Independent Node census: **392/392 passed** across four shards. Per-shard reports are in [`../qa_runs_012300_node_20261101`](../qa_runs_012300_node_20261101/).
- Data validation: **223 teams, 2,676 player slots, 84 avatar presets**, no errors; no roster data changed in this batch.
- Continental tournament campaign suite: **216 complete campaigns passed**; no tournament runtime changed in this batch.
- LAN focused suite: **393/393 passed** for the 0.12.28 code batch; no LAN runtime changed afterward.
- Career/Cup backup and recovery coverage passed **23/23**; Cup malformed-state validation passed **1/1**; transfer quote/purchase atomicity passed **12/12**.
- Service-worker offline navigation passed **3/3**; UX26/UX27 Node regressions pass, including guided Cross, fullscreen focus and render-quality persistence.
- UX26/UX27 Chromium acceptance passed on desktop and simulated touch: Touch Control Check, browser zoom, fullscreen-help focus and High/Performance selection surviving reload with unchanged logical dimensions.
- Read-only [Arsenal](../RATING_TIER_BATCH_AUDIT_ARSENAL_20261101.md) and [Bayern](../RATING_TIER_BATCH_AUDIT_BAYERN_20261101.md) rating source audits cover 24 official EA player pages and record 84/144 same-name leaf-stat observations, 60 unresolved canonical mappings, and four source/game position mismatches. They changed no roster fields and assigned no tiers.
- `git diff --check` reported no whitespace errors; Git emitted only existing LF-to-CRLF working-copy notices.

## Scope and remaining gates

No new concept graphics or AssetStudio edits were made. A broad browser census is still incomplete: default mode used a Linux Chromium path on Windows; portable four-shard mode then timed out during concurrent Chromium startup. Four affected scripts passed individually after that attempt. Exact-head CI, protected promotion, hosted Pages verification, physical input/device acceptance, full Back/focus matrix, field-based gameplay practice, and art approval remain separate gates. Real two-client LAN acceptance also remains open.
