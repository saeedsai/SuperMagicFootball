# v0.7.0 alpha — Team command center & identities

Release date: 2026-10-13. Incremental update on v0.6.3.

## Delivered
- All 216 built-in team identities display national ISO-region emoji flags; clubs also have original procedural inline SVG shields. These are **not** official club trademarks; country symbols may depend on platform fonts.
- Team plans persist under stable team IDs, including players/formation/captain/set-piece selectors/attack/defense. Imported/exported saves include `teamPlans`. Old saves migrate safely because the field is optional and safe defaults are generated.
- Unified pre-match setup and paused/halftime command center. Formation supports existing four tactical layouts, and validates a single goalkeeper and unique six starters. Live substitutions preserve clock, score and player fatigue.
- Three attack styles and three defense styles alter AI positional and decision behaviors. A selected on-field captain provides a small passing quality boost. The designated penalty taker affects penalty accuracy.
- The extended roster cards retain GK jump/skill stats (regression fixed).

## Incomplete and disclosed
- Free-kick and corner takers are assigned and saved **only**. Neither foul restarts nor corner kick gameplay exists yet.
- Club shields are ORIGINAL placeholders, not real crest copies. England uses UK region flag and native emoji fonts differ; an SVG country flag pack remains required for visual consistency.
- No substitution number/rules; players can swap between bench and pitch without official limits. Career squad management remains separate.
- AI effects are first-pass behavioral tuning, not human-reviewed match balance or fidelity to Famicom timing.
