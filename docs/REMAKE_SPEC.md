# Game reconstruction specification and expansion architecture

## Product target

A genuine independently implemented HD remake, with the same arcade pace and mechanics as the 1993 Famicom title, and a separate expanded mode offering editable rosters, clubs, tournaments, careers, growth, buildings and online play. Do not treat the game as an NES ROM in a wrapper. The shipping art must be authored specifically for this project, not ROM-ripped sprites.

## Original reference analysis

The original has a six-person active lineup per team, twelve Japanese players including reserves, two 2-minute halves, no usual offsides/foul penalties, defensive body attacks, context-sensitive pass/shoot, aerial moves, goalkeeper contact, a timed aerial near-apex super-shot with no directional input, a different alternate aerial shot with direction, special shots per Japan player and per opponent, changing field weather/conditions, tactics, team meetings/mood and items. A guide describes 16 wins and 70 points for league qualification followed by four finals; local Match mode supports up to four people when players 3 and 4 control keepers. References listed in README.

## Current status, independently verified

| Subsystem | Current build | Historical accuracy |
|---|---|---|
| Core 6v6 simulation | Playable, automated smoke + model test | Approximate: needs motion/tackle/keeper calibration |
| Characters/graphics | New large scalable HD chibi renderer | Original-inspired, not original sprite-for-sprite |
| Japan roster | 12 names, positions, ratings, shot names | Names/ranges sourced; different references disagree on one Kunio power stat |
| International rosters | 13 nations selectable, fabricated non-Japan player profiles | Requires historical verification |
| Japan super shots | 12 different transformed visual effects + motion presets | Approximate, not historically verified animations/behavior |
| Opponent super shots | Team-themed presets | Names/visual designs not historically verified |
| Weather/terrain | Wind, rain, storm, tornado, Classic weathered/grass/dirt/sand, wet patches | Subset implemented; balancing approximate |
| Goalkeepers/AI | Simulated and interactive | Not exact 1993 control patterns |
| League | Persistent W/L/points and four finals | Qualification inspired by guide; menus/points need reference validation |
| Penalty kicks | Five rounds, goalie opposition and ball visualization | New implementation, historical timing not exact |
| 2-player local | Keyboard + dual gamepad | Functional initial support, needs extended device test |
| Four-player GK assignment | Not built | Future parity milestone |
| Team meetings/mood/items | Not built | Future parity milestone |
| Clubs | Basic local club creation/selection implemented | No club economy/facilities/transfers yet |
| Career, buildings, growth, online | Not built | Future expansion goals |

## Source architecture

Data flows: `src/data.js` defines teams/rosters/shot parameters → `src/engine.js` holds physics and match state → `src/render.js` draws the current state → `src/main.js` chooses modes/rosters, handles match lifecycle and saves → `src/input.js` maps per-device action events into the match engine. None of the rendering assets need to be imported into core simulation. `play.html` is the distributable single-file build output compiled from modular sources by `tests/build.py`.

## Important implementation gaps for full fidelity

1. Reference-capture original gameplay frame-by-frame, including allowed use of reference footage for every special shot, original opponent rosters, and special ability activation conditions.
2. Record collision, acceleration, attack hitboxes, stun/knockdown durations, goalkeeper catch/block rules, and ball trajectory against time-indexed reference data.
3. Replace geometric character renderer with an authored 1080p/4K artwork atlas, including 8-way idle/run/jump/slide/tackle/knockdown/goal/keeper and each shot's keyed animation.
4. Implement original 1993 controls: A/B context matrix, timed aerial special, alternate arc, ball juggle, dashes, cooperative aerial flip kicks and goalie-specific moves.
5. Build full historical opponent database (not guessed), team meeting mood dialogue/items, pre-match tactics/formation, four-player GK mode and original campaign progression.
6. Add deterministic simulation step/replay, structured asset editor, robust save/version migration, collision and gamepad regression suites.

## Future feature architecture after original game parity

Add `CompetitionDefinition` to data for knockout/groups/leagues; `ClubDefinition` and stadium/facility entities; `CareerSave` with schedules and financial state; `PlayerProgression` as a **separate Expanded ruleset** so Classic remains consistent; new shot-effect authoring in JSON (render/state profile); and server-authoritative matchmaking with lag compensation, reconnection and anti-cheat. Online cannot be implemented merely by adding a menu; the match simulation must be synchronized deterministically or server-authoritatively.

## Suggested development milestones

- **M1 (implemented baseline):** independent browser play, HD graphics, Japan data/13 teams, AI, controls and super-shot prototypes.
- **M2:** reference-verified movement/ball/keeper mechanics and all original actions.
- **M3:** full authentic player/shot/teams artwork, shot behavior and historic roster data.
- **M4:** all original modes, 4-player, team meetings, authentic playoffs and sound assets.
- **M5:** data schemas, team/club and tournament modding tools, player growth/career/facilities.
- **M6:** online match server, accounts, seasons and cloud saves.

Do not mark M2–M6 as complete until each is implemented and gameplay-tested. No production schedule is promised without scope, asset pipeline and test devices.

## Current iteration v0.4

The actual renderer is now intentionally *closer* to the original proportions by using expressive hand-rendered vector cartoon faces with multiple hairstyles and reaction states, not large full-body figures. Match field expanded 2.0× in width and 1.71× in height; camera scrolls both axes and radar shows the whole pitch. Real gameplay changes include charged shots, fixed own/opponent targeting, smarter pass scoring and an AI-strategy selector. A JSON-backed in-browser club creation workflow is functional and persistent, distinct from the planned deeper club simulation. This does not count as frame-perfect fidelity.
