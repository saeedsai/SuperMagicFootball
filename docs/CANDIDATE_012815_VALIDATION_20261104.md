# Candidate 0.12.81.15 validation — 4 November 2026

## Changes

- The selected player’s critical low-Breath warning is now steady in reduced-flash mode; standard mode retains its existing pulse. This is presentation-only.
- The real Super Shot input-path test now verifies that launching through the gamepad/touch/keyboard activation path applies its stamina cost and special cooldown.

## Validation

- `python -X utf8 scripts/build.py`: passed.
- Breath/Energy HUD and input focused tests: **18/18**.
- Five-file ability input/style/defense suite: **7/7** input-path Node tests; dedicated dribble-style and defensive-ability scripts passed.
- Release, versioning, Home visual, Breath HUD and Super Shot input contracts: **47/47**.
- Full local Node suite: **1,955/1,955**.
- `git diff --check`: passed; Git emitted line-ending conversion notices only.

## Acceptance limits

The last audited four-shard Chromium census, **227/227**, is from candidate `.81.12`; a full census was not run on `.81.15`. Candidate `.81.14` contains separate actual-renderer fast-pass reduced-flash evidence. This local candidate is not exact-head CI, hosted deployment, protected promotion, owner visual approval, physical-device acceptance, or server readiness.
