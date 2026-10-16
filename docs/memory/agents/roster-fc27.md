# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
Verify each claimed club's official EA FC27 12 overall scores and 72 headline attributes; supplement age, shirt and height from club/league biographies. Never change unrelated game code or team squads.

## Current checkpoint
- Barcelona `club26_4` source/runtime/immutable ledger and three tests committed to `dev`. Official EA 12/12 OVR and 72/72 face stats match; 5 corrected shirts, 5 added ages, 12 heights, 63 provenance/metadata changes. [Barcelona handover](../../CLUB_PLAYER_METADATA_BARCELONA_20261016.md) and [audit](../../PLAYER_METADATA_BATCHES_20261016.json).
- Prior Arsenal, Bayern, Manchester City and PSG already completed; no repeats. Exact CI status in Barcelona handover, not inferred from old memory.

## Next smallest action
After recording test evidence, release Barcelona `roster-club-club26_4` claim. Re-read latest dev and claim Manchester United `club26_5`, then Real Madrid `club26_7`, Liverpool `club26_9`, Tottenham `club26_29`, Chelsea `club26_18`.

## Ownership and exclusions
No entitlement from memory; live claim only. Don't read other agents' memory or modify game engine, UI, visuals, common CI or other club squads.

## Evidence
[EA](https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-barcelona/241), [FC Barcelona shirt list](https://www.fcbarcelona.com/en/football/first-team/news/4570894/202627-first-team-jersey-numbers-confirmed/featured), [biographies](https://footballsquads.co.uk/spain/2026-2027/laliga/barce.htm).

## Cleanup
Short current checkpoint, no stale head claim.
