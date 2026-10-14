# Position Overall Rating (OVR) — v0.8.19.5

**Status:** Implemented as a displayed metric; detailed actual-match/player-role suitability and 2026 stats calibration remain separate work.

## Calculation

The player's **calculated OVR for a position** is the rounded arithmetic mean of **six** appropriate attributes, each already normalized onto the game's **1–100** stat scale.

`positionOVR(player, role) = round((stat1 + stat2 + stat3 + stat4 + stat5 + stat6) / 6)`

No weights, secret boosts, transfer-market adjustments, club-level rating, current fitness multiplier, or special ability bonus are added to this number. It is comparable between players evaluated at the *same position*, but not intended to copy official EA/FC ratings.

| Position | Exactly six input attributes | Design reason |
|---|---|---|
| **GK — Goalkeeper** | `gkSkill`, `gkDiving`, `agility`, `strength`, `passing`, `stamina` | Saves/reaction, reach, movement, resistance, safe distribution, match durability |
| **DF — Defender** | `defence`, `strength`, `aggression`, `speedRating`, `heading`, `stamina` | Marking, physical contests, tackling initiative, recovery runs, aerial defending, endurance |
| **MF — Midfielder** | `passing`, `crossing`, `dribbling`, `agility`, `stamina`, `speedRating` | Distribution, delivery, ball control, turning, work rate, coverage |
| **FW — Forward** | `shootAccuracy`, `shootPower`, `dribbling`, `speedRating`, `agility`, `heading` | Finishing, striking force, beating markers, forward runs, quick turns, aerial attack |

For example, a forward with Shot Accuracy 90, Shot Power 84, Dribbling 80, Speed 86, Agility 82, Heading 70 receives **OVR 82**: `(90+84+80+86+82+70)/6 = 82`.

For a player in a *formation slot*, use that slot's positional formula. Thus a natural FW used as a MF shows his **MF OVR on the pitch**; in the roster and Career his badge shows the **FW OVR for his natural position**. This comparison informs lineup choices; it is not a penalty applied to the match engine.

## Source data and precision

- Implementation: `src/stats.js`, exported `POSITION_OVR_STATS` and `overallForPosition(player, position)`.
- Each attribute is provided by the existing `withStats` logic; explicitly edited attributes have priority, while older arcade-only rosters receive deterministic inferred defaults.
- For a missing/invalid position, the display calculation defaults to MF. At least one of the four canonical roles should be assigned in regular roster data.
- Computed OVR is derived at display time; it is **not persisted** or written over existing `player.rating`. Changes to explicit stats appear next time the relevant screen is rendered; formation changes and lineup selection recompute in place.
- The older `player.rating` remains for legacy player progression, market prices, and special-ability tiers until a distinct balancing/migration feature is approved. The new OVR must not silently modify those systems.
- The displayed OVR is not a verified FIFA/FC player overall, and does not establish historical data correctness. Player-by-player 2026 audit remains open.

## UI placement

- Team Command Center: each of twelve roster cards (`.ovrBadge`) shows natural-position OVR next to the face and position.
- Lineup: six selected positions (`.positionOvr`) show role-specific OVR, updating when formation or player is changed.
- Formation preview: six player faces and names with badges (`.formationOvr`) containing assigned role plus that role's OVR.
- Career: 12-player squad, scouted prospects and transfer-market results use calculated natural-role OVR, not legacy `rating`.

## Acceptance and QA

- Four role formulas produce the correct rounded, equal six-stat average; irrelevant attributes cannot influence a role's score; results bounded 1–100.
- No mutation of original rating/stat values and no gameplay/formation size change.
- Roster/lineup/formation/Career/transfer OVR shown in desktop and simulated-Android browser UI.
- Formation and player dropdown changes refresh assigned role/score and preserve all existing button/cross rules.
- Actual Android/iOS and controller screen accessibility needs hardware validation.

**Non-goals:** Does not add new stats, extra gameplay buttons, RPG modifiers, FIFA likeness certifications, or a fake role-suitability penalty.
