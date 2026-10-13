# Five-Level Super Ability Specification — v0.8.16

## Tier calculation

The special-shot, defensive-super and rare-goalkeeper-special levels are independent values, each constrained to integers 1–5. User overrides `superShotLevel`, `superDefenceLevel` and `gkSuperLevel` are respected first; valid legacy `superAbility.level`/`gkSuperAbility.level` are respected next. Otherwise, star name and existing rating determine the default tier. Ordinary non-named players cap at level 3; fictional academy placeholders default to level 1.

### Default rarity

- Level 5 (four unique named identities): Lionel Messi, Cristiano Ronaldo, Kylian Mbappé, Erling Haaland.
- Level 4 (twelve eligible names, **eleven found in current selectable rosters**): Lamine Yamal, Vinícius Júnior, Mohamed Salah, Neymar, Harry Kane, Kevin De Bruyne, Jude Bellingham, Rodri, Ronaldinho, Ronaldo Nazário, Zinedine Zidane and Pelé.
- Levels 1–3 are assigned by existing player ratings, except manual overrides. Multiple club/national copies of the same named player use the same default tier.

These levels are fictional gameplay balance classifications, not official EA ratings, Transfermarkt values or real-world ability measurements. Edited rosters may explicitly override levels and are not automatically subject to the default rarity limit.

## Scaling

| Tier | Impact multiplier | Super-action fatigue multiplier | Defensive stun multiplier | Rare GK reach multiplier |
|---|---:|---:|---:|---:|
| 1 | 1.000 | 1.00 | 1.000 | 1.00 |
| 2 | 1.055 | 0.92 | 1.055 | 1.04 |
| 3 | 1.110 | 0.84 | 1.110 | 1.08 |
| 4 | 1.165 | 0.76 | 1.165 | 1.12 |
| 5 | 1.220 | 0.68 | 1.220 | 1.16 |

The *shot speed* is preserved for fish, ghost, mole, piranha, bird, banana, books, ninja and nuts style moves; ordinary power-type super shots may gain 1.8% velocity per tier. Higher tier does not turn every transformed ball into a cannonball.

## Gameplay integration

- Regular shots unaffected. Level-aware impacts and fatigue apply only when a super shot or apex combo-super triggers.
- `activateDefence` applies stronger stun and a lower stamina cost; collision and cooldown rules remain in force.
- `activateKeeperSuper` improves clearance force and interception reach, with lower fatigue. It does not grant a magic move to an unassigned goalkeeper.
- In-match and team-management UI surface the current level.
- Old saves still import without fields because defaults are generated deterministically from player data and named tier lists.

## Outstanding work

A skill growth/XP system for special levels, additional unique super moves, defensive counter mechanics, balancing versus five CPU difficulties, club/national data verification, and physical-device acceptance remain separate backlog milestones.
