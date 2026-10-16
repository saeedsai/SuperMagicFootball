# Gap register — integrated multi-agent development, 15 October 2026

| Priority | Domain | Status / next action |
| --- | --- | --- |
| HIGH | Graphics resemblance and projections | Character-art v2 and previous eight-view fixes are live. Continue visually reviewing named-player shape/hair/beard/accessory/face combinations, with automated contact sheets and human artistic QA. |
| HIGH | Gameplay mechanics configuration | Seven coefficients previously moved to JSON; many pass, collision, and keeper scalars remain JS. Extract them carefully with valid bounds and unchanged default match outcomes. |
| MEDIUM | Parallel JSON edit conflicts | **Foundational protection delivered:** new three-way semantic merge checker detects competing edits and stable ID/order changes before merge. Remaining: reviewed editor-specific previews and CI integration with agent PRs. |
| MEDIUM | Roster source verification | Club26 384 named entries, 290 agent FC27-comparison ratings and 94 editorial/provisional; transfer registration, authenticity and exact EA FC27 stats require independent verification. |
| MEDIUM | Career and tactics usability | Improve available squad maintenance and coaching hints without migrating IDs or save schema. |
| RESOLVED | Duplicate rear hairstyle silhouettes / Studio simultaneous preview | Earlier Studio pass ensured 13/13 rear hairstyles distinguishable and eight-view editor gallery remains. |
| FAR FUTURE | Hosted browser/saves/restart/PWA | Owner explicitly deferred exhaustive hosting/saves and real-origin process-restart persistence. Routine GitHub deployments still checked. |
| FAR FUTURE | Physical mobile devices and FPS | iOS/Android physical-device UX, offline installation and performance certification deferred by owner. |
| LONG RANGE | Worldwide rosters, Super Defense, Tricks, network | No scope change until rescheduled. |
## 2026-10-16 mechanics extraction
**Closed in this cycle:** editable bounded pass launch velocity coefficients and goalkeeper dive cooldown coefficients, with parity tests and runtime fail-fast validation. **Still open:** remaining inlined player contact, ball friction, keeper reaction/reach and pass error coefficients; baseline parity calibration on seed-matched match suites. FC27 provenance/graphics visual QC belong to parallel agents. Deferred as owner directed: physical Android/iOS PWA/FPS and exhaustive hosted restart/save recovery.
