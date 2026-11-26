# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.343 — GIVE-AND-GO-RETURN-TURN-ARRIVAL-01:** CPU give-and-go return-pass safety projects active defenders through the existing Agility-limited turn response over the 0.08–0.26-second flight. High-Agility markers can close the reserved passer's pocket; low-Agility markers retain cross-lane momentum. The 75-unit per-axis cap, 66-unit pocket, 42-unit corridor, runtime expiry and pass physics are unchanged. Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions added.
- **.342 screenshot-gate correction:** the initial Census failed only because the keeper gallery fixture rejected a valid bottom pixel at y=215 while its 220px row remained unclipped. A test-only 2px upward preview adjustment was committed.

## Next smallest action
Inspect .343 exact-head Modular QA and all four Node/four Chromium Census jobs. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player presentation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- .343 feature commit: a90f8f115d095a640392454dde8d6fbf9046efea; parent/dev baseline: 8a459bc6e8400554be535cb440bd778a4ac34ae5; main: 8a459bc6e8400554be535cb440bd778a4ac34ae5.
- Initial .343 Modular QA #45900821216 and Census #45900821084 found two Node failures: the new fixture geometry did not put the high-Agility marker inside the 66-unit pocket at the actual 80 ms minimum arrival, and this checkpoint omitted the exact identity markup required by project_memory_contract. The follow-up narrows the mirrored fixture geometry and restores the indexed identity line; production turn-aware projection is unchanged.
- .342 Modular QA #45899141063 and exact-head Census #45899141127 passed. .342 reached main through the QA-gated pipeline; Pages deployment #45900555489 passed. Independent main Census #45900563513 was still running (hosted smoke passed; Node and browser shards remained in progress at last inspection).
- .341 Modular QA #45888981318 and Census #45888981329 passed. #87 remains unresolved; #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
