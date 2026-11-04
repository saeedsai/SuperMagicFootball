# Seeded full-match goalkeeper trial — 1 November 2026

## Method

- Ran `node --test tests/gk_seeded_match_trials.test.cjs` against the editable modular source (`src/modules/engine.js`) after loading the normal JSON asset catalog. The historical bundled `src/engine.js` was not used.
- Simulated 30 complete, bounded matches: six team/formation/weather fixtures at each CPU difficulty 0–4. Each half was 36 seconds at a fixed 30 Hz step. Seeds are `82412000 + difficulty * 7001 + fixtureIndex * 1901`; fixture indices are 0–5.
- Team 0 used a deterministic scripted four-action controller; team 1 ran the actual CPU. The trial measured the CPU away goalkeeper’s AI position calls, path length, maximum displacement, movement frames, dive attempts, contacts, saves and deflections, plus regulation goals conceded.
- Replayed one full fixture with the same seed and asserted equality of the match metrics. The deterministic replay check passed. The integrated run passed 1/1 test (30 seeded matches plus one full replay; approximately 13.9 seconds).

## Observed sample

Counts below are totals across six matches per difficulty. Movement distances are game-world units; moving frames count updates with more than 0.01 units of goalkeeper displacement.

| CPU difficulty | Goals conceded | GK saves | Deflections | Dive attempts | Contacts | Mean GK path | GK path range | Mean max displacement | Mean moving frames |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 20 | 23 | 12 | 28 | 23 | 906.730 | 397.189–1,591.931 | 192.446 | 248.167 |
| 1 | 16 | 17 | 11 | 27 | 17 | 906.829 | 296.358–2,171.079 | 188.498 | 290.333 |
| 2 | 15 | 35 | 23 | 29 | 34 | 1,111.732 | 322.641–2,213.649 | 189.772 | 340.500 |
| 3 | 3 | 20 | 9 | 11 | 18 | 1,568.068 | 461.064–2,748.990 | 202.001 | 399.333 |
| 4 | 1 | 17 | 10 | 6 | 15 | 1,309.916 | 343.656–1,911.813 | 197.180 | 349.667 |

## Limits

This is a deterministic, small scripted sample, not a human-vs-CPU win-rate or statistically representative balance study. Difficulty also changed the scripted controller’s opportunity volume (194, 182, 187, 92 and 85 requested shot frames respectively), so the totals must not be read as isolated save-rate comparisons. Only the CPU-controlled away goalkeeper is measured. Penalty shootout events are separated from the regulation totals. No physical-device, browser, hosted or release acceptance is claimed.

## Reproduce

Run from the game repository root:

```powershell
node --test tests/gk_seeded_match_trials.test.cjs
```

The test initializes assets with a local `fetch` shim, imports the modular engine directly, restores `Math.random` and `fetch` after the trial, and makes no game source changes. On this Windows checkout, base Git `HEAD` was `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`. The integrated tree has uncommitted changes, so these results are local source-level evidence rather than an exact release SHA. At run time, `src/modules/engine.js` had SHA-256 `D984810099AF989E0BC07FD4436BAE60B39B0551CAE051062CD83A5DB26A8347`; the integrated test file had SHA-256 `413ED7C0D4BBAA925BA7F40B17B1E6B73CAE1EAC0B9B450F39B9BD20DEB5F58F`. The engine hash was unchanged across the run.



