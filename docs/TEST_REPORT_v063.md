# v0.6.3 Test Report — 2026-10-13

## Source verification

`npm run build`: PASS; single offline HTML generated from modules. `npm test`: PASS for kits/agility and existing simulation, career, 151 continental qualification slots, AI difficulty and player-stat tests. `npm run qa`: PASS on desktop Chromium and simulated mobile layout for home/away kit selectors, live previews, actual in-game uniform coloring, start, pause/resume, career, transfer/contracts, filters, JSON import/export, difficulty and stamina HUD.

## New concrete assertions

- Exactly 216 selectable built-in teams have distinct home and away jersey primary colors (not distinct licensed graphics).
- Match engine receives each team's chosen kit independently and does not overwrite original team color values.
- Players with different `speedRating` have different maximum running speeds; players with different `agility` have different initial acceleration and turning response.
- `agility` defaults deterministically for old roster records and explicit existing ratings are preserved.
- Both desktop and simulated-mobile setup controls update previews, switch sides, enter play and resume from pause without JS page errors.

## Not yet validated

No physical phone or real gamepad tested. Not performance-profiled for 60fps / frame times. No user-playtest balance data to prove agility is tuned optimally. Uniform colors are generated; cannot assert official licensing or current 2026 shirt accuracy. No automatic clash detection, fabric/shirt pattern variants, or fully featured player creator. Legacy saved-game migration covered at data/default level only, not every historical save file.

## Tests to keep running for future builds

`node tests/kits_agility.mjs`, `python tests/kits_browser_qa.py`, then `npm test` and `npm run qa`. Keep the screenshots `tests/kits_setup_desktop.png`, `tests/kits_setup_mobile.png`, `tests/kits_match_desktop.png`, `tests/kits_match_mobile.png`.
