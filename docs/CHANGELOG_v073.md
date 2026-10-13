# Supermagic Football — v0.7.3 changelog (13 October 2026)

## Scope of this single milestone

1. New independent `src/morale.js`: five manager talk options, four stable personality reactions, reproducible positive and backfire results, bounded mood updates, and gameplay scaling.
2. Match engine: per-player 0–100 morale, stored across on-field/bench changes; goals affect both teams; morale changes speed, shooting and physical clashes. Pregame/halftime talks may occur once per team per phase.
3. Pre-match setup choices, halftime decision controls, talk-result feedback and live HUD morale descriptions.
4. HD renderer: conceding players shake and cry visibly, hit players show sparkles, and scoring teams use five varied celebratory motions/captions; goal banners take priority over temporary status toast messages.
5. Offline single-file build, modular PWA dependency list and cache version updated; old browser save prefixes and legacy imports unchanged. Saves exported from this release carry version 0.7.3.
6. Bounded milestone documentation, 126-item feature tracker and dedicated Node+Chromium desktop/mobile QA added.

## Deliberately deferred

- Gift favorites/dislikes, telephone calls, one-to-one character dialogues and exact original Nintendo mood values remain **missing**.
- Signature animations for each of 2,592 players and more involved manager interactions remain **unfinished**.
- 100-point morale is a new mechanic inspired by the original; it is **not** a reproduction of the authentic 0–15 mood logic.
- Player creator, real-world roster replacement, rare goalkeeper defensive moves and network play remain in subsequent milestones.
