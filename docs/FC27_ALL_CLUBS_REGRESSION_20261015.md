# All Club FC27 Selection and Regression — 15 October 2026

## Verified roster acceptance

- Audited **165 playable club teams** (`club26` + `continental`) out of the game's wider team inventory.
- **1,980/1,980** club player slots populated with real named footballers, **0 Academy/fictional placeholders**.
- **165/165** clubs enforce exactly **2 GK, 3 DF, 4 MF, 3 FW**, 12 unique IDs, names, and shirt numbers.
- **983** source-ranked FC27-rated players from a third-party September 2026 data snapshot; **997** sourced/editorially rated other real footballers. FC27 source affiliations and overall figures are **not independently certified EA official data**.
- No source-ranked FC27 top position candidate was reported missing by the existing ranking-audit algorithm for matched clubs. Other clubs use dated 2026/27 first-team or 2026 tournament squads; ratings are clearly labeled medium-level **editorial estimates**, not FC27 OVRs.
- **983 source birth dates** were normalized from DD-MM-YYYY to ISO YYYY-MM-DD to prevent invalid identity matching. Saved player IDs and OVR unchanged.
- Both editable data files and the **game runtime** `src/roster_corrections.js` synchronized, with audit parity asserted in `tests/all_club_fc27_rosters.mjs`.
- Dataset: [full 165-club shortlist](CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json); [selection and provenance notes](CLUB_FC27_POSITIONAL_AUDIT_20261015.md).

## Representative fallback sources

- [Neftchi Fergana official 2026 first team](https://fcneftchi.uz/en/teams/main-squad).
- [August 2026 OFC tournament team lists](https://footballoceania.com/2026/08/08/oceania-champions-league-everything-you-need-to-know/amp/) for AS Tiga Sport, AS Vénus, Rewa FC, Lae City, Tupapa Maraerenga, and related clubs.
- [O&M FC 2026 first-team player positions](https://www.livescore.com/en/football/team/om-fc/147418/squad/).
- [Ratchaburi FC 2026/27 team](https://www.transfermarkt.co.uk/ratchaburi-mitr-phol-fc/kader/verein/35387).
- [Defence Force Trinidad 2026/27 squad](https://inside-caribbean-football.vercel.app/clubs/defence-force-trinidad-tobago).
- [Olimpia Tegucigalpa 2026/27](https://m.aiscore.com/team-cd-olimpia/527r3iep19h87ev/squad).
- [Al Quwa Al Jawiya 2026/27](https://www.transfermarkt.com/al-quwa-al-jawiya/kader/verein/23805/saison_id/2026).

## Testing and regression

**Complete source update workflow: PASS** — [GitHub Actions verified update](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38809435726) reports:
`PASS 165 clubs / 1,980 slots / 2GK-3DF-4MF-3FW; FC27 983 editorial real 997 unresolved fictional 0`.

**Birth-date normalization: PASS** — [GitHub Actions normalization run](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38810042684). ISO conversion of 983 dates, JSON validation, 165-club + Club26 tests, build generation, active Node contracts all passed.

**Modular Game Dev QA: PASS** on source/test commits through [GitHub Actions](https://github.com/saeedsai/SuperMagicFootball/actions). Game build and current contracts pass; historical fixed-2026 tests were revised to validate the new current FC27 positional source instead of superseded 2026 names and signatures.

**Expanded historical Node/browser regression:** Four full Node script shards PASS, and browser test shards remain under verification: [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38811487843). The workflow result must be reviewed before calling the historical browser suite green.

**Original expanded regression:** [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml). Earlier first rerun caught old-date formats, old squad verification flags, added Concept Hero team count, missing Pillow dependency and outdated PWA cache key. Specific causes have been addressed in source, tests and CI. The latest run outcome should be consulted rather than treating a previously incomplete or failed run as certified green.

## Deployment

- GitHub Pages build/deploy has completed successfully for an updated source revision: [deployment](https://github.com/saeedsai/SuperMagicFootball/actions).
- Live game: https://saeedsai.github.io/SuperMagicFootball/
- Headless desktop and simulated-touch browser acceptance workflow: [Verify Deployed PC and Touch Game](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/verify-pages-playable.yml).
- **Hosted interactive test PASS:** [live PC and simulated-touch smoke run](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38811611294) succeeded: HTTP 200, 224-team boot, menu navigation, Quick Match kickoff, game running, and 20%-extended pitch.
- GitHub Pages deployment for this report revision also **SUCCESS**: [Pages build and deployment](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38811792360).
- The previous 223-team readiness assertion was corrected to account for the new 224th Concept Hero team.

## Remaining uncertainties

- FC27 ranking dataset is third-party, not an official EA master database. Names and 2026/27 registration for every club are **not all independently confirmed**.
- Editorial ratings are not EA performance stats. Gameplay power/speed/shot stats remain a game-specific mapping.
- Physical phones, gamepads, offline PWA and save persistence across browser process restart require device/host acceptance in addition to Linux Chromium.
