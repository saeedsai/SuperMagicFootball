# Career Transfer Market — 320×568 touch acceptance

## Acceptance criteria

- The market search, role filter, sort control, outgoing-player selector, quote, listing panel, and candidate rows fit horizontally inside a 320px viewport; page and body do not overflow horizontally.
- A selected candidate remains selected with an unchanged quote while filtering to that player and sorting.
- Confirm and Cancel have unique accessible button names and are at least 44 CSS pixels high; each can be scrolled into the visible viewport.
- Cancel leaves Career memory, persisted save bytes, and storage-write count unchanged.
- Confirm changes the roster and budget, persists the result, and leaves exactly 12 unique player IDs.
- No browser page errors.

## Validation

Dedicated browser regression `tests/career_market_320_touch_browser_qa.py` passed against the rebuilt modular fixture through `tests/browser_runner_compat.py`:

- 320×568 touch emulation: no document/body horizontal overflow or page errors; the market search, filters, sort control, outgoing player, quote and listing stayed within the viewport width.
- Selected-player quote survived search/role filtering and price sorting. The visible listing row remained inside its panel.
- Confirm measured **45px** high and Cancel **44px** high; both accessible names were unique and both buttons were scrolled into the visible viewport.
- Cancel preserved exact Career JSON, storage bytes and write count. Confirmation applied the fee/credit, persisted the Career, and retained **12 unique player IDs**.
- Existing market browse and transfer quote Chromium checks also passed on desktop and simulated touch. Focused Career market/quote/ID-integrity Node tests pass **16/16**.
- No product UI correction was needed at this viewport.

Screenshots: [market top](CAREER_MARKET_320_TOUCH_TOP_20261103.png), [search/filter/listing](CAREER_MARKET_320_TOUCH_LISTING_20261103.png), and [confirmation controls](CAREER_MARKET_320_TOUCH_CONFIRM_20261103.png).

## Scope limits

This is local Chromium touch emulation at 320×568. It does not claim physical-device acceptance. It adds no player/club data and no Career progression rule.
