# Career transfer jersey fallback — 3 November 2026

## Change

Both modular and standalone Career transfer paths preserve shirt numbers safely when legacy/imported outgoing rows have missing or malformed `num` values. A valid outgoing number is still reused. If it is invalid, the incoming player keeps a valid number; otherwise Career selects the first unused number from 1–99. Stable player IDs, the 12-player roster, save shape, and valid legacy transfer behavior are unchanged.

## Validation

- Focused purchase/transfer tests: **19/19 passed**.
- Full Career Node suite: **179/179 passed**.
- Regressions cover missing, `NaN`, infinite, zero, negative, fractional, string, and out-of-range numbers, malformed incoming values, fallback uniqueness, and JSON serialization.
- `node tests/career.mjs`: 83-club Career scenario passed through training, transfer, Cup, league and season rollover.

Browser display review remains part of the current local page-load limitation described in the [candidate QA report](qa_runs_012620_final_20261103/README.md).
