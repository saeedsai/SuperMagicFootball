# Future Graphics, Stadiums, Reactions and Player Tiers — v0.8.20 backlog
**Recorded 14 October 2026. DOCUMENTATION ONLY — none of these new items is implemented in v0.8.20.**

## 1. Player celebrations and reactions
- Implement **20–30 unique goal celebration animations** in total; variants have distinct body language, facial expressions, optional partner/solo interactions and animation interruption handling. Gold/Star/Superstar players may be assigned unique celebrations; Silver/Common use shared generic celebrations when the tier system ships.
- Implement **10–20 unique sad/crying animations** in total following a conceded goal or end-of-match defeat. Tailor reactions by player personality, circumstances and moment; all tiers may react to losses. Keep the reactions cartoon-like, readable, and optional in accessibility settings where motion is reduced.
- Asset work includes state transitions, facial animation, timing/skip behavior, crowd reaction and performance budgets. No artificial menu buttons.

## 2. Graphics and environmental effects
- Improve 2D/cartoon player illustrations (faces, expressions, kits), animation quality (run, pass, dive, tackle, landing, reaction), and the pitch (grass patterns, mud, worn ground, puddles and surface-type variations).
- Weather: rain/wind/lightning/tornado effects with **actual bounded arcade effects** on ball trajectories, traction and visibility; avoid random unfair instant outcomes. Distinguish visual-only modes from gameplay-affecting modes; graphics scalability and a reduced-flashing/reduced-motion option are required.
- Super shots: create additional transformations of the ball using animals, fruit, objects, symbols, geometric shapes and funny themes. Nationality/country inspirations require source-aware art direction and must not reinforce stereotypes; distinctive animations and game balance are acceptance gates. Ordinary shots preserve normal ball shape.
- Stadiums: **20 named famous stadiums** with stadium-specific background, crowd, turf/grass type, pitch markings and ground appearance. Terrain/gameplay affects must be bounded and regression-tested; research naming/image licensing and asset provenance before inclusion. No unlicensed photographic assets.

## 3. Position OVR tier contract (FUTURE; not enforced in this build)
| Tier | Range, inclusive | Super Shot | Assigned unique goal celebration |
|---|---:|---|---|
| Superstar | 96–100 | Levels 1–5 | Yes |
| Star | 91–95 | Levels 1–3 | Yes |
| Gold | 80–90 | Levels 1–2 | Yes |
| Silver | 70–79 | No | No; shared celebrations |
| Common | 1–69 | No | No; shared celebrations |

- The 90/80/70/95 boundaries are deliberately nonoverlapping. "Over 95" means 96+, and "over 90" means 91+.
- Use the **rounded six-stat OVR for the player's canonical/primary position**, not an arbitrarily inflated stored `rating` or the context-specific rating in a different formation slot. On-pitch position OVR can still be displayed as a tactical aid.
- Among **distinct real-world player identities** (a player appearing in club and national team is counted once), excluding all BPW rosters: at most **69 Stars** and **29 Superstars**. Do not count copies of the same footballer as different players; do not count BPW members toward the caps.
- BPW teams may include many Stars and Superstars, as requested. Their membership is based on historically documented performances at the six specified World Cups.
- Only Gold and higher can have Super Shots / assigned unique celebrations. Only Star and Superstar can reach level 3; only Superstar can exceed level 3. The prior special-level roster seeds **currently violate these future rules**: migration + recalibration are a prerequisite, not silently changed in this release.
- Future classification research must use dated official team lists, EA SPORTS FC ratings (with edition/date and licensing caveat), performance evidence, and a documented player-by-player rationale. No live price/rating feeds unless legally available and sourced. Balance arcade values separately from reality where intentional and documented.

## 4. Release gates and sequencing
1. Canonical 2026 roster identities, clubs and positions; audit unverified data and common cross-team duplicates.
2. Source-backed stat calibration, OVR/tier distribution analysis, eligibility migration and ability balance (do not grant level 5 to incorrect players).
3. Celebration and sadness animation system with asset library, pose tests, and tier gating.
4. New ball-shape VFX, weather physics and stadiums with performance, accessibility, art/provenance and regression QA.

See `FEATURE_BACKLOG_V0820.csv` for individually trackable acceptance criteria. Historical 218-item matrix is preserved and is **not** recalculated by appending these future requests.

## October 14 v0.8.20.1 extension (supersedes shot-only gating above)
**Still documentation only.** For each Gold+ player, the future eligibility is **either Super Shot or Super Defense**, never both. Both use shared level caps: Gold max 2; Star max 3; Superstar max 5. Silver/Common cannot use either. Gold+ eligible for unique dribble styles and individual tricks; Silver/Common retain standard dribble and have no individual tricks. See `SPECIALIZATION_AND_TIERS_BACKLOG_v08201.md` for the authoritative future specification. Prior sections describing Shot-only special gating are superseded by this extension.
