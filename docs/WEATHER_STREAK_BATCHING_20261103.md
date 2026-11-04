# Weather streak batching — 3 November 2026

## Change

Rain, storm, wind and tornado precipitation now batches streaks by their existing five depth bands. Geometry, band opacity, width, field clipping, particle counts and reduced-flash behavior stay the same. The renderer draws Rain's 220 streaks with five stroke calls instead of 220. Sparse rain ripples remain a separate deterministic layer.

This is a rendering-work reduction only: it does not alter weather event timing, gameplay forces, player/ball state or random streams.

## Acceptance and validation

- `node --test tests/weather_02_events.test.cjs tests/stadium_02_crowd_silhouettes.test.cjs`: **5/5 passed**. Contracts cover five depth batches, deterministic source geometry, ripple cadence, field clip, bounded event physics and reduced-flash behavior.
- `python -X utf8 tests/weather_02_events_browser_qa.py`: **10 scenarios passed**, including lightning/tornado at 30/60/120 Hz, reduced-flash previews, and a canvas-pixel scan outside all four pitch edges. Measured weather stroke budgets: normal Rain **25** (five streak batches + twenty ripples), reduced-flash Rain **14** (five batches + nine ripples), Wind **5**. No browser errors.
- Visual preview: `evidence/browser/weather_02_render_preview.png`; visually inspected after batching.

This confirms local renderer behavior and operation counts; it is not device performance acceptance or owner visual approval.
