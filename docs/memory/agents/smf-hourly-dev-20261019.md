# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.338 — SPIN-SAND-HUMAN-MARKER-BACKUP-COUNTER-01:** during Spin Bump/Sand Trap's visible DRIBBLE wind-up, if the nearest marker is the selected human and no defender has already started an effective JUMP/grounded SHOOT-slide, one ready CPU teammate inside the existing 82-unit radius backs them up after the normal difficulty reaction delay. The human keeps control; active counters suppress duplication, and the resolver accepts any in-range teammate JUMP/slide.
- Production changes are in `src/modules/engine.js`; focused Node and actual-engine desktop/simulated-touch Chromium regressions cover both tricks, both teams, 30/60/120 Hz, human/teammate no-duplicate, out-of-range rejection, possession, cooldown/fatigue and exactly four actions.
- This candidate also repairs .337 release-gate fixtures: isolated Hide Ball poke expression now receives its resolver counter set; Fireball/Scream source contracts recognize Hide Ball counter membership.
- No new control, auto-tackle, save field, roster, formation, save-schema or online protocol change.

## Next smallest action
Inspect exact-head .338 Modular QA and all four Node/four Chromium Census jobs. Fix confirmed failures, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct responsive football/AI, existing-player art or Player Studio improvement; avoid repetitive Agility-only reads.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev SHA: `5e6d6f001d4668f2a98e9e3cda7683d3c6578e10`; main SHA: `a8edae04834d16a11292617e8d0d52abbd66eb4f`.
- .337 Modular QA #45872045507 and Census #45872045515 both failed Node preflight on two isolated Hide Ball expression bindings and two stale Fireball/Scream source assertions. No production Hide Ball gameplay assertion failed; these fixtures are corrected in .338.
- Main .336 predecessor remains independently Census-verified and Pages-deployed. GitHub REST reports `main.protected=false` and `dev.protected=false`; #87 remains open. #48 and #86 remain open.

## Cleanup
Only this agent's checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
