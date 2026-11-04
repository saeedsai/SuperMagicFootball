# Super Shot mirror divergence: kickoff fixture setup — 3 November 2026

## Finding

The reported first-tick delta is a diagnostic setup artifact, not a goalkeeper runtime side bias. The source player named `jp0` in the original trace is lineup slot 3 (`MF`), not the keeper. `GameEngine.init()` moves team 0's kickoff taker 19.216 world units from the slot's formation `homeX`. The mismatch replay moved the chosen shooter directly to a shot position and called `take()`, but did not restore the old kickoff holder. When team 0 was the shooter, that player was moved to the shot; when team 1 was the shooter, the team 0 kickoff holder remained at midfield. The normalized starting player states therefore already differed before the first simulation update. Its first-update displacement appeared as the reported approximately 19.215–19.216-unit delta.

A directly paired, fully mirrored Silver Carp replay with otherwise identical roster, formation, weather, CPU level, seed, shot, and shot position shows the defending goalkeeper's initial position and first-update target/movement reflected exactly. No production source change is justified by the trace.

## Regression

`tests/super_shot_mirrored_one_tick.test.cjs` restores all non-shooter slots to their assigned formation positions before setting up possession, then compares normalized full state before and after one engine update. It exercises ordinary and Silver Carp Super Shot arms at three deterministic seeds (six direction pairs total).

Run:

```powershell
node tests/super_shot_mirrored_one_tick.test.cjs
```

Result: **PASS — 6 paired scenarios**. Normalized initial state, first-tick player and ball state, and finite defending keeper target agree for both directions.

## Limits

This disproves the claimed goalkeeper first-tick side bias for the corrected fixture. It does not establish that all 13 full-match score pairs become symmetric after correcting setup, nor does it establish Super Shot balance, human fairness, or device acceptance. Those outcomes must be rerun from the corrected initial setup before interpreting the earlier score mismatches.
