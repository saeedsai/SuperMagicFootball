# All-club FC27 positional and first-team audit — updated 2026-10-15

**Result:** 165 playable clubs, 1,980 named player slots, **zero fictional or academy placeholders**.

Every club satisfies **2 GK / 3 DF / 4 MF / 3 FW**. The source and runtime arrays are identical and stable IDs and unique squad names/shirt numbers are regression-tested.

- FC27-matched clubs: **82**. Preserved the top eligible OVR candidate in every position in each matched source club, as established by the source-ranked audit. Source is a *third-party September 2026 snapshot*, not a certified official EA FC27 roster.
- Other clubs: source-backed real first-team names and **editorial medium positional overall ratings** (not FC27 numbers). Each player is marked with `ratingSource: "Editorial ..."`, a source URL, and `statsVerified: false`.
- Entire club data inventory: **983 FC27-rated records**, **997 editorial real-player records**, **0 unresolved fictional records** (validated by `tests/all_club_fc27_rosters.mjs` on the audited workflow).
- Source selection and provenance by club: [CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json](CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json).
- The 165-club inventory excludes national/legends/fictional classic competitions elsewhere in the game. Overall game data inventory is 223 teams.

## Recent evidence-based fallback additions

Dated 2026/27 or 2026 tournament squad lists have been used for Young Africans, Al Hilal Omdurman, Power Dynamos, Saint Éloi Lupopo, Petro de Luanda, Trinidad Defence Force, Honduran Club Olimpia, Forge FC, O&M FC, Ratchaburi, Neftchi Fergana, Tractor SC, AS Vénus, AS Tiga Sport, Rewa FC, Lae City FC, Tupapa Maraerenga, Shanghai Port, Al Quwa Al Jawiya and other independent club squads. Several clubs have ambiguous player registration across sources; use source URLs on individual roster slots before treating any given name as officially registered.

Examples of sources: [Neftchi official first team](https://fcneftchi.uz/en/teams/main-squad); [2026 AS Tiga Sport / AS Vénus tournament squad lists](https://footballoceania.com/2026/08/08/oceania-champions-league-everything-you-need-to-know/amp/); [Ratchaburi 2026/27 squad](https://www.transfermarkt.co.uk/ratchaburi-mitr-phol-fc/kader/verein/35387); [Defence Force 2026/27](https://inside-caribbean-football.vercel.app/clubs/defence-force-trinidad-tobago); [O&M 2026](https://www.livescore.com/en/football/team/om-fc/147418/squad/).

**Limitations:** FC27 OVR source is unofficial; no independent EA data dump confirms all overalls or player club memberships. Reconstructed game power, shoot, defense and value stats are game estimates, not EA granular player stats. Automated mobile Chrome emulation is not physical phone testing. Historical test suites can still rely on previous release roster identities and need continued modernization.
