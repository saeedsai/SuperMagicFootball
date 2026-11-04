# Candidate 0.12.81.20 validation — 4 November 2026

## Change

Added a fine seam outline around the classic match ball's center pentagonal panel. The hub now has the same visible stitched boundary as its five surrounding panels at gameplay scale. This changes only Canvas rendering; radius, rotation, collision, physics, selected cosmetic, saved data and the older-Canvas fallback are unchanged. Existing Home/menu and player art remain untouched.

## Validation

- `node --test tests/game_ball_surface_render.test.cjs tests/ability_shot_ball_shapes.test.cjs tests/shot_vfx_02_country_ball.test.cjs` — **16/16 passed**.
- `python -X utf8 scripts/build.py` — passed (4,994,255 bundled JS characters; 5,115,834 HTML characters).
- `node --test tests/*.test.cjs` — **1,958/1,958 passed**.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21 passed**.
- `python -X utf8 scripts/validate_data.py` — passed, 223 teams, 2,676 players and 84 avatar presets; zero errors.
- `python tests/game_ball_surface_render_browser_qa.py` — actual renderer passed; 3 ball models rendered, classic match radius remained 20 in that fixture, with ground/low/high/max-height shadow captures and no browser errors.
- `git diff --check` — passed; Git emitted only the workspace's LF-to-CRLF notices.

The clean four-shard portable Chromium census discovered and passed **229/229** browser scripts; the cross-shard auditor verified exact nonoverlapping coverage. See [browser census evidence](qa_runs_012820_browser_20261104/README.md). This local candidate is not deployed. Owner visual approval, physical-device acceptance, exact-head CI, hosted smoke and protected promotion remain separate gates.
