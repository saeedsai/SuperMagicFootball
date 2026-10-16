# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
One exclusively claimed club at a time: official EA FC 27 ratings/face attributes plus accurate player DOB/age/nation/height and verified shirt number. Do not change match gameplay, UI, graphics or other clubs.

## Current checkpoint
- Manchester City `club26_2`: official FC 27 launch 12 OVR / 72 face attributes matched. Five shirts corrected, five missing ages and twelve heights filled; all roster slots and gameplay stats unchanged. [City handover](../../CLUB_PLAYER_METADATA_MAN_CITY_20261016.md); source audit [metadata batches](../../PLAYER_METADATA_BATCHES_20261016.json); [claim](../../agent_coordination/claims/roster-club-club26_2.json).
- Previous Arsenal `club26_0` and Bayern `club26_1` batches already complete; do not redo their data. Refer to their separate handovers.

## Next smallest action
After verifying the City source/test SHA and GitHub CI, record precise pass/fail/deployment status in City handover and **release** City claim. Next club PSG `club26_3` only after rereading live `dev` and reserving its club lock; then Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`, and one verified unclaimed next club.

## Ownership and exclusions
Only `roster-club-club26_2` is owned for this batch. Read only the `roster-fc27` agent memory and shared memory. Shared memory/admin docs and other agent memory are off limits. Retain all 2GK-3DF-4MF-3FW roster contract invariants.

## Evidence
Official EA cards: https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/manchester-city/10
PL shirt numbers: https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season
Official PL player registrations: https://www.premierleague.com/en/news/4706139/see-all-the-202627-premier-league-squad-lists
Dated 2026/27 biography: https://footballsquads.co.uk/eng/2026-2027/engprem/mancity.htm

## Cleanup
Keep this as the single live checkpoint, not an append-only transcript or guessed CI success.
