# Career transfer review screen — 3 November 2026

## Change

Career transfer purchases now use an in-game review page instead of browser-native confirmation and alert dialogs. The review names the incoming and outgoing players, roles, OVRs, the full purchase fee, outgoing sale credit and projected post-swap budget. A polite live region repeats the projected balance and explains that confirmation saves the transfer; Cancel returns to the market without changing the squad or funds.

The confirmation action recalculates the quote before mutation, purchases against a cloned Career, and commits the active Career slot before updating the compatibility mirror or live Career reference. If the slot write fails, the live Career remains unchanged. If only the mirror write fails after the authoritative slot commit, the review reports that exact state instead of claiming the transfer was lost.

## Validation

- `python -X utf8 scripts/build.py` — passed.
- `node --test tests/career_transfer_quote.test.cjs tests/career_transfer_id_integrity.test.cjs tests/career_purchase_atomicity.test.cjs` — **17/17 passed**.
- `node --test tests/career_*.test.cjs` — **170/170 passed**.
- `python -X utf8 tests/career_transfer_quote_browser_qa.py` — desktop and simulated-touch browser flows passed. Both cover live quote updates, named incoming/outgoing review, Cancel without changing roster/budget, successful confirmed transfer, unchanged twelve-player limit, and no browser errors.
- Desktop and simulated-touch review screenshots were visually inspected at `evidence/browser/career_transfer_review_desktop.png` and `evidence/browser/career_transfer_review_simulated-touch.png`.
- `git diff --check` on the scoped source, tests, and evidence — passed.

## Limits

No new transfer pricing, sale-credit, player-rating or roster-identity rules were introduced. Browser tests use simulated touch, not a physical device; no deployment or owner visual acceptance is claimed.
