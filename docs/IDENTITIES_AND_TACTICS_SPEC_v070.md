# Team identity and tactics model

## Identity
- `src/identity.js`: `countryCode`, `countryFlag`, `crestSVG`, `teamIdentity`; all built-in clubs map to a country and a procedurally generated non-official badge.
- Exact platform emoji appearance depends on font. To reach true HD-consistent flags in a later milestone, bundle licensed/open SVG geometry in the offline build.

## Tactics schema
Saved to `legend_teamPlans` by stable `team.id`, never by a changing list index.
```json
{"formation":"2-1-2","lineup":[5,3,4,0,1,2],"captain":3,"penalty":4,"freeKick":3,"corner":3,"attack":"Balanced","defence":"Balanced"}
```
- Validations: formation known, six unique valid player IDs, index 0 is a goalkeeper, captain active, roles in roster, styles supported.
- Attacking styles: Balanced, Possession (passing bias), Direct (more vertical movement/shooting).
- Defending styles: Balanced, High Press (more aggressive chasing), Deep Block (less chasing and more compactness).
- Designated captain must be an active player; provides small pass coordination bonus.
- Penalty taker shoot accuracy affects shootout dispersion. Free-kick/corner assignments have no active set-piece engine yet.
- During paused changes, `GameEngine.applyPlan` preserves match clock, score, compatible fatigue and existing on-field player locations, moving players toward formation homes.
