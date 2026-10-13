# Supermagic Football — v0.8.0 Alpha — Changelog

**Scope:** first playable defensive and goalkeeper rare abilities; no simultaneous expansion of club/career/creator features.

- New `src/abilities.js`: validated definitions (2 defense + 2 goalkeeper); stamina, cooldown, reach and rarity constraints.
- Extended `withStats()` with original character assignments and backward-compatible legacy skill fallback.
- Extended `GameEngine` with separate defender charge/stun/disarm and goalkeeper deflection moves, match cooldown persistence, AI attempts and manual Special button context.
- Renderer adds animated energy rings and callouts; HUD readiness now indicates defensive move cooldown when out of possession.
- `src/fitness.js` adds associated action costs; no large alteration to ordinary movement, shots or career progression.
- PWA cache manifest includes abilities module and new version key; single HTML rebuilt and verified with tests.
- Added Node gameplay tests, desktop Chromium keyboard and Android emulated touch tests, desktop/mobile screenshots, and regression notes.

**Not delivered:** exact 1993 Nintendo physics, every defender/GK super, aerial teamwork, player creator, official club faces/rosters, online multiplayer or production deployment.
