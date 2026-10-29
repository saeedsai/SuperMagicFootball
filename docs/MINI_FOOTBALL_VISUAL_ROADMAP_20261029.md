# Mini Football-inspired visual and UX transformation — owner direction, 29 October 2026

Reference: https://play.google.com/store/apps/details?id=com.miniclip.minifootball

## Goal and boundaries
Bring SuperMagicFootball closer to the approachable, vivid arcade-football *quality and ergonomics* of Mini Football: bold menus, readable match HUD, thumb-friendly touch inputs, lively on-field animation, strong character silhouettes and stadium atmosphere. This is a design benchmark, **not** an instruction to copy Miniclip art, names, audio, layouts or source code. Use independently authored assets and retain SuperMagicFootball's distinct magic-football identity.

Keep **exactly four gameplay buttons** (Pass / Shoot / Dribble / Jump), including all existing holds/combinations and contextual defense behavior, plus directional joystick, keyboard and gamepad. Preserve 223 teams, 2676 players, 12-player rosters, six formations, ten Career and Cup slots, SD09, save migrations, offline/PWA and LAN/P2P logic. Physical two-phone #48 remains unverified.

## Ordered milestones and acceptance

### VIZ-01 — Mobile match HUD and action-pad polish (P0; first increment)
- Keep the four-action diamond, but make button color, hierarchy, sizing, outlines and pressed/focus states distinguishable; create comfortable left joystick/right cluster zones, safe-area offsets and portrait/landscape scaling.
- Make score, timer and pause legible without blocking play. Avoid obscuring player or ball near lower corners and add no action buttons.
- Tests: DOM exactly four distinct data-act values; joystick stays independent; CSS safe-area and viewport rules; 320px narrow / 360x640 portrait / 667x375 landscape / 844x390 / desktop simulated-touch screenshots; existing pointer/tap/hold regression.

### VIZ-02 — Menu navigation and reusable theme (P0)
- Introduce original consistent cards, high-contrast hierarchy, prominent Play and clear Team / Player Studio / Career / Cup / Settings navigation.
- Standardize iconography, controller hints, focus rings, hover/disabled feedback, loading/empty/error states, responsive breakpoints.
- Tests: navigation return destinations, keyboard/controller/touch parity, legibility/overflow and accessibility names.

### VIZ-03 — Original stylized player-art pipeline (P0)
- Independently author front, back, left, right and four front-/back-quarter views for representative characters; verify proportion, skin/hair/uniform continuity. Do not count generated rotations/mirrors as independently authored assets.
- Create reusable layered head, face, hair, torso, legs and accessories and high-quality run, dribble, pass, shoot, slide, tackle, jump, goalkeeper dive, victory/defeat and super-action motion cycles.
- Tests: eight distinct real directional assets, atlas alignment, correct draw order and silhouette consistency at playable size; maintain fps and fallback art.

### VIZ-04 — Pitch, stadium, visual feedback and camera (P1)
- Improve original turf texture, shadows, spectators, stadium props, goals, weather, selected-player visibility, animated impact/VFX and match transitions; retain readable ball path.
- Calibrate camera follow and zoom for play readability; do not silently alter physics, hitboxes or score rate.
- Tests: seeded gameplay screenshots, mobile/desktop frame pacing, visibility in both kits, offline assets.

### VIZ-05 — Player Studio/Team Management continuity (P1)
- Share original themed stat cards, ability icons (Super Shot, Super Defence, Magic Trick, Dribble Style), portrait previews and eight-view gallery.
- Preserve equipment and appearance saves; magic counter descriptions remain accurate.

### VIZ-06 — Gameplay feel and animation QA (P1)
- Improve non-physics visual anticipation/follow-through, collisions, keeper hand catches/dives, goal celebrations and feedback. Any gameplay balance tuning requires a separate seeded comparison and tests.

## Delivery and release policy
Implement in small scoped commits to existing `dev` only; never create branches, force-push, bypass CI/security or overwrite parallel work. Each player-facing increment updates About-only four-number release, package, README, release notes, sw cache, development log and the sole developer's under-4KiB checkpoint. Require focused tests, four Node + four Chromium shards and Modular QA on exact head before protected `main` promotion; verify Pages bytes and hosted boot separately. Pending Render commit-trigger investigation #86 or physical LAN #48 cannot block useful new visual increments.

## ARENA-OVERHAUL-01 — broad design implementation candidate (29 October 2026)
Implemented together as a broad, original arcade presentation increment: stadium-themed home and mode cards, featured Play Now, Player Studio/Career shortcuts, responsive match HUD/four-action touch layout, brighter cached stadium and pitch dressing, directional jersey accents and controlled-player marker. This is **not** a claim that every bespoke eight-direction animation asset, stadium design variation, gameplay physics rework, physical phone or hosted device smoke is complete. Follow-up art and animation QA must still be executed separately.
