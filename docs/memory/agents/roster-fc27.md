# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
One GitHub-claimed club per small batch: official EA FC27 launch overall + six headline stats, current registered squad, age, nationality, height and shirts. Do not modify other clubs or gameplay/UI/graphics.

## Current checkpoint
- **PSG club26_3 completed:** source commit [`a6c5d86`](https://github.com/saeedsai/SuperMagicFootball/commit/a6c5d8649fb1b4d2e8ec8f9e70c607abc50de866), corrected ledger `53719fa`, final tested data `3f5cf46`. [PSG handover](../../CLUB_PLAYER_METADATA_PSG_20261016.md), [roster history ledger](../../CLUB_ROSTER_BATCH_LEDGER_20261016.json), [metadata audit](../../PLAYER_METADATA_BATCHES_20261016.json).
- Replaced out-transferred Bradley Barcola with Warren Zaïre-Emery at unchanged PSG slot-9 ID; OVR 83 and EA six-face values verified. 12/12 current PSG official ratings and 72/72 face stats, 4 shirt corrections, 4 age fills, 12 heights, 67 individual record field edits plus separate 2-source-field follow-up, game engine and unrelated team squads untouched.
- [Modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38925059044) **174/174 PASS**; [full historical Node/Chromium census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38925059080) **131/131 Node + 71/71 browser PASS**; [GitHub Pages](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38925057855) **SUCCESS**. Hosted physical-phone / PC device smoke unverified (unreachable externally).
- Arsenal, Bayern, Manchester City previously complete; don't redo their audited batches.

## Next smallest action
Live claim recheck, then Barcelona `club26_4` as the next one-club batch. Subsequent: Manchester United `club26_5`, Real Madrid `club26_7`, Liverpool `club26_9` (Bradley Barcola currently **not** in 12-player Liverpool selection), Tottenham `club26_29`. Each needs independent new ownership.

## Ownership and exclusions
PSG `roster-club-club26_3` is **released upon completing this checkpoint**, never rely on memory to establish availability. Do not open or edit other agents' memory files. Shared project memory is read-only. Retain 2GK/3DF/4MF/3FW, player IDs, engine tuning and save compatibility.

## Evidence
Official EA PSG: https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/paris-sg/73
PSG 2026/27 official roster: https://www.psg.fr/en/mens-football/squad/season/2026-2027
Physical biographies: https://footballsquads.co.uk/france/2026-2027/ligue1/psg.htm
Barcola Liverpool transfer: https://www.reuters.com/sports/soccer/liverpool-bring-marquee-forward-signing-barcola-psg-2026-08-31/

## Cleanup
Do not append old transcripts; specialist GitHub history and files are authoritative.
