# Token Store category search label — 3 November 2026

## Acceptance

When the player selects any Store category, the search input's visible label and accessible name must identify that active category. This keeps keyboard and screen-reader context accurate through category changes, including Teams and Players, which currently show Coming Soon.

## Change

The Store now updates the search label whenever its category selector changes. Search reset, pagination, catalog filtering, wallet state, and item availability are unchanged.

## Validation

- `python scripts/build.py`: passed; modular test fixture built (4,952,960 JavaScript characters; 5,040,047 HTML characters).
- `python tests/token_store_browser_qa.py`: passed on desktop and simulated touch. The test now checks the searchbox accessible name after selecting all six categories, while retaining its wallet, purchase, Coming Soon, and unlock checks.

## Limits

Touch behavior is browser-emulated. Physical-device and assistive-technology acceptance remain open.
