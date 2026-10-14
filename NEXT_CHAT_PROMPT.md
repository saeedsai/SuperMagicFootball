# Copy this entire message into the next ChatGPT chat

You are continuing my project **Supermagic Football**, a browser-based cartoon arcade soccer game. I have attached **Supermagic_Football_Clean_Handover_v0.8.22.1.zip**. **Extract and read this ZIP first**, especially `HANDOVER_README.md`, `docs/NEXT_MILESTONES.md`, `docs/SUPER_ATTACK_SEQUENCE_SPEC_v08221.md`, `docs/GAP_REGISTER_v08221.md`, `docs/MASTER_QA_TEST_CASES_v08221.csv`, `docs/TEST_REPORT_v08221.md`, `docs/FEATURE_MATRIX_218_ITEMS.csv`, and `docs/AUDIO_MUSIC_PRODUCTION_PLAN_v0818.md`. This ZIP is the complete source-of-truth baseline; do **not** assume you can access the old chat.

**Latest completed release is v0.8.22.1 Alpha.** Its playable build is `play.html`; editable ES modules are in `src/`; test scripts are in `tests/`. The archive has been intentionally cleaned of old checkpoints, historical duplicates, temporary outputs and stale logs. DO NOT try to reconstruct old release files or demand the previous chat.

## Immediate task
**Continue development with the next planned milestone v0.8.23: music and sound effects**, unless you find an important blocking bug first. Create original/license-cleared menu and halftime music and distinct sounds for goals, saves, tackles, stuns and the three unified Super attacks. Support working mute/volume, browser user-gesture audio unlock, offline operation, game performance and accessible visual feedback. Keep the game playable. Work directly on the source, test it, and deliver actual files this turn.

The user deliberately **deferred further global roster correction and rating audits until a much later stage**. Do not prioritize rosters now.

## Preserve these exact user-approved gameplay rules
- There are **exactly four action buttons**: Pass, Shoot, Dribble, Jump, plus movement. No extra special, sprint, swap, GK dive buttons. Hold Jump + direction runs; off-ball tap Dribble swaps players; GK actions are automatic.
- Exactly six six-a-side formations: **2-1-2, 1-2-2, 2-2-1, 1-3-1, 1-1-3, 3-1-1**, with one GK and five outfielders.
- **Jump first, then airborne Pass = cross**. Pass-first then Jump never crosses. Hold Pass and release = long/high pass.
- Current v0.8.22.1 Super attack rules override all older specs: airborne ball near player: Jump→Dribble ordinary bicycle, Jump→double Dribble Super Bicycle, Jump→Shoot ordinary header, Jump→double Shoot Super Header. On ground carrying: Jump→Shoot ordinary elevated shot, double Jump→Shoot Super Shot. Hold Dribble→Jump lofts the ball without jumping. Two-tap window is 0.32 seconds. Super Shot, Super Header and Super Bicycle must have the same special physics and transformed-ball graphics. Players without shoot-type Super ability use a stronger *ordinary* version with no transformation. No other combination should fire accidentally.
- Six mixed-world-nationality World Cup all-star teams only for **BPW 1998, 2002, 2006, 2010, 2014, 2018**; 12 selections per team (2 GK, 3 DF, 4 MF, 3 FW). Do not substitute clubs or fictional years. Their arcade ratings are editorial, not official FIFA ratings.
- Position-specific OVR is a rounded average of exactly six relevant stats; preserve saves and legacy ID compatibility. GK Diving remains the canonical stat.
- **Future, not active:** Common/Silver/Gold/Star/Superstar tiers based on verified OVR; Gold+ players may have either Super Shot or five-level Super Defense, never both; Gold/Star/Superstar unique dribbles, tricks, celebrations; age/growth Career, manager customization, named palettes, stadium/weather/visual upgrades. Ordinary rosters are deferred.

## How to work
1. Inspect files and identify versioned architecture and any real gaps. Do not implement from imagined source.
2. Follow `docs/NEXT_MILESTONES.md` and preserve the active requirements. Fix regressions first.
3. Add acceptance cases for every new feature to `docs/MASTER_QA_TEST_CASES_v08221.csv` or version its successor, and add executable Node/browser cases to the master runner.
4. `npm run build` builds the portable standalone `play.html` from editable source; `npm test` runs 54 inherited Node scripts. `node tests/master_contracts.mjs` checks QA catalog/source contracts. Browser QA requires Python Playwright + Chromium; prefer six sequential bounded shards using `python tests/run_master_suite.py --profile full --category browser --shard-count 6 --shard-index N`, N=0..5. Browser scripts had 34/34 separate passing results in the previous release. Tests may output screenshots/logs: do not pack transient artifacts.
5. Report test **scripts** versus **357 documented acceptance cases** separately. Not all 357 have been executed. Real iOS/Android/gamepad and one uninterrupted browser suite have not been certified. Do not invent a clean hardware pass.
6. Update `README.md`, current changelog, `docs/STATUS.md`, `docs/NEXT_MILESTONES.md`, current gap register, current test report, and future plan, keeping historical/checkpoint files out of the new final ZIP.
7. Return at the end: **(a)** implemented features, **(b)** actual tests and regressions + unresolved issues, **(c)** complete updated source+documentation **ZIP**, **(d)** separate standalone playable **HTML**, and **(e)** next-iteration roadmap. Verify ZIP integrity, and verify ZIP's `play.html` exactly matches the standalone file.

Important: do the development now, not just planning or suggesting future work. If there are ambiguities, make reasonable conservative choices and document them; ask only essential questions. This is an alpha project, and evidence of tests should be honest.
