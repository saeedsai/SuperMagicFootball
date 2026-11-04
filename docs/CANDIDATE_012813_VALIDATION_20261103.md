# Candidate 0.12.81.3 validation — Home reference rework

## Delivered

- Rebuilt Home to follow the owner-provided reference structure: Kick Off, five primary game routes, five bottom quick actions, local profile/token/settings controls, a large stadium hero, and an event/next-match panel.
- The stadium hero uses a generated standalone 2D kick-pose cutout (`assets/ui/home-hero-player.webp`) with alpha transparency. The existing renderer animates the magic ball in front of the cutout. This illustration is used only in the menu; it is not a new roster/team concept and does not replace any game-player assets. The event card links to the existing playable World League. A saved Career supplies the next fixture when present; without Career data it offers Quick Match.
- Existing game modes, save paths, player/team identities, and the four-action control scheme remain the route/engine authority.

## Validation on .81.3

- Build: `python -X utf8 scripts/build.py` passed.
- Home browser dashboard: desktop 1400×850 and simulated-touch 390×844 passed, including route/action wiring and no horizontal overflow or page errors.
- Home Node contracts: **11/11** passed.
- Menu ID/ARIA integrity: **54/54** route/viewport samples passed (18 routes × 320×568, 390×844, and 1280×800).
- Home mode icon browser checks passed desktop, simulated touch, forced-colors, and reduced-motion.
- `tests/ux27_offline_service_worker_browser_qa.py` — desktop and simulated-touch passed. Offline root and query-route app-shell reloads worked, the precached hero WebP decoded with alpha transparency, and a missing resource failed closed.
- `tests/home_dashboard_browser_qa.py` now loads the local hero cutout through a deterministic base URL; desktop/touch assertions confirm the image decodes and has visible layout bounds.

No full Node suite or full browser census was run for .81.3. Automated screenshots and browser checks do not constitute owner visual approval. Exact-head CI, deployment/hosted smoke, physical-device and screen-reader checks remain separate.

See [Home reference rework evidence](HOME_MENU_REFERENCE_REWORK_20261103.md). The previous [candidate .81.2 LAN recovery report](CANDIDATE_012812_VALIDATION_20261103.md) is retained unchanged.
