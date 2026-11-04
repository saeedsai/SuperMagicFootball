# Shot impact and new Super Shots — 2 November 2026

## Implemented

- A ball that contacts an on-field player applies a temporary, stacking-capped weakness and movement-speed penalty for 3.2 seconds. Contact applies to either team; launched/downed players are temporarily excluded from repeated hits.
- Strong ordinary shots can confuse-stun a player for 0.5–2 seconds without launching them. The strength/force-based impact calculation also applies past the close-range launch window.
- High-force Super Shots can launch a struck player, then hold them in a grounded knockdown for 0.5–3 seconds based on impact and player strength. Recovery uses a short get-up phase. Weaker Super Shot hits use the bounded stun instead.
- Confusion and knockdown cues are renderer-only: the down pose follows the knockdown timer; confused eyes and orbiting birds follow the stun timer. Reduced-flash keeps the birds stationary.
- Added Jumping Silver Carp, Dice, Pineapple, Apple, Coconut, Orange, Strawberry, Dolphin Deep-Dive, and Wave Rider to the selectable Super Shot catalog. Bird now moves more slowly and changes its lane around an approaching defender. Carp, Dolphin, and Wave use bounded submerged windows and surface transitions; all retain the regular goal, keeper, and shot-transform rules.
- Existing Jump/Shoot Super Shot activation and tier/role equipment rules remain in use; no fifth match action was added.

## Acceptance evidence

- `python scripts/build.py` passed with UTF-8 mode.
- `npm run test:node` passed **1,745/1,745**; the required club fixture passed for 32 clubs and 384 slots.
- Focused Node shot impact, new shot paths, visual rendering, transformation lifecycle, curve, homing, ricochet, underground visuals, and gamepad access suites passed **27/27**.
- `python scripts/validate_data.py` passed: 223 teams, 2,676 players, and 84 avatar presets; zero data errors.
- `python tests/sh07_transformed_ball_browser_qa.py` passed in Chromium: all **32** manifest shot transformations rendered distinctly, the soccer-ball return transition and reduced-flash launch checks passed, and there were no page errors. Preview: [`evidence/browser/sh07_transformed_ball_preview.png`](evidence/browser/sh07_transformed_ball_preview.png).
- A separate Chromium canvas preview showed the surfaced and submerged states for Silver Carp, Dolphin, and Wave; submerged states use ripples/wakes while hiding the transformed sprite. [`evidence/browser/underground_shots_preview.png`](evidence/browser/underground_shots_preview.png)
- The wave path is bounded and mirrored and matches its sample across fixed integration steps. Live path checks cover Carp/Wave submerged and surface phases, Dolphin surfacing near goal, and Bird's speed/lane change. Impact checks cover friendly and opposing contact while both teams attack, plus strong normal and Super Shot behavior.

## Limits and follow-up

This is local source/build/test evidence. The preview is a technical renderer gallery, not owner art approval. Physical-device checks, full release gates, hosted deployment, and external two-device online checks have not been performed for this candidate. Shot balance still needs playtesting; timing and stacking are deliberately bounded. The Keeper projection now skips submerged intercept windows and resumes prediction after surfacing.
