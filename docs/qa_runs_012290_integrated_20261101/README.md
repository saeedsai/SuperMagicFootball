# Supermagic Football 0.12.29.0 — local integration evidence

Run on the current local integration on 1 November 2026. This is a development candidate, not a deployed or device-certified build.

## Results

- Full local gate: `npm run test:node` — **1,543/1,543 Node tests passed**, then the 32-club/384-player-slot roster audit passed.
- Independent Node census: **392/392 passed** across four shards. Per-shard reports are in [`../qa_runs_012290_node_20261101`](../qa_runs_012290_node_20261101/).
- Data validation: **223 teams, 2,676 player slots, 84 avatar presets**, no errors.
- Continental tournament campaign suite: **216 complete campaigns passed**.
- LAN focused suite: **393/393 passed** for the 0.12.28 code batch; the later 0.12.29 changes are outside the LAN module.
- Career backup/startup/UI and Cup backup focused suites: **23/23 passed**; the tournament-state guard regression passes **1/1**.
- Transfer quote and purchase atomicity suites: **12/12 passed**.
- Service-worker offline navigation regression: **3/3 passed**.
- CT19 input routing, UX26 fullscreen focus, and UX27 render quality regressions pass; fullscreen help, Touch Control Check, and browser zoom checks passed in desktop and simulated-touch Chromium.
- `git diff --check` reported no whitespace errors; Git emitted only existing LF-to-CRLF working-copy notices.

## Scope and remaining gates

This batch did not change or create concept graphics. The Performance preset changes canvas backing resolution only; logical dimensions and gameplay hitboxes stay the same. A broad browser census remains incomplete: default mode first used a Linux Chromium path on Windows; portable four-shard mode then timed out on concurrent Chromium startup. Four affected browser scripts passed individually afterward. Exact-head CI, protected promotion, hosted Pages verification, physical input/device acceptance, and art approval remain separate gates. LAN real two-client device acceptance remains open.
