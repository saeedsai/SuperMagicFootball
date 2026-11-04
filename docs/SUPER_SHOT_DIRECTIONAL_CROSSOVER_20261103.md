# Super Shot directional crossover diagnostic — 3 November 2026

## Scope and result

Ran `node tests/super_shot_directional_crossover_diagnostic.mjs` after rebuilding the current local fixture with `python -X utf8 scripts/build.py`. The crossover completed **192/192** regulation simulations, each at 60 Hz with 60 simulated seconds per half, across Silver Carp, Dice and Bird; Normal/Expert CPUs; baseline/selected-shot treatment; both opening attack directions; and eight deterministic replicates per direction. Opposite directions use separate deterministic RNG domains, so the experiment compares distributions instead of requiring invalid exact same-seed mirror scores.

All matches completed with finite state, unchanged match rosters, and zero persistent writes. The output is [machine-readable here](SUPER_SHOT_DIRECTIONAL_CROSSOVER_20261103.json).

## Descriptive totals

| Shot family | Baseline goals / 32 matches | Selected Super Shot goals / 32 matches | Selected-player launches |
|---|---:|---:|---:|
| Silver Carp | 53 (1.656 / match) | 45 (1.406 / match) | 32 |
| Dice | 51 (1.594 / match) | 67 (2.094 / match) | 34 |
| Bird | 55 (1.719 / match) | 52 (1.625 / match) | 35 |

These are short CPU-only samples; outcome differences are descriptive and do not establish shot value or human balance.

## Direction contrast

The report contains twelve side-specific contrasts (three shots × two CPU levels × two arms), each with eight independent runs per initial attacking direction and unadjusted 95% bootstrap intervals. Two intervals exclude zero: Silver Carp baseline on Expert and Dice treatment on Normal. With twelve exploratory comparisons and only eight runs per direction, those results are inconclusive signals for follow-up, not evidence of a confirmed defect. The earlier exact mirror score check (13/54) remains invalid as a common-random-number test because direction changes the engine's conditional global-RNG draw ordering.

## Limits and next acceptance

- The same Japan roster is used for both teams; this is not broad roster coverage.
- Only three of 32 shots and two CPU levels are sampled. One scripted opening shot ensures treatment use; the rest is CPU-versus-CPU.
- Both halves are compressed to 60 seconds. The sample does not represent full shipping match duration or establish 30/60/120 Hz parity.
- Bootstrap intervals are descriptive, low-powered and unadjusted for multiple comparisons. No gameplay tuning is warranted from this run.
- Human-controlled fun/balance, physical devices, accessibility preferences, online latency, and owner visual review are not covered.

Next: run a larger, predeclared replicate count for the same matrix (or a broader shot-family sample) before drawing side-balance conclusions; then use human-controlled play and device review before any tuning.
