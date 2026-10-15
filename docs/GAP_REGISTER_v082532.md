# Gap register — v0.8.25.32

| Priority | Area | Current status and next action |
|---|---|---|
| HIGH | Named player likeness and facial details | Directional eight-view contact sheet exists and hair style pixels are distinct rear 13/13. Continue artist review for real character likeness, ear/hair overlap and beard contour combinations. |
| HIGH | Graphics accessory compatibility | Full automated drawing sweep passes but artistic and collision margin issues can be subtle. Test all accessory choices at different head scales. |
| HIGH | Remaining hard-coded gameplay constants | v31 moved seven selected coefficients; more pass/contact/keeper tunables remain JS. Use bounded, documented JSON keys and parity tests. |
| MEDIUM | Independent JSON patch merges | Seven player shards enable parallel work; current validator checks team/role/player invariants but does not identify all conflicting edits. |
| MEDIUM | Career training/club editor experience | Preserve current career and custom club saves. Expand validation and coach feedback, without changing player IDs. |
| RESOLVED | Three rear hairstyles indistinguishable | Styles 0, 9, 12 previously had same rear pixel signature because common rear overlay covered their distinguishing details. Style-specific visible crown marks now yield 13/13 unique rear signatures on desktop and touch simulations. |
| RESOLVED | Eight-way simultaneous Studio comparison absent | New optional gallery displays all eight head/body views with live appearance edits, without changing unsaved form values or persistent saves. |
| FAR FUTURE (not current blocker) | Hosted-origin saved-state/refresh and external interactive verification | Owner explicitly deferred former v32 Hosting/Saves initiative. Only existing GitHub Actions deployment results can be checked here. |
| FAR FUTURE (not current blocker) | Physical Android/iOS test, FPS optimization, PWA/offline | Owner explicitly deferred former v35 Mobile initiative. |
| LONG RANGE | Worldwide roster accuracy, Super Defense, Tricks, network modes | Outside approved current scope. |