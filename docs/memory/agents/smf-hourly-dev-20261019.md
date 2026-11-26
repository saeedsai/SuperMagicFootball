# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.314 — AI-THROUGH-BALL-DEFENDER-TURN-SAFETY-01:** CPU through-ball collection-pocket checks now integrate active defenders' directional input through the shared Agility-limited turn response. High-Agility defenders cutting into the pocket can close a pass that linear extrapolation left open; lower-Agility defenders retain more residual momentum. Existing 65-unit per-axis cap, 84-unit outfield reach, keeper reach, lane-pressure read and pass physics remain.
- .314 also repairs the confirmed .313 Node fixture failure: `tests/ai_support_run_pass.test.cjs` referenced an undefined `player()` helper. It now builds real GameEngine players. Mirrored Node cases cover receiver turn, defender turn, both teams and neutral/invalid fallback; actual-engine desktop/simulated-touch browser coverage is being completed. Exact-head Modular QA and Full Regression Census are pending.
- **0.12.81.313:** receiver turn-aware through-ball lead was committed but its exact-head Modular QA/Census failed on the isolated test fixture, not a demonstrated production gameplay assertion. The fixture is corrected in .314.
- **0.12.81.312:** exact-head Modular QA #45735628419 and Full Regression Census #45735628479 passed; QA-gated promotion advanced main/dev to SHA d393edda4cb62a286b41a79168aa9dc8a1b8779c. Pages #45736982837 passed; independent main Census #45736990591 has preflight, hosted smoke, preview, all four Chromium shards and three Node shards passed; final Node shard was still running at last check.
- GitHub reports main.protected=false, dev.protected=false and no rulesets; #87 remains open.

## Next smallest action
Complete the mirrored actual-engine desktop/simulated-touch defender-turn regression, then finish .314 exact-head Modular QA and four-Node/four-Chromium Full Regression Census. Fix confirmed failures and permit only a green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Studio art requires provenance and game-scale QA. Keep #48 physical acceptance, #86 Render drift and #87 branch-protection security open. No authenticated online-hosting claim.

## Evidence
- .314 source: `src/modules/ai.js`; focused Node: `tests/ai_support_run_pass.test.cjs`; browser: `tests/ai_through_ball_keeper_safety_browser_qa.py`.
- .313 exact-head Modular QA #45737485452 and Census #45737485448 failed because the new test called undefined `player()`; the same Node preflight caused Concept Hero QA #45737485501 to fail. Logs showed 2,924/2,925 passing; no production source assertion failed.
- .312 main promotion and Pages deployment succeeded. Independent main Census #45736990591 was still running at last check.

## Cleanup
Keep this file below 4 KiB with these headings and exact Agent ID. Never bypass CI, security or QA promotion.