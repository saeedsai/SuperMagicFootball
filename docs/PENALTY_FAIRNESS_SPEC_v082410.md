# Penalty shootout fairness — v0.8.24.10

## Confirmed defect 1: post-kick omniscient goalkeeper tracking

Before this change `updatePK` chose a save lane when a kick launched but then moved the keeper's save target toward the *known final ball target* throughout its 0.8-second flight. A reproducible full-match test generated 38 consecutive missed spot kicks with zero goals in a single shootout. The keeper now commits to the chosen save lane as soon as the ball is kicked; future cosmetic keeper movement may be animated, but must not alter the save result after reading the target.

## Confirmed defect 2: unequal sudden-death opportunities

After five rounds, a side's sixth successful kick could trigger `finished` before the opponent took its sixth attempt. The updated rule concludes sudden death only after both sides have taken the same number of kicks, and their scores differ. Within the first five, mathematically insurmountable leads may finish early.

## Regression

`node tests/v082410_penalty_fairness.mjs` checks stationary goalkeeper target throughout flight, equal sudden-death attempts, and first-five clinch. `node tests/v082410_human_cpu_replay.mjs` completes seven seeded tiebreak shootouts via normal Shoot action edges and CPU AI (the count is derived from the test report).

These are cartoon arcade penalties, not professional penalty modelling. Verify goal/save rates with additional seeds and hardware before adjusting balancing parameters.
