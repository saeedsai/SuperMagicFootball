# Player attribute design — v0.6.2

## Data contract
`src/stats.js` owns stat normalization. Every player accessed through current match engine or game UI has **12 1–100 numerical fields**: `stamina`, `strength`, `aggression`, `defence`, `speedRating`, `shootPower`, `shootAccuracy`, `heading`, `passing`, `crossing`, `gkJump`, `gkSkill`. Note British spelling `defence` is new while old `defense` remains for compatibility. `speedRating` is numerical; `speed` keeps the old A–D text grade.

`superAbility` = null or `{type:'shoot'|'defence', id, name}`. `gkSuperAbility` is analogous but applies only to certain keepers. Typed ability presence alone is **NOT** equivalent to implemented animation/physics: keeper and defensive effects remain in 0.8 backlog.

The new 1–100 ratings for the 1993 roster are **inferred from prior arcade columns**, not the verified original game's numerical ratings. Fictional/academy players are similarly inferred. Explicitly saved numeric ratings take priority; missing fields are regenerated deterministically by player ID. Source `power`, `shoot`, `defense` and text `speed` remain untouched.

## Gameplay mechanisms
* Stamina capacity scales exertion; runtime `fatigue` ranges from 0 (rested) to 1 (exhausted). Human and AI running consume fatigue; stopping recovers slowly. Sprint and tackling cost more. Fatigue carries through new kickoffs (player ID keyed) and partially recovers at halftime. Each match still starts fresh except for a small seed from existing career condition.
* Effective speed multiplies by `1-0.47*fatigue` (bounded at ~0.53), plus numeric player speed. Regular and special shot power fall with exertion; accuracy errors worsen.
* Tackle knockdown chance depends on **attacker aggression and defence against defender strength and defence**, with slide bonus, bounded probability. Tackle knockdowns and cooldowns remain arcade physics, not proven historical mechanics.
* Regular shot speed depends on `shootPower`; aim spread depends on `shootAccuracy`. Airborne shot strength responds to `heading`; dedicated aerial collisions are still future work.
* Short ground passes use `passing`, wide-field aerial passes use `crossing` for dispersion and speed. Passing remains automatic to an AI-chosen teammate and a dedicated cross button is future work.
* Goalkeeper `gkJump` affects maximum ball height reached; `gkSkill` affects pickup radius, shot resistance and CPU PK anticipation.

## Version compatibility
Old localStorage and career JSON records continue to load. `withStats` is immutable with regard to its input object and fills missing fields. JSON editor presents the new explicit numbers; the game normalizes them on use. A future save schema should persist all new attributes consistently across matches and season growth.

## QA requirements still open
Real USB/Bluetooth gamepads, physical Android/iOS, complete cross-browser matrix, 2026 roster scouting validity, deep strike/heading/ability playfeel, football rules and original-Famicom frame-by-frame reference tests.
