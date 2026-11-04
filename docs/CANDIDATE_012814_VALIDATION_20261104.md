# Candidate 0.12.81.14 validation — 4 November 2026

## Change

Reduced-flash accessibility now renders ordinary fast-pass streaks shorter and dimmer. Standard mode and the existing speed threshold remain unchanged; no ball-state or physics data is mutated by rendering.

## Local validation

- `python -X utf8 scripts/build.py`: passed.
- Focused Canvas renderer, ball surface, shot-form and shot-contact checks: **13/13**.
- Actual-renderer Chromium QA: **six samples** covering speeds 284, 286 and 420 in standard and reduced-flash modes. The cue is absent below threshold and present above it in standard mode; reduced-flash is shorter/dimmer; all samples preserve ball state and produce no page errors. See [quality evidence](FAST_PASS_REDUCED_FLASH_QUALITY_20261104.md).
- Release/version contracts: **19/19**.
- Full local Node suite: **1,954/1,954**.
- `git diff --check`: passed (Git reported only repository line-ending conversion notices).

## Acceptance still open

The audited four-shard browser census **227/227** belongs to candidate `.81.12` and was not rerun on `.81.14`. This validation does not establish exact-head CI, hosted deployment/smoke, physical-device acceptance, owner visual approval, protected promotion, or server readiness. The working tree is a local candidate, not an immutable reviewed release artifact.
