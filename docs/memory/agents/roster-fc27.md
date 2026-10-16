# Agent memory — FC27 player database

**Agent ID:** `roster-fc27` | **Updated:** 2026-10-16

## Mission
Verify official EA FC27 ratings and real-world club player data, one club under its own live GitHub claim at a time. Preserve other clubs, persistent IDs, game mechanics, art, CI and save format.

## Current checkpoint
- **PSG `club26_3`**: [handover](../../CLUB_PLAYER_METADATA_PSG_20261016.md), [immutable roster ledger](../../CLUB_ROSTER_BATCH_LEDGER_20261016.json), [player metadata audit](../../PLAYER_METADATA_BATCHES_20261016.json); [live claim](../../agent_coordination/claims/roster-club-club26_3.json).
- PSG FC27: current 12/12 official ratings, 72/72 face stats verified. Transfer correction Bradley Barcola (Liverpool) → Warren Zaïre-Emery (PSG) at unchanged slot ID; 12 heights, DOB/age, shirt provenance updated, custom arcade mechanics untouched.
- Arsenal, Bayern, City club26_0/1/2 previously delivered, do not revisit without a new separate claim. Live CI and Pages outcomes belong in the PSG handover, not stale memory assumptions.

## Next smallest action
Verify PSG exact source commit via GitHub active/full QA, record results honestly, release PSG claim. Then separately claim Barcelona `club26_4`, Man United `club26_5`, Real Madrid `club26_7`, Liverpool `club26_9` (Barcola), Tottenham `club26_29`.

## Ownership and exclusions
PSG only; all unrelated agents' memories, shared context, engine, UI, art, other clubs out of scope. Strict squad quotas 2GK/3DF/4MF/3FW. Always inspect latest `dev` and live claims before editing.

## Evidence
EA FC27 Paris SG: https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/paris-sg/73
PSG official season squad: https://www.psg.fr/en/mens-football/squad/season/2026-2027
French Ligue 1 physical biographies: https://footballsquads.co.uk/france/2026-2027/ligue1/psg.htm
Barcola transfer: https://www.reuters.com/sports/soccer/liverpool-bring-marquee-forward-signing-barcola-psg-2026-08-31/

## Cleanup
Keep only current batch checkpoint; full history is in GitHub ledger/commits.
