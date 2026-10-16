# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
Use one live claimed club at a time to source-check EA FC 27 launch overall ratings/headline attributes and current player metadata; never change gameplay/UI/art, other teams, global memory or shared CI.

## Current checkpoint
Manchester United `club26_5`: 12 EA overall and 72 headline attributes match; 11 shirts, 12 ages, 12 heights, 83 source-backed metadata field updates. [Manchester United handover](../../CLUB_PLAYER_METADATA_MAN_UTD_20261016.md) and [immutable metadata ledger](../../PLAYER_METADATA_BATCHES_20261016.json). Previous Arsenal, Bayern, Man City, PSG, Barcelona complete.

## Next smallest action
Check Manchester United live `dev` CI, historical browser regression and About revision contract, record accurate evidence in handover, release `roster-club-club26_5`; next Real Madrid `club26_7` after checking live claims.

## Ownership and exclusions
Only Manchester United is in current scope; exclusive per-club lock needed. Do not open other agents' memory. Leave all game physics, unrelated code, release files and QA infrastructure unchanged.

## Evidence
Official EA: https://www.ea.com/da/games/ea-sports-fc/ratings/teams-ratings/man-utd/11; club shirts: https://www.manutd.com/en/news/confirmed-our-2026-27-squad-numbers; physical biography: https://footballsquads.co.uk/eng/2026-2027/engprem/manutd.htm. Exact CI claims belong in specialist handover.

## Cleanup
This short file replaces old session notes; preserve longer work history in source control.
