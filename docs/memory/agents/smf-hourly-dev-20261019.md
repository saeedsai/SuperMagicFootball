# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-26

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper animation, Player Studio and Career/Cup. Preserve canonical data, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.344 — AI-SUPPORT-RUN-DEFENDER-TURN-ARRIVAL-01:** CPU support-run lane selection now projects moving defenders through the existing Agility-limited turn response over the runner's 0.12–0.45-second route lookahead. High-Agility markers can close the upper lane; low-Agility markers retain lower-lane momentum. The ±100-unit per-axis cap and all support-run scoring weights remain unchanged. Mirrored Node and actual-engine desktop/simulated-touch Chromium regressions added.
- **0.12.81.343 gate:** Modular QA #45901430088 passed; Census #45901430036 preflight/preview passed, Node shards 2/4 and Chromium shard 1/4 passed, with the remaining shards in progress at last inspection.
- **0.12.81.342 main:** Pages deployment #45900555489 succeeded; independent main Census #45900563513 was still running at last inspection.

## Next smallest action
Inspect .344 exact-head Modular QA and all four Node/four Chromium Census jobs. Fix any confirmed failure, then allow only a fully green exact head through the existing QA-gated main pipeline. Independently verify main Census, Pages deployment and hosted bytes. Continue with the next unblocked gameplay or existing-player presentation item.

## Ownership and exclusions
Preserve 223 team and 2,676 player identities/order and 12-player ratios, six formations, exactly four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept-hero creation or copied art. Keep #48 physical acceptance, #86 Render drift and #87 main protection unresolved until independently verified. Do not claim physical-device certification or authenticated online hosting.

## Evidence
- .344 parent/dev baseline: `9b7970b19580a4623adb6def7a46762c610aec1b`; prior .343 feature commit: `a90f8f115d095a640392454dde8d6fbf9046efea`; .343 test correction: `9b7970b19580a4623adb6def7a46762c610aec1b`.
- .343 Modular QA #45901430088 passed. Exact-head Census #45901430036 was still in progress (preflight and preview passed; Node shards 2/4 and Chromium shard 1/4 passed at last inspection).
- .342 main HEAD: `8a459bc6e8400554be535cb440bd778a4ac34ae5`; Pages #45900555489 succeeded; independent main Census #45900563513 remained in progress.
- GitHub REST reports `main.protected=false`; branch-protection read returns 403 and #87 remains open. #48 and #86 remain open.

## Cleanup
No roster/data, save-schema, LAN/P2P, concept-art or online-hosting changes.
