# UX-101 planned-route contrast — 3 November 2026

## Finding and change

The planned Online, International, Club and Cup entries use a dimmed treatment at rest. Their hover/focus state inherited the bright blue active-card gradient while retaining `opacity: .69`; the pale `COMING LATER` status then had only about **2.2:1** estimated contrast against the rendered hover surface. The hover/focus rule now preserves the dark planned-card gradient and restores opacity to 1. Focus remains visible with the existing cyan outline. The resting-state distinction remains intact.

## Validation

- `node --test tests/ux101_later_nav_contrast.test.cjs` — **1/1 passed**.
- `python -X utf8 scripts/build.py` — passed.
- `python -X utf8 tests/browser_runner_compat.py tests/ux101_later_nav_contrast_browser_qa.py` — passed on desktop (1280×800) and simulated touch (844×390) for Online, Leagues & Cups, International, and Club Competitions.
- The browser checks apply hover on desktop and focus-visible on the touch viewport, calculate contrast for both gradient stops, verify the card is undimmed while active, and report **8.17:1** for the planned-item status text in every route/state. No browser page errors occurred.
- Forced-colors mode and reduced motion retain their existing shared rules; this increment did not change them. Physical Windows High Contrast and device checks remain separate.
