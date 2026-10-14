# Future player tiers, Super Shot/Super Defense specialization and dribble rules — v0.8.20.1
**Recorded 14 October 2026. BACKLOG ONLY — no entitlement, animation, special-level, or input behavior is changed by this release.**

## Binding requirements for later implementation

| Tier (canonical primary-position OVR) | Inclusive OVR | Future allowed specialization | Maximum level | Goal celebration | Dribble/tricks |
|---|---:|---|---:|---|---|
| Superstar | 96–100 | Super Shot **or** Super Defense | 5 | Unique eligible | Unique dribble and unique trick eligible |
| Star | 91–95 | Super Shot **or** Super Defense | 3 | Unique eligible | Unique dribble and unique trick eligible |
| Gold | 80–90 | Super Shot **or** Super Defense | 2 | Unique eligible | Unique dribble and unique trick eligible |
| Silver | 70–79 | Neither | 0 | Standard/shared | Standard dribble, **no tricks** |
| Common | 1–69 | Neither | 0 | Standard/shared | Standard dribble, **no tricks** |

- **Exactly one special-ability category at most per player**: `specialType = 'shot' | 'defense' | 'none'`. A player must **never** be assigned both. Eligibility does not mean every Gold+ footballer must have a special. A special defender can be a Star/Superstar; position does not force an assignment. Goalkeepers need a design choice about whether their existing automated special saves count as Super Defense; evaluate before rollout, and do not remove automatic basic dives or catches.
- **Level boundaries are the same for either category**. Superstar can have a level-5 Super Shot *or* a level-5 Super Defense; Star max 3, Gold max 2, Silver/Common no special. Special level remains distinct from ordinary tackles/saves, which all players must retain.
- All players retain **basic movement, tapping Dribble, running, passing, shooting and defensive actions** under the four-button control system. Only Gold+ may receive an *individually assigned* unique dribble style and unique trick move; Silver/Common use the default shared dribble and must have **no special trick activation**. Do not introduce any fifth button. Maintain the existing Jump-then-airborne-Pass cross contract.
- Unique celebrations are eligible for Gold+ only (20–30 total future animation library); all tiers may display normal reactions, including the separate future 10–20 crying/sad animations.
- Derive tiers from the **rounded six-stat OVR in the player's canonical primary position**, not position-swapped OVR or older persisted `rating` values. Do not use unverified generated statistics to grant privileges. Display per-slot tactical OVR as before.
- Rarity outside historical BPW squads is **fewer than 70 distinct Stars** (0–69) and **fewer than 30 distinct Superstars** (0–29). Deduplicate identical players across clubs and national teams by canonical identity. BPW six-year historical squads (1998, 2002, 2006, 2010, 2014, 2018) can contain many Stars/Superstars and are excluded from those counts, but the tier-level and exclusive-specialization rules still apply.
- Data migration must preserve existing saves and let historical classic-game special mechanics remain playable until audited, instead of silently downgrading every player on loading older saves. No arbitrary elite-level inflation to fill rarity quotas.

## Acceptance tests before activation
1. Formula tests for OVR 69/70/79/80/90/91/95/96/100; assert nonoverlapping tier boundaries.
2. Exclusive ability validation for every roster: never both categories; no special for Silver/Common; Gold ≤2, Star ≤3, Superstar ≤5, for Shot **and** Defense.
3. Standard dribble always accessible; no individual tricks for Silver/Common; unique dribble/trick selection for eligible Gold+; check touch and keyboard combo timing.
4. 216-team roster inventory and expanded 2026 audit: source-backed birth date, club, canonical ID, primary position, stats, ability level and specialty; count distinct elite players excluding BPW.
5. Migrate old saves and handle currently seeded super abilities which violate proposed gates; run repeated Node/browser regression and actual device QA.
6. Basic goalkeeper action stays automatic; defense specials never require a new button and should be balanced for AI and player-controlled teams.
7. Abilities have gameplay impact and visible animations rather than merely changing badges or values. Balance offensive/defensive special levels against each other.

## Dependencies and schedule
Roster/stat verification → OVR accuracy and canonical identity deduplication → ability assignment design and saved-data migration → Gold+/Silver/Common dribble/trick and celebration gating → new Super Defense levels 1–5 with abilities, artwork and counterplay → broad regression and gameplay balance. **No player-tier enforcement in v0.8.20.1.**
