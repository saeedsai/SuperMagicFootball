# Manchester United official FC 27 launch ratings and 2026/27 squad metadata — 16 October 2026
**Club ID:** `club26_5` | **Owner:** `roster-fc27-chat-20261016-manutd-b1` | **Batch:** `CLUB-20261016-MUN-FC27-VERIFICATION-1`

Verified 12/12 overall ratings and 72/72 six face attributes against [official EA United ratings](https://www.ea.com/da/games/ea-sports-fc/ratings/teams-ratings/man-utd/11); values already matched and were deliberately not modified. Checked official [United 2026/27 shirt number register](https://www.manutd.com/en/news/confirmed-our-2026-27-squad-numbers) and [2026/27 FootballSquads physical/DOB biographies](https://footballsquads.co.uk/eng/2026-2027/engprem/manutd.htm).

| Player | Role | OVR | Shirt | Age as of 16 Oct | Height cm |
|---|---|---:|---:|---:|---:|
| Senne Lammens | GK | 82 | 1 | 24 | 193 |
| Karl Darlow | GK | 76 | 12 | 36 | 185 |
| Harry Maguire | DF | 82 | 5 | 33 | 188 |
| Lisandro Martínez | DF | 82 | 6 | 28 | 178 |
| Matthijs de Ligt | DF | 82 | 4 | 27 | 187 |
| Bruno Fernandes | MF | 89 | 8 | 32 | 179 |
| Youri Tielemans | MF | 85 | 18 | 29 | 176 |
| Marcus Rashford | MF | 82 | 9 | 28 | 180 |
| Kobbie Mainoo | MF | 81 | 37 | 21 | 175 |
| Bryan Mbeumo | FW | 84 | 19 | 27 | 171 |
| Matheus Cunha | FW | 84 | 10 | 27 | 184 |
| Benjamin Šeško | FW | 82 | 30 | 23 | 194 |

**Changed:** 11 shirt numbers, 12 ages (including correcting Lammens 22→24 and Mbeumo 24→27), 12 populated heights; all 12 shirt verification flags and all 12 EA provenance references; **83 total field-level metadata differences** captured in `docs/PLAYER_METADATA_BATCHES_20261016.json`. Source and runtime are exactly mirrored; no other clubs, custom gameplay stats, OVR, roles or IDs changed.

**Notes:** `Holland` for de Ligt is existing nation value, preserved to avoid unrelated schema change. EA launch cards do not guarantee current live-form rating; the game's fixed role distribution may differ from EA positions. Height values are from the stated FootballSquads roster. About revision is dynamic and should show latest `dev` SHA; did not change About UI, which is owned by other agents. Full hosted interactive phone/PC smoke requires independent device access.

**QA evidence:** run dedicated `tests/man_utd_fc27_official_20261016.test.cjs`, active Node regression, full historical Node/browser shards, About versioning contract and Pages; record actual status after remote pushes.

**Next five candidate batches:** Real Madrid `club26_7`; Liverpool `club26_9`; Tottenham `club26_29`; Chelsea `club26_18`; Atlético Madrid `club26_19`. Recheck latest locks and source status before selecting each.
