# Candidate 0.12.81.4 validation — exact-reference Home pass

## Delivered

- Repositioned the header, Kick Off panel, five primary rows, bottom shortcut dock, stadium art, and Magic Cup/Next Match footer to match the supplied 16:9 reference composition.
- Replaced the previous Home character illustration with a higher-detail transparent cutout used only on Home; the existing in-game player assets and roster are unchanged.
- Kept the Home token display bound to the real local soft-token wallet. No unsupported premium-currency or energy balances are displayed.
- Moved About & Credits under Settings and fixed return focus from About to Settings and then Home.

## Validation

- Build: `python -X utf8 scripts/build.py`.
- Home layout: reference 1680×945, desktop 1400×850, simulated touch 390×844; [reference-size screenshot](HOME_MENU_REFERENCE_20261103.png).
- Home route focus: desktop and simulated touch passed.
- ID/ARIA integrity: 18 routes × 3 viewport sizes = **54/54 samples passed**.
- Home mode icons: desktop, touch, forced colors, reduced motion.
- Child-route icons/descriptions: **30** route/viewport checks, **150** SVG instances, and **50** accessibility descriptions per desktop/touch sample passed.
- Offline service worker: desktop and touch offline reload with precached hero decode.
- Home, route-focus, and release/version Node contracts.
- Focused Node contracts: **32/32 passed**.
- Follow-up full Node and club fixture on the current integrated tree: **1,939/1,939** Node tests passed; the 32-club/384-player fixture passed. Data validation passed (223 teams, 2,676 players, 84 avatar presets); release gate contract passed **5/5**.
- SuperMagicAssetStudio `inspectTransparency`: 1313×1198; 66.517% transparent, 33.419% partially transparent; transparency on all edges; `readyForTransparentSprite: true`; no warnings.

The complete Node suite was run on the current integrated tree; a fresh full browser census was not run for this candidate. Browser screenshots do not establish owner visual approval. Hosted deployment, physical-device/screen-reader acceptance, and exact-head CI remain outstanding.
