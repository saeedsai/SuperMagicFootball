# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Deliver player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup improvements. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.319 — AI-LIGHTNING-HUMAN-MARKER-BACKUP-COUNTER-01:** during Lightning's .32-second warning, a selected human target retains the mark and control; the nearest ready CPU teammate backs them up only when the human has not already begun an effective JUMP, grounded SHOOT-slide or Defence-versus-Dribbling closing read. The resolver recognizes the backup's counter only if still ready and within 95 units at impact; the marked target remains single-target.
- .319 adds mirrored Node tests and actual-engine desktop/simulated-touch browser acceptance for both teams at 30/60/120 Hz, including no-duplicate human counters.
- **Prior dev parent:** `14ae67db8f42c8a228af6ff1f2fdb231e0fa3e41` (.318). Exact-head Modular QA #45755127448 passed. Full Regression Census #45755127515 failed only magic_fireball_ai_counter_browser_qa.py: its baseline CPU-only test called AI on a selected human in a one-human match. The fixture now uses zero humans for that baseline; its separate two-human backup test remains unchanged.
- .318 feature: selected human markers retain control while CPU teammates back up Fireball/Freeze/Bat. .317 and earlier were superseded; see master backlog for exact-head evidence.

## Ownership and exclusions
Preserve 223 teams, 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No unapproved concept heroes or copied art. Keep #48 physical acceptance, #86 Render drift and #87 branch protection open. No authenticated online-hosting claim.

## Next smallest action
Rerun exact-head .319 Modular QA and four-Node/four-Chromium Full Regression Census after the confirmed preflight repairs. Then continue with selected-human Scream backup counterplay if the gate is clear; allow only a green exact head through the existing QA-gated main pipeline. Verify main Census, Pages deployment and hosted bytes independently.

## Evidence
- Exact dev head at this checkpoint: `34dcffe9576d84c26d06e770d0f80acbe0c4edf7` (.319); main: `e1720386be42b69c068afa0c193148f21abaefe7` (.314).
- Modular QA #45757954319 and Full Regression Census #45757954374 both failed at Node preflight. Confirmed causes: stale `.318` service-worker header/cache suffix, missing required `## Evidence` heading, a Lightning Studio source-contract still requiring the old pending-target shape, and a VM test extraction that included the adjacent `lightningDefenderCounters` function. No runtime/browser result was reached.
- Main protection remains disabled/unavailable to this integration (#87); physical two-phone acceptance #48 and Render drift #86 remain open.

## Cleanup
- No other agent checkpoint was read or modified. No LAN/P2P, roster, art, save-schema or online-hosting changes in this repair.
