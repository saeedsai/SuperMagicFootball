# Supermagic Football v0.8.16 — Super Ability Levels Phase 1

- Introduced `src/special_levels.js` for deterministic five-tier special move levels, rare star/superstar assignments and capped effects.
- Added independently configurable `superShotLevel`, `superDefenceLevel` and `gkSuperLevel` player fields while keeping old roster/edit/save formats compatible.
- Super-shot impact now rises with tier; only conventional power-shot velocity gets a small increase, preserving unusual fish/ghost/underground motion.
- Super defence has level-aware stun, readiness and stamina costs. Rare goalkeeper specials have level-aware reach, clearance force and stamina costs.
- Implemented dedicated game logic QA for 216 teams / 2,592 players, rarity and edited values, tier power/fatigue comparisons, and existing slow-shot invariants.
- In-match HUD and squad-management screens now show the applicable special level.
- Rebuilt offline HTML, advanced version strings to 0.8.16, and preserved all 216 requirements in the master feature tracker.
- No roster transfers, BPW team replacements, new super-move catalog entries, online multiplayer or special growth/XP progression were added in this bounded release.
