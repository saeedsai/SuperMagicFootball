# Candidate 0.12.81.57 validation

**Status: local candidate; full local build/Node/data and release/version validation passed. Exact-SHA CI and hosted gates remain unrun.** Match HUD accessibility now announces which player is controlled, with that player's current Energy, after a stable selection change. A 280 ms stability window suppresses transient selection churn; the polite live region stays unchanged during normal Energy refreshes. Local match start and a newly matched online game reset the announcement state. No gameplay input, player selection, Energy, simulation or save state is changed by announcements.

## Acceptance criteria

- Keep the Energy meter's accessible name/value live and consistent with the visible HUD.
- Announce a selected-player change once after it remains stable; do not announce every ordinary Energy update.
- Keep the status region polite, atomic, screen-reader-only, and compatible with local and online match startup.
- Verify both desktop and simulated-touch match HUDs; retain physical screen-reader and device acceptance as a separate gate.

## Validation

- `python3 scripts/build.py` passed: **5,224,691 JS / 5,347,987 HTML characters** (final release/cache metadata build).
- `python3 tests/stats_browser_qa.py` passed on desktop and simulated-touch mobile. It verifies the Energy meter role/value, polite atomic status region, one live announcement for each stable player switch, and no live-region mutation from subsequent Energy changes. Screenshots were written to a temporary QA directory to avoid overwriting existing workspace evidence.
- `node --test tests/versioning_policy_contract.test.cjs` passed **16/16**.
- `npm run test:node` passed the final candidate build (**5,224,691 JS / 5,347,987 HTML characters**), Node **2,309/2,309**, and Club26/FC27 parity.
- `git diff --check` and exact-SHA GitHub/Pages gates remain to be recorded after the candidate diff is frozen.

## Remaining acceptance

- Exact-SHA Full Regression Census and Modular QA, protected promotion, Pages deployment, hosted smoke and main Census remain unrun for .57.
- Physical screen-reader testing and Android/iOS acceptance remain open; no owner visual/gameplay approval is implied.
