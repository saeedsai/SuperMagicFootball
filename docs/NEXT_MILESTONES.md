# Supermagic Football — Overall Roadmap v0.8.22.1
**14 October 2026.** Supersedes v0.8.22 active priorities. Historical roadmaps remain included for reference.

## Shipped this iteration — urgent Super Shot control rework
- Aerial: Jump → Dribble = regular bicycle, Jump → 2×Dribble = Super Bicycle; Jump → Shoot = regular head, Jump → 2×Shoot = Super Header.
- Carrying ball: Jump → Shoot = elevated normal; second airborne Jump → Shoot = Super Shot.
- Reuse original hold Dribble → Jump stationary loft as an aerial ball source.
- Same special shot physics and transformed **ball** graphics for ground Super Shot, Super Header and Super Bicycle. No shoot ability → stronger ordinary untransformed move.
- 0.32s tap window, cancellation guard, online/offline built-in controls Help update, 12 new acceptance cases; **357 total QA cases**.
- **54 Node + 34 browser regression scripts passed**, browser in six bounded groups; physical devices still unverified.

## Next milestones
| Priority | Version | Objective / acceptance gate |
|---|---|---|
| P0 | **v0.8.22.2** if needed | Real iOS/Android, physical gamepad and double-tap accessibility trials; tuning of the 0.32s window, normal header/bicycle delay, Super Shot scoring against keepers |
| P1 next | **v0.8.23 Audio** | License-cleared/original menu + halftime music, distinct goal/tackle/save/stun/Super Shot SFX, mute/volume, browser audio-unlock rules, offline tests |
| P1 | **v0.8.24** | Goalkeeper diving and long-match balancing, player animation polish, mobile performance |
| P1 | **v0.8.25** | BPW historical personality, signature moves and individual characters (no broad 2026 roster rebuild) |
| Future | Tier/ability | Common/Silver/Gold/Star/Superstar based on *verified positional OVR*; Gold+ Super Shot OR five-level Super Defense, unique tricks/celebrations; enforce world rarity caps, BPW exceptions |
| Future | Career | Age-based decline/improvement, five growth-potential categories, performance-based progression, reusable manager customization and constrained named appearance palettes |
| Future | Visual/environment | 20+ famous stadiums, weather (wind, rain, lightning, tornado), improved grass/mud/players, 20–30 celebrations, 10–20 sad reactions, national-symbol changed-ball attacks |
| Much later | Roster | Broad 2026 roster/FC ratings/value/appearance verification **remains deferred by user request** |
| Later | Product | Competition depth, Career extensions, multiplayer and classic-game fidelity |

## Immutable design constraints
- Four action buttons only: Pass/Shoot/Dribble/Jump, no separate Special, Swap, Sprint or goalkeeper dive.
- Six formations only: 2-1-2, 1-2-2, 2-2-1, 1-3-1, 1-1-3, 3-1-1 (one GK + five outfield).
- Jump-first airborne Pass crosses; Pass-first Jump never crosses. Hold Pass release lofts. Jump+direction held sprints. Dribble off-ball swaps.
- Goalkeepers dive, catch and distribute automatically; six BPW mixed WC squads remain 1998/2002/2006/2010/2014/2018, with 72 nonrepeating tournament selections.
- Position-specific OVR is rounded mean of exactly six role stats. Unverified Gold/Star/Superstar restrictions and Career growth remain inactive.
- Historic 218-feature snapshot 41 Done / 120 Partial / 57 Missing is *not* a wholesale new audit. v0.8.22.1 is a control rework and neither invents nor increments historical feature-count completions.
- 357 acceptance cases are documented but not all individually certified; automated scripts and physical hardware have different evidence status.
