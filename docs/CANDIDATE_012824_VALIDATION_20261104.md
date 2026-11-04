# Candidate 0.12.81.24 validation — 4 November 2026

## Change

The normal in-match ball is now drawn at the same 17-unit scale as the penalty ball. The larger visual rendering makes the existing panel pattern and seams easier to read during play. Ball physics, simulated position and velocity, collision, saved cosmetics, and the intentionally attenuated hidden-ball path are unchanged.

## Validation

- `node --test tests/game_ball_surface_render.test.cjs tests/shot_vfx_02_country_ball.test.cjs` — **13/13 passed**, including the 17-unit in-match visual scale and unchanged simulated ball state.
- `python -X utf8 scripts/build.py` — passed; bundle contains **4,997,137 JavaScript characters** and **5,118,716 HTML characters**.
- `node --test tests/*.test.cjs` — **1,964/1,964 passed**.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21 passed**.
- Actual-renderer Chromium QA passed with the capture set to the candidate's real 17-unit in-match scale. See [ball comparison](BALL_SURFACE_MATCH_SCALE_20261104.png); this generated evidence is not owner visual approval or device acceptance.
- Candidate `.24` four-shard browser attempt selected all 229 scripts but had 227 pass, one focus assertion fail and one 55-second save/restart timeout under parallel load. Both affected scripts passed isolated retries; this is not a clean full census. See [attempt and retry evidence](qa_runs_012824_browser_20261104/README.md). Candidate `.23` previously passed an audited full census (229/229), documented [here](qa_runs_012823_browser_20261104/README.md).

## Remaining acceptance

Exact-head GitHub Actions exposed workflow setup defects: both preflight and the separate historical Node shards invoked LAN tests before installing the manifest's `ws` dependency. The workflow now installs declared production dependencies in both clean job types, matching the existing browser-job setup. The first preflight fix passed preflight and preview smoke; a later dependency setup fix for isolated Node shards is awaiting a fresh exact-head run. Hosted smoke, physical-device or owner acceptance, protected promotion, and deployment remain unverified until every gate passes.
