# Candidate 0.12.81.25 validation — 4 November 2026

## Changes

- Keeps the larger 17-unit normal match-ball drawing scale introduced in `.24`.
- Gives Player Studio a full viewport width and tighter padding at widths up to 380px. This fixes its hidden horizontal overflow on Linux Chromium at 320×568 while keeping the existing controls, accessible names, and touch target sizes.
- Installs the declared `ws` runtime dependency in the clean preflight and legacy Node shard jobs, so LAN contracts can run in fresh CI checkouts.
- Uses bounded per-script limits of 600 and 900 seconds for the 108-match and 192-match Super Shot CPU diagnostics, respectively. All other regression scripts retain the existing 35-second default; neither diagnostic is skipped.
- Removes hardcoded Windows Chrome paths from the corner restart and free-kick browser tests. They use the Playwright-managed browser in CI and honor `SMF_CHROMIUM_PATH` for local runs.

## Validation

- `python -X utf8 scripts/build.py` — passed; bundle contains **4,997,137 JavaScript characters** and **5,118,999 HTML characters**.
- `node --test tests/*.test.cjs` — **1,964/1,964 passed**.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21 passed**.
- `node --test tests/arena_overhaul_visual_contract.test.cjs tests/arcade_match_ui_visual_contract.test.cjs tests/player_studio_control_groups.test.cjs tests/viz05_studio_gamepad_navigation.test.cjs` — **14/14 passed**.
- Chromium at 320×568 simulated touch — Player Studio retains 17 named selectors, 44px touch targets, fieldset bounds, and no page or menu horizontal overflow.
- Corner-restart Chromium QA passes on desktop and simulated touch; free-kick restart Chromium QA passes on desktop and simulated touch. Both use the local `SMF_CHROMIUM_PATH` override.
- The regression-runner contract verifies the two long diagnostics receive 600-second and 900-second caps; all other scripts keep the default timeout.
- Exact-head CI for release commit [`d13de7faebe5bc6c00003c1abfb71b410ff5eb28`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41838720583) passed preflight, all four Node shards, all four browser shards, and desktop/simulated-touch HTTP preview. The protected workflow fast-forwarded this exact SHA to `main`.
- Main-branch verification run [`41840015534`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41840015534) passed all regression shards and hosted Pages smoke. The smoke confirmed exact HTML, JavaScript, and CSS bytes from the released `main` at [GitHub Pages](https://saeedsai.github.io/SuperMagicFootball/).

## Remaining acceptance

Deployment is verified by exact-SHA promotion and the hosted Pages byte comparison. Owner visual acceptance and physical-device checks remain separate evidence gates.
