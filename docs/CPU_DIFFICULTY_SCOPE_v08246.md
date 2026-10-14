# CPU difficulty scope and goalkeeper calibration — v0.8.24.6

## Confirmed behavior
`GameEngine.cpuLevel(p)` applies the chosen options `difficulty` only to team 1 when `humans===1` (single-player against the computer). All other players/contexts, including both sides of AI-vs-AI (`humans===0`), use AI tuning level 2 (Normal). The implementation is consistent with the game's policy that difficulty configures the human's opponent; it is **not an engine defect**.

## Previously misleading interpretation corrected
`tests/v08243_full_match_calibration.mjs` (10 short AI-vs-AI matches) and `tests/v08244_match_matrix.mjs` (15 AI-vs-AI matches) grouped results by the *requested* difficulty value while the underlying AI policies were identical in all groups. The small, different goal/save totals were attributable to varying seeded states/team pairings and randomness; they cannot evidence a difficulty progression. For traceability, the original historical reports are retained, with this explicit superseding caution. The regenerated v0.8.24.6 matrix records the **effective** CPU difficulty for each side and flags `calibrationValidForCpuDifficultyComparison:false`.

## Automated verification
`tests/v08246_cpu_difficulty_scope.mjs` executes 15 fixtures: 5 levels x `humans` 0,1,2; asserts both sides in AI-vs-AI remain Normal; asserts single-player computer team uses its chosen profile; and shoots the same deterministic shot with the same random draw to verify five distinct ordered CPU aim-error outputs. This is a mode/policy regression, not proof that real players will win or score at an intended frequency.

## Next valid measurements
Use real single-player `humans=1` CPU matches, controlled input scripts or manual match recordings, both attacking/defending situations, identical starting teams/random seeds, shot-quality and keeper-position histograms, penalty and aerial shot classes, scored/missed/blocked/saved/deflected result categories, repeated per difficulty. Only propose a bounded gameplay patch once the resulting distributions show a reproducible issue. Retest all original Super Shot and goalkeeper fairness constraints.
