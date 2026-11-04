# Candidate 0.12.74 validation — 3 November 2026

## Changes

- Career and Cup slot buttons keep their existing visible labels/actions and now announce the action plus slot number to assistive technology.
- General save export reads each raw known storage value and stops with the affected section named if it cannot be read or parsed. It leaves local bytes untouched and does not download a partial backup.
- LAN pending join IDs are namespaced by room internally, preserving the existing wire request ID; a request/decision cannot collide across rooms. Guest input expiry is emitted once per accepted input sequence and resets on fresh input or leave.
- Removing an unassigned Player Studio keeper defense ability is a no-op. It neither marks a pristine edit dirty nor synthesizes a defense level from unverified stats. Existing explicit legacy level data is retained when a real ability is removed.

## Validation

- `npm run test:node`: **1,873/1,873**; UTF-8 build and 32-club fixture passed.
- `python -X utf8 scripts/validate_data.py`: **223 teams, 2,676 player slots, 84 avatar presets**, no errors.
- Release/version policy contract: **16/16**.
- Focused Career/Cup slot action, save export/import, LAN namespace/expiry and keeper defense regressions pass; the keeper UI and save backup flows also pass desktop and simulated-touch Chromium checks.
- Four-shard portable Chromium census discovered 207 scripts and completed **205 PASS, 1 FAIL, 1 TIMEOUT, 0 ERROR**. The single graphics-integration timeout passed **19/19** when rerun alone. The single save-roundtrip script failed only on a canceled Playwright download path after its desktop leg passed; an isolated rerun passed on desktop and simulated touch. See [shard results](qa_runs_012740_browser_20261103/README.md). Do not treat this as a clean 207/207 shard census.
- `git diff --check` passed. Line-ending normalization warnings are pre-existing working-tree noise.

Exact-head CI, hosted deployment, real-device, real-network/two-device, and owner visual acceptance remain separate. The .73 graphics script timeout history is recorded separately in [candidate .73 evidence](CANDIDATE_012730_VALIDATION_20261103.md).
