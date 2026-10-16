# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
Verify official EA FC 27 club player OVR/face stats and current real-world player details, in isolated claimed batches. Do not change gameplay, UI, art, other clubs, or CI infrastructure.

## Current checkpoint
- Small Bayern Munich `club26_1` 2026/27 OVR + 12 physical metadata / jersey batch. Claim: [roster-club-club26_1](../../agent_coordination/claims/roster-club-club26_1.json). New handover: [Bayern checkpoint](../../CLUB_PLAYER_METADATA_BAYERN_20261016.md).
- Source of truth for exact commit/test status is the handover, not this memory.
- Previous Arsenal batch is complete and logged in the immutable [player metadata ledger](../../PLAYER_METADATA_BATCHES_20261016.json); do not repeat it.

## Next smallest action
Check live `dev` and claims. If Bayern is delivered, select **Manchester City club26_2** only after reserving its free club-specific lock. Then PSG, Barcelona, Manchester United, Real Madrid as later separate batches.

## Ownership and exclusions
Read `AGENTS.md`, shared memory and own file; never open other agents' memories. One club lock at a time. No unsolicited deletes or cleanups of QA evidence used by other agents.

## Evidence
Official EA FC 27 Bayern ratings: https://www.ea.com/nb/games/ea-sports-fc/ratings/teams-ratings/fc-bayern-munchen/21; DFB 2026/27 registration: https://datencenter.dfb.de/en/competitions/bundesliga/seasons/2026-2027/teams/bayern-munich; FootballSquads physical biography: https://footballsquads.co.uk/ger/2026-2027/bundes/bayern.htm. Actual CI and Pages URLs recorded in the separate handover when verified.

## Cleanup
Compact current status only; old chat transcripts and superseded source dates omitted.
