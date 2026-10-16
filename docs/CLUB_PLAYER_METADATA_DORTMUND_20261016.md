# Player Metadata Batch 3 — Borussia Dortmund (2026-10-16)

**Batch ID:** `CLUB-20261016-BVB-METADATA-1`. **Starting dev HEAD:** `64b1c0482b91dc98610dbf9857d4b3d8f0371c0b`. Previous Brighton and Aston Villa metadata batches retained without alteration.

## Corrections
- One 12-player team (`club26_11`) updated in only `data/players/club26.json` and its identical runtime copy in `src/roster_corrections.js`.
- 47 recorded player-field changes: 12 age, 12 heightCm, 12 shirtVerified, 10 num, 1 nation.
- Player birth dates and official jersey numbers checked against [German FA 2026/27 register](https://datencenter.dfb.de/en/competitions/bundesliga/seasons/2026-2027/teams/borussia-dortmund) and [Borussia Dortmund 2026/27 first-team shirts](https://www.bvb.de/de/en/news/news-overview/news.html/2026/8/20/These-are-the-jersey-numbers-for-the-2026/27-season.html). Heights and Joey Veerman's nationality verified using Bundesliga's 2026/27 individual player profiles. Calculated age reference: 2026-10-16 (not necessarily the age shown when another date's web profile was published).
- Unchanged: every player ID, name, club allocation, role, FC27 identifier, overall rating, unofficial FC27 face stat, shoot, power, defense, speed, ability, gameplay UI and match mechanics. All 12 uniform numbers are unique, and 2/3/4/3 quota remains valid.
- **Known unresolved selection error:** [Daniel Svensson is registered as a defender](https://www.bundesliga.com/en/player/daniel-svensson) but the game uses him in the forward allocation. A role/selection replacement must be checked separately with the immutable player-change ledger. Do not silently change positions and break 2/3/4/3.
- FC27 overall ratings / face stats remain **unofficial third-party estimates**, rather than independently EA-certified official figures. No ratings were fabricated.
- Field-level provenance in [metadata batch ledger](PLAYER_METADATA_BATCHES_20261016.json); player-name/role/OVR original ledger and audited roster are unchanged.
- Regression gates: `node --test tests/dortmund_player_metadata_20261016.test.cjs`, `python3 scripts/validate_data.py`, `node tests/all_club_fc27_rosters.mjs`, `node tests/club_roster_batch_ledger.mjs`, `node --test tests/*.test.cjs`, `python3 scripts/build.py`, full Node/Chromium CI, and Pages deployment/smoke. Mark CI completed only after examining source-commit workflow results.

## Planned next five isolated iterations
1. **Brighton roster selection:** resolve Carlos Baleba club transfer with a source-ranked replacement; preserve the three-forward quota and record any name/OVR changes in the immutable player-selection ledger.
2. **Dortmund position-selection gap:** source an official Dortmund forward to replace the forward-listed Daniel Svensson in the game's constrained 12-player roster; check top OVR roles before changing selection.
3. **Napoli:** verify and correct eight stale ages, official shirts and physical metadata.
4. **Everton:** resolve seven stale ages and current 2026/27 club registration.
5. **Inter Milan:** verify six stale ages, nationality, height, and third-party attribute provenance.

Next worker: always read the **latest** `dev` head and both history ledgers before edits. The completed clubs' metadata batches are immutable checkpoints. If a parallel agent touches these files, reconcile the newest version and commit on top; never force-push. No out-of-scope cleanup or gameplay changes.
