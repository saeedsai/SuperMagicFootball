# Changelog — v0.6.1 alpha (2026-10-13)

## Added
- Explicit five-level CPU difficulty behavior profiles: Rookie, Easy, Normal, Hard, Expert.
- CPU reaction-delay tracking, passing/decision probabilities, positional anticipation, defensive pressure and keeper reading.
- Difficulty selector in match setup; live CPU difficulty from pause panel; explanatory text in Settings.
- AI penalty kicker/keeper level scaling.
- New test suites `tests/ai_difficulty.mjs`, `tests/ai_browser_qa.py`.

## Fixed
- Rookie level zero no longer silently maps to Normal.
- Service worker cache bump and caching of `src/ai.js` plus continental engine modules.

## Kept unchanged
- Original 216-team content, 151 continental participants and manager career mode.
- Previous 89 requirements and findings remain; requirement #90 is appended in the 90-item tracker.

## Outstanding
- Graphical national flags and club emblems, full team management, stamina with gameplay effects, morale and speeches, historically accurate funny animations, advanced goalkeeper moves and special defenses, exact original-game mechanics, true 2026 rosters, online multiplayer, native real-device tests.
