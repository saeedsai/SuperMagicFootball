# Candidate 0.12.81.60 validation

**Status: local candidate; not pushed.** This increment keeps effort on in-game graphics and gameplay. It adds a small ankle-pivot toe flex to existing player run art, static cut-grass detail to natural turf, fixes the off-ball Jump+Pass fast-chase chord, makes Custom Cup playable, and hardens local online-service request/stream/shutdown behavior. No new menu or concept character art was created.

## Acceptance criteria

- Running shoe articulation is phase-based, mirrored, bounded and pivoted at the ankle; planted boots stay level and game state/hitboxes remain untouched.
- Grass detail is deterministic, cached once with the existing field layer, clipped to the existing bounds, static in reduced-flash mode and does not change simulation or field geometry.
- Off-ball grounded Jump+Pass preserves four-action chase/tackle; possession jumps, aerial pass ordering and Jump+Shoot remain intact.
- Custom Cup accepts 4–16 unique existing teams including the chosen club, plays a deterministic seeded knockout with byes, saves/loads in Cup slots, and rejects malformed imported/direct saves. Custom League remains deferred.
- Online Career current GET/POST routes reject ignored query parameters before state access; client disconnect cancels response streams; concurrent/reentrant graceful close calls join one shutdown operation.

## Validation

- npm run test:node: build fixture 5,237,058 JS / 5,360,354 HTML characters, Node 2,324/2,324, and existing runtime/data parity executable passed.
- Online service focused suites: 62/62 across API/HTTP/service, including disconnect stream cancellation, concurrent/reentrant shutdown, and strict Career query rejection.
- Custom Cup plus Cup-save validation: 18/18. Gameplay input/Cup integration checks: 19/19, including actual-engine Jump+Pass chase/tackle and 4–16 entrant knockout/save progression.
- Existing player footwear renderer tests: 10/10. Production drawPlayer capture uses 64px match-scale cells across front/quarter/profile and opposite run phases; each view rotates one swing shoe at the ankle, while stance stays level. Whole phase samples differed by 950/923/883 pixels and lower-foot bands by 200/194/180 pixels; these include all existing gait differences, so they are not isolated toe-flex counts. Player state stayed unchanged; 0 browser errors.
- Natural grass renderer tests: 9/9. Actual-renderer QA at 0.235 match scale changed 2,407 pixels; fresh-cache repeat and reduced-flash hashes matched, gameplay state was unchanged, and there were no browser/console/request errors.
- Custom Cup browser QA passed on desktop 1360×800 and simulated touch 390×844, including setup validation, persistence and reload restore.
- node --check and scoped git diff --check passed for changed backend files.
- Visual evidence: [run-toe articulation at 64px](evidence/browser/characterart_run_toeoff_live_64px_20261105_v2.png) and [grass before/after at match scale](evidence/browser/grass_turf_fibers_before_after_20261105_03.png).
- Exact-head Full Regression Census, Modular QA, protected promotion, Pages, hosted smoke and main regression are pending for this candidate.

## Limits

Toe flex is modest animation polish, not a 100× character-art overhaul. The scripted render evidence is not owner visual approval or physical-device acceptance. Online code is prepared locally; a customer server, PostgreSQL/OIDC configuration, secrets, real-network match testing and deployment remain unavailable until the owner provides a server/configuration.