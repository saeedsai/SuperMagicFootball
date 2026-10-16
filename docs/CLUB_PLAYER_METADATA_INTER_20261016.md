# Inter Milan metadata batch checkpoint — CLUB-20261016-INT-METADATA-1

**Starting dev commit:** `d0cd38cc544d6d86be3a9f2a37236d01652ec925`. Exclusive claim: `roster-club-club26_8` (session `roster-inter-20261016-1353-gpt6`).

## Verified player information

| Player | Age on 2026-10-16 | Height |
|---|---:|---:|
| [Alessandro Bastoni](https://www.inter.it/en/teams/first-team/player/alessandro-bastoni) | 27 | 190 cm |
| [Federico Dimarco](https://www.inter.it/en/teams/first-team/player/federico-dimarco) | 28 | 175 cm |
| [Nicolò Barella](https://www.inter.it/en/teams/first-team/player/nicolo-barella) | 29 | 175 cm |
| [Piotr Zieliński](https://www.inter.it/en/teams/first-team/player/piotr-zielinski) | 32 | 180 cm |
| [Lautaro Martínez](https://www.inter.it/en/teams/first-team/player/lautaro-martinez) | 29 | 174 cm |

Changed exactly **10 metadata fields on five players**. Sources are Inter's official profiles; field-level previous/current/source evidence is in `PLAYER_METADATA_BATCHES_20261016.json`. Both `data/players/club26.json` and `src/roster_corrections.js` were updated for **club26_8 only**. All squad identities, ratings, FC27 attributes, roles, and mechanics remained untouched. Existing official shirt-number conflicts were not changed to avoid duplicates and breaking audited squad selection.

## Outstanding club issues

- The other seven Inter players still need dedicated birth-date, height and affiliation verification, especially the goalkeeper selection with **Ivan Provedel**.
- Official 2026/27 shirt numbers on [Inter's player pages](https://www.inter.it/en/teams/first-team) differ from multiple game entries; a separate audited roster-number and squad-selection batch is required.
- Third-party FC27 overall scores/gameplay face stats are **not official verified EA ratings**, and were deliberately preserved.
- The original 2 GK / 3 DF / 4 MF / 3 FW 12-slot rule and earlier club ledger are immutable.
- No other game source, player clubs or historical files were cleaned up.

## QA gate and next step

On data commit run Modular Game Dev QA, full regression, GitHub Pages deployment; record exact run SHAs and outcomes. Hosted physical phone and PC are **not independently tested** unless a live hosted smoke actually runs.

Next five isolated squads: (1) Inter remaining metadata and disputed keeper, (2) Brighton Baleba club transfer, (3) Dortmund Svensson position issue, (4) Everton unresolved eligibility and heights, (5) other untouched Club26 teams / continental squads. Claim the exact club before editing; re-read current dev HEAD and live claim directory.
