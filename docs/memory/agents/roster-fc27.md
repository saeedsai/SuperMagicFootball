# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
Verify official EA FC 27 ratings and real-world team/identity metadata, one exclusively claimed club at a time. Never alter gameplay, other teams, art, UI or QA framework.

## Current checkpoint
- **Bayern club26_1 delivered:** [source commit `6c396a9`](https://github.com/saeedsai/SuperMagicFootball/commit/6c396a98023ec36ddc59caa6453346ebd57c7253), [test check `3bc2db2`](https://github.com/saeedsai/SuperMagicFootball/commit/3bc2db27d529b6cd1bad024b4b538698f5feae1f). 12 official EA OVR matched, 72 face values matched; 3 jersey changes, 3 age fills, 12 sourced heights, 57 field-level edits. Full [handover](../../CLUB_PLAYER_METADATA_BAYERN_20261016.md), immutable [metadata ledger](../../PLAYER_METADATA_BATCHES_20261016.json).
- [Active Modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38904974985): **134/134 Node tests PASS**, source/runtime parity and full club roster history passed. Original full historical Chromium/Node and Pages runs **cancelled by concurrent commits**, not certified. Fresh hosted phone and PC interaction not tested.
- Earlier Arsenal club26_0 completed; do not repeat its checkpoint.

## Next smallest action
Before further edits, reread latest GitHub `dev` and [active roster locks](../../agent_coordination/claims/). Next independent batch is Manchester City `club26_2`, then PSG `club26_3`, Barcelona `club26_4`, Manchester United `club26_5`, Real Madrid `club26_7`. Make one new claim for one small team.

## Ownership and exclusions
Bayern lock `roster-club-club26_1` must be released with evidence. Do not open or edit other agents' memory files; shared project memory is read-only to this agent. Preserve 2GK/3DF/4MF/3FW, all player IDs, save order, gameplay and unrelated docs.

## Evidence
Official EA Bayern FC 27 base cards: https://www.ea.com/nb/games/ea-sports-fc/ratings/teams-ratings/fc-bayern-munchen/21 ; DFB 2026/27: https://datencenter.dfb.de/en/competitions/bundesliga/seasons/2026-2027/teams/bayern-munich ; heights: https://footballsquads.co.uk/ger/2026-2027/bundes/bayern.htm .

## Cleanup
This is the only recent checkpoint, not a chat transcript. Remove stale assumptions and old test tallies on next edit.
