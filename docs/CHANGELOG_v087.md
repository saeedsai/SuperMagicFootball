# Changelog — v0.8.7 (13 October 2026)

**Added:** `src/dribbles.js` with ten distinct style profiles; stable roster style assignment, explicit style editing, numeric DRB stat, player-specific double-tap tricks, cooldowns/stamina, defense-aware contested moves, AI dribbling decisions, comic trick effects and DRB/STYLE in Squad Management.

**Changed:** Team career MF/FW growth includes the new Dribbling stat; player's lofting dribbles animate the ball while the trick is active. Existing `tackle` considers temporary dribble protection. Both modular and standalone builders include the new module. Version bumped to 0.8.7.

**Testing:** New Node and browser dribble tests; 17 existing+new gameplay suites passed; 17 browser scripts passed when two intermittent parallel failures were rerun sequentially; fullscreen and save import tested separately.

**Still missing:** physical devices, exact historical dribble moves, interactive penalty movement, custom button mapping, rewritten UI/flags, HD faces, full player/club realism, online.
