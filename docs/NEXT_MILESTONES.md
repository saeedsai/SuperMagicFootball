# Plan — next five iterations after v0.8.25.31

Each iteration requires: retain 223 team indices and 12 slots each; 2GK/3DF/4MF/3FW; stable player IDs, saves and BPW squads; four game actions, five main sections, six formations; new tests, data validation, seeded 24 matches, updated docs; commit only to agreed integration branch.

| Version | Focus | Acceptance gates |
|---|---|---|
| **0.8.25.32** | GitHub Pages/dev preview and real-origin save/reload hardening | Host/HTTPS URL launches on PC and phones; refresh, save import/export and browser process restart verified; eliminate Pages settings failure. |
| **0.8.25.33** | Graphics quality: 8-direction named player art, hairstyle silhouettes, facial hair intersections | Record 8-view contact sheets for curated players × poses; fix verified clips/overlaps; no decrease in 12,096 case sweep. |
| **0.8.25.34** | Controlled gameplay tuning extraction: pass/contact/keeper tunables | Move tested subsystem coefficients to bounded JSON; defaults reproduce previous outcomes; 24 full matches + controlled mechanical suites PASS. |
| **0.8.25.35** | Physical mobile QA, performance and offline/PWA | Run iOS/Android landscape, background/resume, service worker offline and 30/60 FPS profiles; optimize proven bottlenecks. |
| **0.8.25.36** | Career/save robustness and parallel roster merge contracts | Validate legacy career, creator clubs and shared JSON patches; schema migration tests and conflict diagnostics; no player/roster corruption. |

Longer-term retained: expand visual likeness quality, goalkeeper transitions, gamepad accessibility, league UX and editorial data only when approved. Worldwide roster verification, Super Defense, Tricks and LAN/online are deferred.
