# Rating-tier source batch blocker: Sporting Cristal

**Audit date:** 2026-11-02
**Status:** Blocked; not counted in completed 12-player / 72-field audits.

The canonical ledger contains these twelve `cont_conmebol_30` members with explicit source IDs:

| Ledger player | Position | EA source ID |
|---|---:|---:|
| Diego Enríquez | GK | 265786 |
| Renato Solís | GK | 253629 |
| Cristiano | DF | 83757 |
| Rafael Lutiger | DF | 261377 |
| Leandro Sosa | DF | 231930 |
| Yoshimar Yotún | MF | 204542 |
| Martín Távara | MF | 253619 |
| Írven Ávila | MF | 196848 |
| Luis Iberico | MF | 254220 |
| Santiago González | FW | 243731 |
| Juan Manuel Cuesta | FW | 247780 |
| Hernán Barcos | FW | 191856 |

EA's [Sporting Cristal FC 27 team ratings list](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/sporting-cristal/111013) lists Hernán Barcos, but the official individual URL for ledger ID `191856`—[Hernán Barcos player page](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/hernan-barcos/191856)—identifies itself as an **EA SPORTS FC 26** page. That does not establish a current FC 27 individual profile for the ledger ID. The team listing alone does not supply the individual FC 27 canonical attribute leaves required by this audit.

**Missing requirement:** an official FC 27 individual EA profile for Hernán Barcos that resolves to source ID `191856` and confirms the same player and team, so that current-version attributes can be checked. Until then, the batch is skipped; no substitute identity or source was used, and no roster, ledger, tier, verification, or game data was written.

- Ledger scope checked: exactly 12 rows for `cont_conmebol_30`, with 12 distinct explicit source IDs.
- Source-ledger SHA-256 before check: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after check: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
