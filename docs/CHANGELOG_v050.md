# v0.5.0-alpha — Oct 13, 2026

## Gameplay
- Rebalanced slower AI/player movement, passes, normal shots and powered shots.
- Three out-of-possession contextual actions: slide tackle, pursue/tackle, body challenge.
- Scoring now holds kickoff for 3.3 sec while players dance/jump and comic goal graphics appear.
- Match speed choices Relaxed/Normal/Fast, with slower core default compared to v0.4.

## Content & graphics
- New 32 national, 32 club and 6 iconic team datasets in addition to original 13.
- Exactly 12 roster slots per team; 83 selectable total, 996 roster entries.
- Identical player name maps to same procedural caricature across teams; major stars get illustrative face presets, all editable.
- Player customization skin/hair/face shape, eyebrows, eyes, nose, mouth, beard, accessories, scars and freckles.

## Career
- Choose club; local persistent 8-team 14-round double-round-robin; 3-stage knockout cup.
- Weekly receipts, winnings, standings, XP, training, three upgradeable facilities and one-for-one purchases.
- End-of-season position payouts and start-next-season capability.

## Quality and known limitations
- Unit-tested 83 team data/roster lengths/season progression and goal/penalty logic.
- Chromium desktop/mobile tests for team selection, manager hub, transfer, player studio, goals and career match lifecycle.
- Some real club/player affiliations may not precisely reflect Oct 2026; missing names are flagged. No official portrait assets. This is not 11v11 and has no server/online mode.
- Known UI testing quirk: Chromium mobile automated clicks can asynchronously update menu after a programmatic finish; account for that in tests. Real-device touch QA remains needed.
