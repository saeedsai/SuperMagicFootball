# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.348 — AI-CARRY-STEERING-TURN-ESCAPE-READ-01:** pressured CPU carry escape scoring now projects existing velocity toward the current AI steering target through the existing Agility-limited turn response over 0.08–0.18 seconds. High Agility can favor an open target lane despite residual momentum; low Agility retains more of its built momentum. If no valid AI target exists, the existing dx/dy fallback remains. This changes escape-lane scoring and the projected early slide-avoidance point only; movement physics and human input remain untouched.
- **Feature commit:** `6c13f9a9770b47920305efcd570fccc5595ec275`; current test/metadata repair commits: `4f5a0571ebde4241d242195af1a6f83ab1823874` and pending this commit. Base .347 dev/main SHA was `b5e01e61d08e9b5dc63325b2525c8300743769d1`; .347 exact-head Modular QA #45920921174, Census #45920921131, Pages #45922163185 and main Census #45922171346 passed.
- **.348 gate:** first .348 Node suite had 2,986/2,987 pass; the new helper matrix passed but an actual driveAI fixture failed because it did not preserve the engine's current target semantics. Follow-up now tests helper behavior on actual GameEngine player records and keeps existing browser engine acceptance. Exact-head rerun pending; do not claim certification or promotion until observed.

## Next smallest action
Inspect exact-head Modular QA and Full Regression Census after the steering-target correction. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player animation increment.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Base SHA `b5e01e61d08e9b5dc63325b2525c8300743769d1`; .347 QA #45920921174; Census #45920921131; Pages #45922163185; main Census #45922171346.
- First .348 QA #45927242014 and Census #45927241958 each found the same new actual-engine test fixture failure (2,986/2,987 passed). The helper matrix passed. Corrected fixture now tests actual GameEngine player records directly.
- GitHub REST reported `main.protected=false`, `dev.protected=false`, no active rulesets; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
