# UX-101 Create Club placeholder contrast

Date: 2026-11-02

## Change

Create Club's `#clubName` placeholder was rendered at `rgb(117, 117, 117)` on
the dark `rgb(13, 37, 84)` control surface, a contrast ratio of **3.23:1**.
That fell below the 4.5:1 target for ordinary text. The shared input and
textarea placeholder rule now uses `#b4d5eb` at full opacity, measuring
**9.69:1** on the same surface. The forced-colors rule sets placeholder text
to the system `CanvasText` color at full opacity.

## Validation

- `node --test tests/ux101_placeholder_contrast.test.cjs` — 2/2 assertions passed
  for the light theme color and forced-colors system text rule.
- `python3 scripts/build.py` — generated the inherited browser fixture.
- `python3 tests/browser_runner_compat.py tests/ux101_text_contrast_browser_qa.py`
  — passed on desktop and simulated touch. The Create Club placeholder measured
  **9.69:1** on both; the existing Home, Settings, Help, HUD, and touch-control
  contrast checks also passed.

The browser check uses the generated app fixture and Chromium computed styles;
it does not claim review on physical devices or assistive technology.
