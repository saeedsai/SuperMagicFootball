# Candidate 0.12.81.46 — local validation (5 November 2026)

## Scope

- Cup vaults now compare persisted localStorage bytes against the exact snapshot read by their tab before each write. A stale tab blocks the overwrite, leaves the newer on-disk data intact, and preserves the stale copy as an exportable recovery snapshot.
- Wet-pitch slide VFX adds a steady direction-aligned water curl and pale-cyan droplets. Dry surfaces do not receive the effect; reduced-flash lowers its opacity. Player/ball state and physics remain unchanged.

## Focused validation

- Cup stale-writer, save-slot, storage-rollback and backup-integrity tests: **27/27**. Desktop and simulated-touch `ux27_partial_save_preserves_career_cup_browser_qa.py` passed via `tests/browser_runner_compat.py`; it covers partial-import preservation, while the new two-tab stale-writer conflict is covered by the Node regression.
- Wet-spray visual contracts passed **3/3**. Actual-renderer Chromium QA sampled dry/wet/reduced-flash slides, measured 593 changed pixels for wet versus dry and 879 for the reduced-flash comparison, and reported unchanged live state with no page errors. The capture was inspected internally, not owner-approved.
- Wet-spray visual contract tests passed **3/3**. A combined coordinator run of focused Cup and wet-spray contracts passed **30/30**.
- After updating all release/version/cache metadata to .46, `npm run test:node` passed: build **5,176,981 JS / 5,299,993 HTML characters**, tracked Node suite **2,231/2,231**, and the Club26/FC27 executable passed. Release/version contracts passed **22/22** and `git diff --check` passed.

## Limits

The Cup guard prevents the reproduced stale-tab overwrite; simultaneous multi-process races and crash/recovery drills remain unverified. Wet-slide VFX was checked in Chromium only. Owner visual, accessibility and physical-device acceptance remain open. Exact-head .46 CI, promotion, Pages and main Census remain pending. This candidate does not configure an online server.
