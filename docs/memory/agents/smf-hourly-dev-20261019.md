# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.267 — AI-THIRD-MAN-DOUBLE-MARK-01:** when two distinct eligible central runners remain unmarked in the defending third, a second available CPU defender can receive a separate goal-side mark. The second pair must be within 34 score points of the best and at least 88 units from its target lane; defenders/runners are unique. Primary press, support cover, human/committed exclusions and single-runner fallback remain authoritative.
- Gameplay implementation updates `src/modules/ai.js` and the real `driveAI` assignment in `src/modules/engine.js`; mirrored Node and desktop/simulated-touch Chromium acceptance cover both goals, distinct targets and overlap fallback. Exact-head CI pending.
- **0.12.81.266 main-promoted:** Modular QA #45413176275 and dev Full Regression Census #45413176067 passed on SHA `b0b5641b88b56b7d8915e5944a2edc2455e37c53`; the existing QA-gated promotion advanced main/dev to that SHA. Pages #45414997006 succeeded. Main Census #45415010070 had one 45-second timeout in `lan_render_hosted_browser_qa.py`; failed-job-only retry requested.
- New candidate release metadata is synchronized to About-only .267, including package, README heading/banner, version policy, service-worker cache and master backlog.

## Next smallest action
Verify .267 exact-head Modular QA and four-Node/four-Chromium Full Regression Census. Fix confirmed failures only, then continue the next unblocked player-facing gameplay increment; promote only a fully green exact head through the existing QA-gated pipeline and independently verify Pages, main Census and hosted bytes.

## Ownership and exclusions
Preserve 223 original teams, 2,676 player identities/order and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied graphics. New Studio art requires provenance, game-scale QA and owner acceptance. Physical two-phone #48 and Render drift #86 remain open; do not claim device or hosting acceptance.

## Evidence
- .266 dev Modular QA #45413176275 passed; dev Census #45413176067 passed preflight, preview, four Node and four Chromium shards; automatic QA-gated promotion succeeded.
- .266 Pages deployment #45414997006 succeeded. Main Census #45415010070: hosted smoke, preflight, preview, all four Node shards and three browser shards passed; one browser shard failed only the 45-second hosted LAN page wait and a failed-job-only retry was requested.
- Repository REST reports both `dev.protected=false` and `main.protected=false`; #87 remains an unresolved security issue. No protection bypass or manual promotion.
- Local `git clone` could not resolve `github.com`; connected GitHub source/API is used for inspection and commit. Local Node/Chromium execution is not available in this run; exact-head Actions are the verification gate.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Never bypass CI, security or QA promotion.
