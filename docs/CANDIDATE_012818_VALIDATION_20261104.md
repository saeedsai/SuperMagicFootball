# Candidate 0.12.81.18 validation — 4 November 2026

## Change

Career league-round validation now verifies the current club is included, member IDs are safe and unique, every match is a distinct pair, no club appears twice, and all members occur exactly once before advancing. The standalone Career API and modular game API stay aligned. Corrupt or incomplete fixture data is rejected before saved results, cash, roster progress, standings, or history can change. No save schema or roster identity changes were introduced.

The AssetStudio scalp-highlight iteration remains rejected and unintegrated. The previous CLI trial was structurally valid but changed no pixels at 64px gameplay scale. A larger visual fix requires a clean anatomical scalp mask/source-faithful scalp reconstruction; the current geometric/alpha split operations and manual paint path risk covering brows, eyes, or remaining hair. Source project and modules remain preserved. See [rejected trial](../../references/analysis/player_master_pilot/animation_three_module_pilot/run05_source_locked/iterations/run05_headline_trial_20261104_v02/README.md).

## Validation

Candidate-specific results:

- `python -X utf8 scripts/build.py`: passed.
- `node --test tests/career_*.test.cjs tests/career.mjs`: **193/193**.
- `node --test tests/*.test.cjs`: **1,957/1,957**.
- Career season archive, season review, backup/restart, and malformed-history Chromium flows: **4/4 scripts passed**. The season review covers explicit rollover and slot/mirror persistence; the history route verifies malformed legacy history is safely skipped.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs`: **21/21**.
- Scoped `git diff --check`: passed.
- Parallel LAN integrity audit: protocol, adapter, live match, snapshot, reconnect, and peer connection checks passed **149/149**; no additional safe input/state defect was found. Real RTCDataChannel close/recreation across two physical devices remains unverified.
- Parallel shot-impact VFX review found the existing launch, down, get-up, spiral-eye and orbiting-bird reactions already cover the requested states. Eight focused Node visual tests and actual-renderer Chromium coverage for nine poses × eight headings pass with no state mutation or page errors; no duplicate renderer change was made.

## Acceptance limits

Candidate `.81.17` passed the local full Node suite (1,957/1,957) and four-shard Chromium census (228/228). The 228/228 census is historical and does not certify `.81.18`; the four focused Career Chromium flows above are the current candidate browser evidence. Exact-head CI, hosting, physical-device/screen-reader acceptance, owner visual approval, protected promotion, and server readiness remain unverified.
