# Supermagic Football — Clean Handover v0.8.22.1 Alpha

**Current baseline: v0.8.22.1 (14 October 2026)**. This is a stripped, self-contained development package, not an old release archive.

Start with **`HANDOVER_README.md`**, then **`NEXT_CHAT_PROMPT.md`**. The current overall roadmap is `docs/NEXT_MILESTONES.md` and acceptance catalog is `docs/MASTER_QA_TEST_CASES_v08221.csv`.

## Run
- Open `play.html` in a recent browser to play offline.
- `npm run build` regenerates the single-file portable game from `src/` and `style.css`.
- `npm test` runs the current inherited Node gameplay regression chain (54 scripts).
- `node tests/master_contracts.mjs` verifies metadata and the 357-case catalog contract.
- Browser tests require Python Playwright and a locally available Chromium. To avoid timeouts, execute six sequential bounded shards, one at a time (see handover guide).

## Included
- `src/` all editable engine, UI, team, roster, BPW, save and control modules.
- `index.html`, `style.css`, `play.html`, PWA manifest, icons and service worker.
- `tests/` executable Node and browser tests plus master QA runner and build script; no generated screenshots or old upgrade scripts.
- `docs/` only current test catalog, current QA evidence, roadmap, important active/future feature specifications and essential requirement trackers.
- Latest changelog/test report and a handover plan; no historical release artifacts, old audit snapshots or development logs.

## Release limitations
54/54 Node and 34/34 distinct browser scripts passed in the original v0.8.22.1 release. Browser results were collected in six bounded shards, not a single uninterrupted run. 357 documented acceptance cases **are not** 357 individually executed tests. Physical Android, iOS, gamepad and Safari/Firefox certification remain open.

2026 roster cleanup is **explicitly deferred**. Next major milestone: **v0.8.23 original/license-cleared music and sound effects**.
