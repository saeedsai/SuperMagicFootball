# 0.12.44.0 local integration evidence

**Date:** 2 November 2026  
**Candidate:** `0.12.44.0`  
**Base:** local worktree on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`; changes are uncommitted and were not promoted or deployed.

This evidence covers the `.44` candidate fixture built before subsequent `.45` LAN source edits. The browser census and save-origin restart test ran against the generated `.44` game fixture.

## Candidate changes

- VIZ-04 kit status/swatch updates preserve focus after manual Home/Away changes; applying the recommendation returns focus to Home.
- VIZ-05 Player Studio equipment guidance uses source-verified canonical tiers and does not imply that OVR alone unlocks equipment.
- VIZ-06 keeper catch/hold ball rendering aligns the ball with the gloves; a released ball uses its physics position.

## Validation

- `npm run test:node`: **1,576/1,576** passed; roster footer confirmed 32 clubs and 384 player slots.
- Independent Node regression census: **404/404** across four shards; non-overlap audit passed in [`node_independent/audit.json`](../qa_runs_012440_node_independent_20261102/audit.json).
- Portable Chromium regression census: **160/160** across four shards, with zero failures, timeouts, errors, or unrun scripts; non-overlap audit passed in [`browser/audit.json`](../qa_runs_012440_browser_20261102/audit.json).
- Data validation: **223 teams, 2,676 players, 84 avatar presets**, zero errors; see [`data-validator.json`](data-validator.json).
- SAVE-103 persistent-origin restart check: **8/8** desktop and simulated-touch scenarios passed across occupied and empty-active Career/Cup vaults. Each scenario closed Chromium, stopped/restarted the static app server at the same origin, relaunched the persistent profile, verified restore/no-resurrection behavior, and compared exact vault and legacy-mirror bytes. See [`tests/save_origin_restart_browser_qa.py`](../../tests/save_origin_restart_browser_qa.py).
- Focused `.44` VIZ-04 keyboard-focus checks, keeper hold/release rendering checks, and verified-tier Studio policy checks passed before the integrated census.
- `git diff --check` passed; Git emitted only its existing LF-to-CRLF working-copy notices.

## Remaining acceptance

This is local source-tree validation. Exact-commit CI, protected promotion, Pages/hosted-byte checks, human perceptual/owner art approval, physical Android/iOS/controller checks, and real two-device LAN loss/reconnect acceptance remain open. No art approval, deployment, or server readiness is claimed.
