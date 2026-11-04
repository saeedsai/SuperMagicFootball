# SuperMagic Football 0.12.28.0 — local integration evidence

Run on the current local integration on 1 November 2026. This is a development candidate, not a deployed or device-certified build.

## Results

- Full local gate: `npm run test:node` — **1,538/1,538 Node tests passed**, then the 32-club/384-player-slot roster audit passed.
- Independent Node census: **389/389 passed** across four shards. Per-shard reports are in [`../qa_runs_012280_node_20261101`](../qa_runs_012280_node_20261101/).
- Continental tournament campaign suite: **216 complete campaigns passed**.
- LAN focused suite: **393/393 passed**.
- Career backup/startup/UI and Cup backup focused suites: **23/23 passed** before the Cup tournament-state guard; the new Cup guard regression passes **1/1**.
- Transfer quote and purchase atomicity suites: **12/12 passed**.
- Service-worker offline navigation regression: **3/3 passed**.
- UX26 browser checks passed in desktop and simulated-touch Chromium: Touch Control Check and browser zoom.
- Broad browser census is still pending: the four-shard run first used the Linux default browser path on Windows; portable mode then timed out during the first concurrent Chromium launch in each shard. The four affected first scripts passed when rerun individually through `browser_runner_compat.py`; they were browser startup/resource timeouts, not assertion failures.
- `git diff --check` reported no whitespace errors; Git emitted only existing LF-to-CRLF working-copy notices.

## Scope and remaining gates

This batch did not change roster data, create or edit concept graphics, or modify the SuperMagicAssetStudio project. Full browser census, exact-head CI, protected promotion, hosted Pages verification, physical input/device acceptance, and art approval remain separate gates. LAN has simulated-peer coverage; real two-client device acceptance remains open.
