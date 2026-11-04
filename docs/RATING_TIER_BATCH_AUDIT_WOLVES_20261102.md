# Rating-tier source batch audit: Wolverhampton Wanderers (blocked)

**Audit date:** 2026-11-02  
**Requested scope:** Audit the existing Wolverhampton Wanderers player rows in the current source ledger against official EA SPORTS FC 27 pages.

## Source availability

The official EA SPORTS FC 27 team page exists: [Wolves player ratings](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/wolves/110). It is a primary source for the EA player items shown there.

## Roster membership gate

The current [rating-tier source ledger](ROSTER_TIER_SOURCE_LEDGER_20261101.csv) contains 223 teams. Exact case-insensitive matching of its `team_name` values against `Wolves` and `Wolverhampton Wanderers` returns **zero rows**. Its current 32 `club26_*` source-audit batches also contain no Wolverhampton/Wolves team. Consequently, there is no existing 12-player game batch, club ID, or set of ledger source IDs to match against EA.

This audit therefore records **0 player identities checked, 0 distinct source IDs, 0/72 field observations, and 72/72 fields not auditable** for the intended 12-player batch. Those figures describe the absent requested batch, not the EA team list. No EA individual player was selected as a substitute, because selecting unrelated names would not establish identity correspondence with game records.

## Result and gate

The requested source audit is blocked at roster membership. No player, rating, tier, identity, verification flag, or source-ledger field was changed. The ledger SHA-256 before and after preparing this report is recorded in the audit work log; see SHA-256 `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`. No test or data validation was run because this report makes no code/data changes.

To audit this club, first identify or add the intended twelve game roster records and stable roster identities, then match those records to EA source IDs. This report does not assert that EA's list lacks player ratings; it documents that the current game ledger has no corresponding Wolves batch.

