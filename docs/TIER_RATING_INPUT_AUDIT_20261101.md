# Tier and rating input audit — 1 November 2026

## Purpose

The owner reopened source-backed tier classification and real-player rating reconciliation. This read-only audit identifies which existing fields can support that work without assigning a tier or changing any player data.

## Current data coverage

`data/players/` contains exactly 2,676 records across the seven groups: 156 arcade, 384 national26, 384 club26, 72 legends, 1,596 continental, 72 BPW World Cup, and 12 BPW all-time.

At this source snapshot:

- No record carries any of the six game attributes in its canonical `POSITION_OVR_STATS` set as direct data fields. `src/stats.js::withStats` derives those values from legacy arcade fields and stored `rating` when absent.
- `statsVerified === true` occurs on zero records. The generated game attributes therefore cannot support an authoritative privilege or rarity assignment.
- `fc27FaceStats` is present on 372/384 club26 and 611/1,596 continental records. Those are EA headline values (PAC/SHO/PAS/DRI/DEF/PHY), not the game’s six canonical position inputs. They do not supply all of GK/DF/MF/FW attribute sets and must not be substituted directly into `overallForPosition`.
- Club26 has 384 records with an official FC27 rating source. FC27 source checks and face-stat assertions are recorded in per-club tests; those OVR fields remain separate from the game’s canonical primary-position OVR contract.

The [read-only source ledger](ROSTER_TIER_SOURCE_LEDGER_20261101.csv) now covers all 2,676 player records across 223 teams. It keeps the current formula-derived six canonical inputs and OVR labeled `UNVERIFIED_DERIVED_CANDIDATE`, leaves every tier blank, and records identity confidence and available source provenance. Of the 983 records with an explicit FC27 ID, snapshot, headline stats and URL, only 72 also carry a dedicated official-check date. No record has `statsVerified:true`; no FC27 headline attributes were copied into canonical game-stat inputs.

A new pure `uniqueCelebrationEligible(player)` helper is now exported by both stats APIs. It allows only Gold/Star/Superstar from `verifiedRatingTierForPlayer`, so an explicit verified flag plus all six canonical inputs are required. Boundary/source-parity tests and a full-roster census pass; currently nobody is eligible. No unique celebration UI, animation assignment, or roster tier was added.

## Verified-only policy plumbing added 1 November 2026

- Both stats APIs now compute verified tier from the six directly supplied canonical-position inputs, rounded as the runtime OVR formula does. They do not use the generated attributes filled in by `withStats` to turn an unverified row into a verified one.
- `src/modules/abilities.js` exports a verified field-special cap (Gold 2, Star 3, Superstar 5) and role gate (Super Shot: MF/FW; Super Defense: DF). New Super Shot and Super Defense IDs are checked inside the write helpers. The single `superAbility` field keeps field specialties exclusive; KEEP/REMOVE remain compatible with unverified or downgraded legacy entries. A read-only report emits legacy issues only for players with verified tiers.
- Both `withStats` projections now give personalized dribble styles only to verified Gold/Star/Superstar players. Verified Common/Silver use `sideStep`; an unverified player keeps a valid explicit saved style, and an unverified player without one projects `sideStep`. Projection does not write to the player or roster. Studio gates new unique styles and Magic Tricks on verified canonical tiers.
- Both BPW APIs expose `isBPWTierExemptTeam(teamId)`, true for exactly the six historical World Cup IDs and false for `bpw_alltime`. This is only a membership predicate; no rarity counts or tier caps are active.

Focused source/module, helper, Studio and roster-census coverage passes across `tests/rating_tiers.test.cjs`, `tests/sd13_unverified_roster_tier_guard.test.cjs`, `tests/rating_tier_specialization_policy.test.cjs`, `tests/rating_tier_dribble_projection.test.cjs`, `tests/bpw_tier_exemption.test.cjs`, `tests/unique_celebration_eligibility.test.cjs`, and `tests/studio_verified_tier_ui_policy.test.cjs` (19/19 tests in the combined focused run). All 2,676 canonical roster entries still return no verified tier; therefore no current player can receive a new tier-gated specialization, dribble style, trick, or unique celebration from these helpers.

The official [EA SPORTS FC 27 ratings table](https://www.ea.com/games/ea-sports-fc/ratings) publishes item OVR and six headline attributes. The page describes Ultimate Team launch items and states that player-club affiliations can change, so it is a reference for the fields it publishes, not evidence for the game-specific six-stat formula or every custom/legacy player record.

## Safe next steps

1. Keep `ratingTierForPlayer` as a pure display/classification helper; use `verifiedRatingTierForPlayer` for policy, and do not use synthesized inputs to grant abilities, rarity, dribble styles, tricks, or unique celebrations.
2. Review and enrich the source ledger with field-level verification keyed by stable real-person identity and primary position. Resolve duplicate club/national copies only from explicit evidence; keep BPW membership explicit.
3. Establish a verified source or owner-approved mapping for all six canonical stats by position before converting the helper into player tier assignments.
4. Reconcile official real-player OVRs per the source ledger; do not bulk-edit legacy `rating` or generated game attributes from FC27 face stats alone.
5. After field-level audit, assign tiers and validate the Common/Silver/Gold/Star/Superstar limits across distinct identities; only then consider rarity caps. The BPW helper identifies the six exempt World Cup teams but does not count or activate exemptions yet.

No roster data were changed by these policy helpers or tests. The 1–100 output of `ratingTierForOVR` and synthetic verified fixtures are formula/policy coverage only; they are not roster approval or evidence that any current player qualifies. Tier migration, rarity-cap enforcement, GK specialty policy, unique celebration presentation, and exact-head/device acceptance remain open.
