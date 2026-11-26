# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.342 — KEEPER-DIVE-LEG-SCISSOR-01:** the procedural goalkeeper painter now folds the lead knee and trails the far boot through the existing dive phase, with opposite boot flex and an exactly continuous 0.34-second recovery. The change is renderer-only; save/contact/reach/cooldown and match simulation are untouched. Actual-renderer screenshot acceptance covers both dive lanes and five existing projections.
- **.341 certification/promotion:** exact-head Modular QA #45888981318 passed 2,972/2,972. Full Regression Census #45888981329 passed preflight, preview, all four Node shards and all four Chromium shards; QA-gated promotion succeeded. Main Pages deployment #45890224590 and independent main Census #45890232959 passed on .341.

## Next smallest action
Inspect .342 exact-head Modular QA and all four Node/four Chromium Census jobs. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player presentation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev/main SHA: `437f313487d8ea12fb2b84f3b3fc9b77c759aeb3`; branches were identical before this candidate.
- .341 exact-head Modular QA #45888981318 passed 2,972/2,972; Full Regression Census #45888981329 and all eight Node/Chromium shards passed. The existing QA-gated promotion job passed.
- .341 Pages #45890224590 and main Census #45890232959 both passed. .342 is a new dev candidate; its release gates are pending.
- #87 remains open; the branch-protection endpoint currently returns 403 to the connected integration, so no protection claim is made. #48 and #86 remain open.

## Cleanup
Only this agent's checkpoint was replaced. No LAN/P2P, roster, concept art, save-schema or online-hosting changes.
