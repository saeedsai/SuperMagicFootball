# Historical BPW 1998–2018 — selection evidence and caveats

**Implementation:** Six mixed worldwide editorial tournament squads, 72 nonrepeating athlete selections. Not official FIFA All-Star XI representations. Preserved 2 GK / 3 DF / 4 MF / 3 FW for the six-a-side game and its 12-player benches.

## Historical references

- [FBref historical FIFA World Cup All-Star Team (1998, 2002, 2006)](https://fbref.com/en/awards/wc_all_star/FIFA-World-Cup-All-Star-Team) — official-era historical lists, including tournament roles and reserves. These do **not** mandate our 12-slot arcade allocation.
- [FIFA Golden Ball winners and 1998–2018 performances](https://www.fifa.com/en/tournaments/mens/worldcup/articles/golden-ball-winners-highlights) and [FIFA+ Golden Ball video archive](https://www.plus.fifa.com/en/showcase/golden-ball-winners/5c19ce39-91d1-4ffb-812a-58f42b8d76e2) — used to protect key tournament performers.
- [FIFA World Cup Awards, All-Star and later fan-dream-team distinction](https://en.wikipedia.org/wiki/FIFA_World_Cup_awards) — the 2010/2014/2018 fan dream teams are **not official FIFA technical-committee teams**.
- [FBref 2010 World Cup Maarten Stekelenburg match log](https://fbref.com/en/players/fefce889/matchlogs/2010/c1/keeper/Maarten-Stekelenburg-Match-Logs) — confirms 2010 Dutch finalist goalkeeper as a second-GK editorial choice.
- [2018 World Cup award results](https://en.wikipedia.org/wiki/2018_FIFA_World_Cup) — Luka Modrić, Antoine Griezmann, Harry Kane, Kylian Mbappé, Thibaut Courtois.

## Editorial selection rules and trade-offs

1. Each year draws from several nations and includes players who performed in that **specific** World Cup, not a country's entire past-winning national squad. Global no-repeat requirement forces choices of which tournament gets a multiyear star.
2. **1998** includes Ronaldo (tournament Golden Ball), Davor Šuker, Zidane, Barthez, Davids and further 1998 All-Star choices. **2002** includes Oliver Kahn, Rivaldo, Ronaldinho, Roberto Carlos and other 2002 official-era All-Stars while avoiding repeat Ronaldo.
3. **2006** includes Buffon, Cannavaro, Pirlo, Klose and fellow 2006 All-Stars. Zidane is reserved for 1998 under the no-repeat rule, although he won the 2006 Golden Ball. **2010** includes Casillas, Forlán, Sneijder, Villa, Iniesta and other finalists/all-stars; two GK require editorial second-choice Stekelenburg.
4. **2014** includes Neuer, Keylor Navas, Messi, James Rodríguez, Neymar, Robben and others. **2018** includes Courtois, Lloris, Modrić, Mbappé, Griezmann, Pogba and others. Some positions are normalized into GK/DF/MF/FW for gameplay, not asserted to be exclusive real-life positions.
5. Ages are approximate at tournament date; exact birthdates not freshly independently verified for all 72. `rating`, `power`, `shoot`, `defense`, and ability levels are **editorial arcade tuning**, not official EA FC / FIFA ratings or market values.
6. `historicalPersonKey` / `variantOf` tie each BPW tournament slot to a stable historical slug. They are **not** a proven global `canonicalId` shared with club/national players; full name/DOB reconciliation and historical player likeness verification remain later-stage tasks. This limitation is explicit to avoid the current data-integrity false-positive problems.
7. Generated team emblems and cartoon portraits are original procedural art, not official FIFA crests or licensed likenesses.

## Selection table

See `BPW_72_WORLD_CUP_PLAYERS_v0822.csv` for all 72 names, nationalities, positions, ages and provenance. The game source of truth is `src/bpw_world_cups.js`.
