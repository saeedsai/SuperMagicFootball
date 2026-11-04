# Super Shot whole-match diagnostic — 3 November 2026

## Scope

The corrected deterministic real-engine diagnostic ran **108 accelerated regulation matches**: Silver Carp, Dice, and Bird × Easy/Normal/Expert CPU difficulty × both attack directions × ordinary baseline/selected Super Shot × three fixed seeds. Each half is 60 simulated seconds at 60 Hz. A scripted opening shot exercises the requested control/treatment; CPU-versus-CPU play completes the remaining regulation. In-match penalties resolve through the engine, and a tied full-time match stops before the separate post-match shootout.

Before each opening shot, every lineup member is restored to the assigned formation home position. This clears the kickoff taker's 19.216-unit `GameEngine.init()` offset so the opposite attack-direction trials begin as true reflected position setups. The paired one-tick keeper regression also passes ordinary and Silver Carp shots at three seeds; see [fixture setup evidence](SUPER_SHOT_MIRRORED_FIXTURE_SETUP_20261103.md).

Run: `node tests/super_shot_whole_match_balance_diagnostic.mjs` — **PASS, 108/108 matches**, all regulation complete, finite player/ball state, unchanged match rosters, and zero persistent writes.

## Observed sample

| Shot | Arm | Matches | Regulation goals | Goals/match | Selected-shot launches | Keeper saves | Player contacts |
|---|---|---:|---:|---:|---:|---:|---:|
| Silver Carp | Baseline | 18 | 29 | 1.6111 | 0 | 38 | 16 |
| Silver Carp | Super Shot | 18 | 25 | 1.3889 | 20 | 43 | 20 |
| Dice | Baseline | 18 | 20 | 1.1111 | 0 | 51 | 28 |
| Dice | Super Shot | 18 | 32 | 1.7778 | 19 | 43 | 22 |
| Bird | Baseline | 18 | 23 | 1.2778 | 0 | 55 | 16 |
| Bird | Super Shot | 18 | 24 | 1.3333 | 19 | 33 | 13 |

The sample is small and varies by shot. It does not establish balance or player preference.

## Mirrored score outcomes

The paired score check compares each team-0-attack result with the reflected team-1-attack result under the same difficulty, shot, arm and seed. **13/54 pairs match exactly; 41/54 differ.** Matches by shot and arm:

| Shot | Baseline matched pairs | Super Shot matched pairs |
|---|---:|---:|
| Silver Carp | 2/9 | 3/9 |
| Dice | 3/9 | 0/9 |
| Bird | 4/9 | 1/9 |

The first-tick goalkeeper difference from the prior trace was caused by the unmirrored kickoff-taker position in that harness. Correcting formation setup removes that initial difference. A follow-up engine-order audit found why same-seed mirrors are not common-random-number pairs: `updatePlayers()` advances team 0 before team 1, while conditional AI, shot, tackle, goalkeeper-save, and VFX paths consume the global RNG. Mirroring which team attacks changes the order and number of draws, so **41/54 mismatched scores do not establish a gameplay-side defect**. The cause is sufficiently explained for this diagnostic; aggregate directional fairness is still not measured. Full per-seed scores and mirrored metrics are retained in the [machine-readable results](SUPER_SHOT_WHOLE_MATCH_BALANCE_20261103.json).

## Limits and next checks

- Both teams use isolated copies of the same Japan roster. Only three of the 32 shots and three CPU tiers are sampled.
- The same seeded global RNG is consumed in engine team-update order. Swapping which team attacks does not remap random draws by normalized role; exact mirrored score equality is therefore a diagnostic signal, not proof of a defect.
- Runs use 60 Hz and compress each half to 60 simulated seconds, half the shipping default. A companion short-window test covers 30/60/120 Hz but is not whole-match frame-rate evidence.
- This is CPU-versus-CPU engine simulation, not human-controlled balance, physical-device play, accessibility review, or owner fun/visual approval.
- No player stats, rosters, gameplay tuning, save data, or persistent state were changed.
- Next: keep the passing one-tick reflection regression. For a meaningful whole-match comparison, run a randomized crossover of three shot families at Normal/Expert, baseline/trial, both directions, and 5–8 independent seeds per cell; compare aggregate goals, saves, contacts, and possession with uncertainty intervals instead of requiring exact same-seed score equality. Investigate product-level directional behavior only if an aggregate effect persists, then use human-controlled and device review before tuning.
