# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.343 — GIVE-AND-GO-RETURN-TURN-ARRIVAL-01:** CPU give-and-go return-pass safety now projects active defenders through the existing Agility-limited turn response over the 0.08–0.26-second flight. High-Agility markers can close the reserved passer's pocket; low-Agility markers retain cross-lane momentum. The 75-unit per-axis cap, 66-unit pocket, 42-unit corridor, runtime expiry and pass physics are unchanged. Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions added.
- **.342 screenshot-gate correction:** the initial Census failed only because the keeper gallery fixture rejected a valid bottom pixel at y=215 while its 220px row remained unclipped. A test-only 2px upward preview adjustment was committed; exact-head Modular QA passed and its replacement Census was running at last inspection.

## Next smallest action
Inspect .343 exact-head Modular QA and all four Node/four Chromium Census jobs. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player presentation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- Starting dev SHA for .343: 8a459bc6e8400554be535cb440bd778a4ac34ae5; main SHA: 437f313487d8ea12fb2b84f3b3fc9b77c759aeb3.
- .342 Modular QA #45899141063 passed. Its replacement Full Regression Census #45899141127 was in progress at last inspection. The earlier .342 Census #45897766890 failed only keeper_dive_silhouette_browser_qa.py in browser shard 3 (71 pass, 1 fail); the failure was a one-pixel fixture bound, not a production renderer assertion.
- .341 Modular QA #45888981318 and Census #45888981329 passed; Pages deployment #45890224590 and independent main Census #45890232959 passed on .341.
- #87 remains open and branch protection is not claimed. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
