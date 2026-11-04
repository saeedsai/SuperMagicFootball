# Home menu rework — reference composition — 3 November 2026

## Delivered

The Home screen now uses the supplied 16:9 composition: shield and two-line wordmark masthead, gold Kick Off panel, five vertically stacked modes, five bottom shortcuts, a large player-over-stadium hero, and a bottom Magic Cup/Next Match card. The menu-only player cutout was replaced with a higher-detail, transparent illustration; no roster/player art was replaced. The ball keeps using the existing renderer. Home utility buttons moved out of the reference layout; About is in Settings and returns focus to its opener.

The Home layout uses the existing live local token balance. No gem wallet, energy system, account level, or scheduled kickoff time is fabricated. The Next Match pane displays the saved Career fixture when available and a short ready-to-play state otherwise. Its Magic Cup panel is presentational; playable leagues/cups remain reachable from the existing Leagues & Cups row.

### Route map

| Home item | Existing action | Result |
|---|---|---|
| Kick Off | `quick` | Opens existing match setup |
| Quick Match | `navQuick` | Opens local/on-device match choices |
| Online | `navOnline` | Opens existing LAN/P2P choices |
| Career | `navCareer` | Opens existing Career choices |
| Leagues & Cups | `navCups` | Opens existing league and cup choices |
| Training | `training` | Opens existing training setup |
| Squad | `squad` | Opens Team Command Center |
| Customize | `navCustomization` | Opens existing player/team customization |
| Shop | `navStore` | Opens Store & Tokens |
| Player Studio | `playerStudio` | Opens existing Player Studio |
| Settings | `navSettings` | Opens Settings; About & Credits is nested there |

## Art validation

The transparent hero PNG source is `assets/ui/home-hero-player-new.png`; the runtime image is `assets/ui/home-hero-player.webp`. SuperMagicAssetStudio `inspectTransparency` reported 1313×1198, 66.517% fully transparent, 33.419% partially transparent, all four edges transparent, `readyForTransparentSprite: true`, and no warnings. AssetStudio project review reported valid with one asset/layer and eight views.

## Validation

- `python -X utf8 scripts/build.py` — passed.
- Home browser dashboard — reference 1680×945, desktop 1400×850, and touch 390×844 passed; five main routes, five dock actions, live balance link, image decode/layout, navigation, and no page errors/horizontal overflow. Screenshot: [reference-size menu preview](HOME_MENU_REFERENCE_20261103.png).
- Home route focus — desktop and simulated touch passed for Home → Settings → About → Settings → Home.
- Menu ID/ARIA integrity — **54/54** route/viewport samples passed across 18 routes at 320×568, 390×844, and 1280×800.
- Home icons — desktop/touch, forced colors, and reduced motion passed.
- Child-route icon browser checks — **30** route/viewport checks and **150** SVG instances passed; menu descriptions — **50** Chrome accessibility nodes preserved across desktop and two touch sizes.
- Service worker offline browser check — desktop and simulated touch fetched/reloaded the app offline and decoded the precached transparent hero; missing resources failed closed.
- Focused Home/release Node contracts — passed after updating the Settings/About return route.
- Combined focused Node suite — **32/32 passed**.

The full Node suite and full browser census were not run for this candidate. Screenshots and browser checks establish implementation behavior, not owner visual approval. Physical-device/screen-reader acceptance, exact-head CI, hosted deployment, and owner approval remain separate gates.
