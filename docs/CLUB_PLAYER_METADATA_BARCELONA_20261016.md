# Barcelona FC27 official verified data checkpoint — 2026-10-16

Owner `roster-fc27-chat-20261016-barca-b1`, lock `roster-club-club26_4`; batch `CLUB-20261016-FCBAR-FC27-VERIFICATION-1`.

The [EA official FC27 Barcelona base-card table](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-barcelona/241) confirms **12/12 OVR and 72/72 headline attributes** already matched. No ratings or arcade mechanics were edited. The [FC Barcelona 2026/27 shirt list](https://www.fcbarcelona.com/en/football/first-team/news/4570894/202627-first-team-jersey-numbers-confirmed/featured) confirms **five shirt corrections**: Eric García 2→24, Jules Koundé 3→23, Rodri 4→16, Fermín 6→7 and Dani Olmo 7→20. Five additional shirts marked verified.

[FootballSquads Barcelona 2026/27](https://footballsquads.co.uk/spain/2026-2027/laliga/barce.htm) supports 12 added heights and five missing age calculations as of 16 October. FootballSquads appears to misprint Raphinha's DOB as 14 February; the retained 1996-12-14 matches [official LaLiga](https://www.laliga.com/clubes/fc-barcelona/plantilla). Player names, stable IDs, club, nationality, all existing DOBs, positions, OVR, FC27 face stats and arcade player attributes are unchanged.

| Player | Role | OVR | Jersey | Age | Height cm |
| --- | --- | ---: | ---: | ---: | ---: |
| Joan García | GK | 86 | 1 | 25 | 180 |
| Wojciech Szczęsny | GK | 81 | 13 | 36 | 195 |
| Pau Cubarsí | DF | 86 | 5 | 19 | 184 |
| Eric García | DF | 85 | 24 | 25 | 182 |
| Jules Koundé | DF | 85 | 23 | 27 | 178 |
| Pedri | MF | 90 | 8 | 23 | 177 |
| Rodri | MF | 90 | 16 | 30 | 190 |
| Frenkie de Jong | MF | 86 | 21 | 29 | 179 |
| Fermín | MF | 85 | 7 | 23 | 176 |
| Lamine Yamal | FW | 90 | 10 | 19 | 180 |
| Raphinha | FW | 88 | 11 | 29 | 176 |
| Dani Olmo | FW | 84 | 20 | 28 | 179 |

Dedicated tests: `tests/barcelona_fc27_official_20261016.test.cjs`. Data and playable-runtime mirror must remain structurally equal for club26_4. The immutable per-field log is `docs/PLAYER_METADATA_BATCHES_20261016.json`. Physical device playthrough separate from GitHub Actions Pages deployment.

Next five isolated club iterations: Manchester United `club26_5`, Real Madrid `club26_7`, Liverpool `club26_9`, Tottenham `club26_29`, Chelsea `club26_18`; check live locks each time.

## Observed integrated QA and gaps

- [Modular QA #38946677603](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38946677603) **SUCCESS**, integrated commit `639b5068685a45ae033c177b4aa1a175500ec28a`: **203/203 active Node tests**, including all three Barcelona tests, 165 clubs / 1,980 player slots, and immutable roster history.
- [Full Regression Census #38946504996](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38946504996) was pending and Pages workflows mostly cancelled during concurrent pushes. Do not claim historical browser or phone/device tests passed.
- Public game: https://saeedsai.github.io/SuperMagicFootball/ . Physical phone/PC hosted gameplay **not independently verified**. Only Barcelona records were changed, avoiding concurrent agents' shared-file changes.
