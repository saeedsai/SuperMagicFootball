# Five-iteration development plan after v0.8.25.32

Source of truth: GitHub `dev`; integrate only after independent QA and seeded full-match regression. Preserve 223 built-in teams, 2,676 players, seven BPW squads, 12 players per team (2 GK, 3 DF, 4 MF, 3 FW), ID/index order, existing careers/saves, exactly four action buttons, five top-level navigation groups and six formations.

| Version | Priority | Requirements and acceptance |
|---|---|---|
| **v0.8.25.33** | Graphics refinement | Curated named-player hair/beard/face and accessories across all eight directions; comparison gallery visual QC; inspect contact sheets, avoid overlapping skin/face; preserve full 12,096-draw sweep. |
| **v0.8.25.34** | Gameplay JSON extraction | Move bounded pass/contact/keeper variables to `data/mechanics/gameplay.json`; validate schema and match outcomes; 24 full matches and mechanical suites. |
| **v0.8.25.35** | Gameplay animations | Improve passing follow-through, goalkeeper recovery and first touch animations with deterministic view-specific QA; no physics changes without measured evidence. |
| **v0.8.25.36** | Editor/data integrity | Add conflict detection and merge diagnostics for concurrently edited team, player and graphics JSON; preserve player IDs and exact roster quota. |
| **v0.8.25.37** | Career UX and AI | Enhance available career squad maintenance and tactical coaching hints; acceptance includes formation and saved-state compatibility tests. |

## Far-future backlog — explicitly postponed by project owner

These are **removed from the next five iterations**. Do not bring them back as milestone blockers without a new request.

- **Hosting and saves** (formerly planned v0.8.25.32): exhaustive live Pages browser gameplay, refresh/restart, import/export and persistent profile certification. Routine GitHub source and CI/Pages status checks remain part of normal release hygiene, but are not a feature milestone.
- **Physical mobile and offline/PWA** (formerly planned v0.8.25.35): iOS/Android device testing, real FPS optimization, offline install and service-worker certification.
- Other long-range programs: editorial worldwide rosters, Super Defense, Tricks, multiplayer/LAN/network. Retain specifications until explicitly scheduled.

Every iteration must include a playable modular `index.html` plus `src/` and `data/`, Node regression, all inherited Chromium suites, seeded matches, new feature tests, honest PASS/FAIL/NOT EXECUTED reporting, and docs/source committed to `dev`. GitHub Pages may serve the `dev` branch according to repository settings; do not claim interactive remote verification unless actually performed.