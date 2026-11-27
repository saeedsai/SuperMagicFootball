# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.348 — AI-CARRY-INPUT-TURN-ESCAPE-READ-01:** pressured CPU carry escape scoring now projects existing carrier movement through the existing Agility-limited directional input turn response over the bounded 0.08–0.18-second horizon. High Agility can favor the newly steered open lane; low Agility retains more residual momentum. Only lane scoring/early slide-escape prediction changes; movement physics and human input remain untouched. Neutral/invalid input and slow/stationary carriers retain previous fallback.
- **Base dev/main SHA:** `b5e01e61d08e9b5dc63325b2525c8300743769d1`. .347 exact-head Modular QA #45920921174 and Full Regression Census #45920921131 passed; main Pages #45922163185 and independent main Census #45922171346 passed, including all four Node/four Chromium shards and hosted-pages smoke. Dev and main were already identical at this base.
- **.348 gate:** feature commit `6c13f9a9770b47920305efcd570fccc5595ec275` contains production AI, release metadata and mirrored helper/actual-engine Node plus desktop/simulated-touch Chromium regressions. First Census #45927241958 found one new actual-engine fixture failure (2,986/2,987 passed); the helper matrix passed. Follow-up test commit now holds a lower AI target while supplying distinct upper steering input, isolating the turn-read override. Exact-head rerun pending; do not claim certification or promotion until observed.

## Next smallest action
Inspect exact-head Modular QA and rerun Full Regression Census after the corrected AI carry fixture. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player animation increment.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Base SHA `b5e01e61d08e9b5dc63325b2525c8300743769d1`; exact-head .347 QA #45920921174; Census #45920921131; Pages #45922163185; main Census #45922171346.
- GitHub REST reported `main.protected=false`, `dev.protected=false`, no active rulesets; #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
