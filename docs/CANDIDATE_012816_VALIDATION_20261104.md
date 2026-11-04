# Candidate 0.12.81.16 validation — 4 November 2026

## Change

SAVE-103 now requires any nonempty Cup group metadata to partition every tournament participant exactly once. League fixtures must contain two distinct members of the same group. Empty grouping metadata remains compatible with legacy saves and placeholders.

An isolated AssetStudio Run05 scalp-highlight trial is recorded as **rejected**, not integrated. The source and three modules were preserved. Both trial and baseline passed Studio review and the game-side structure validator, but the assembled render changed only 42/1,048,576 pixels at 1024px (maximum channel delta 1) and was identical at 64px. See [trial report](../../references/analysis/player_master_pilot/animation_three_module_pilot/run05_source_locked/iterations/run05_headline_trial_20261104_v02/README.md).

## Validation

- `node --test tests/cup_*.test.cjs`: **78/78**.
- Cup plus release/version contract validation: **99/99**.
- `python -X utf8 scripts/build.py`: passed.
- `node --test tests/*.test.cjs`: **1,957/1,957**.

## Acceptance limits

The latest audited, complete four-shard browser census (**227/227**) before candidate `.81.16` was `.81.12`. A fresh `.81.16` attempt discovered **228** scripts: **227 passed, one failed** (`ux26_rotate_prompt_focus_browser_qa.py`, landscape auto-hide focus restoration). Candidate `.81.17` now fixes the stale-target path and its focused Chromium flow passes. The `.81.16` four-shard Node runner also encountered two 75-second timeouts in whole-match Super Shot diagnostic scripts and one stale morale assertion capped at five despite 25 authored poses; the bound is corrected in `.17`, and the standalone reaction check passes. The normal full Node test suite still passed 1,957/1,957. Exact-head CI, hosting, physical-device acceptance, owner visual approval, protected promotion, and server readiness remain unverified.
