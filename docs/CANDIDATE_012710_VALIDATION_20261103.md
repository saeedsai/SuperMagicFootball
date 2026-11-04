# Candidate 0.12.71 validation — 3 November 2026

## Gameplay changes

- AI field runners can counter a reachable hostile Magic Wall with the existing grounded slide, which clears the wall and uses the normal fatigue/Breath costs. The AI keeps its usual tackle decision when an immediate player threat takes priority.
- Counter eligibility excludes goalkeepers, stunned or airborne players, exhausted runners, ball carriers, and walls outside approach range.
- Runtime wall deployment now applies the existing role/tier rules consistently: only defenders can deploy; Magic Wall starts at tier 1, Fire at 2, Ice at 3 and Demon at 4. This closes a gap between Player Studio gating and match-engine acceptance.

## Focused validation

- Modular engine and wall tests: **11/11 passed**.
- Actual modular browser test: all four wall families at **30, 60 and 120 Hz (12/12)**.
- Full local Node suite: **1,857/1,857 passed**, plus the club roster fixture (32 clubs / 384 slots).
- Data validation: **223 teams, 2,676 players and 84 avatar presets**; release/version contracts: **21/21 passed**.
- Four penalty lifecycle VM tests initially failed because their source extraction included the newly appended engine method; the tests now delimit the penalty methods directly and pass **22/22**. The full Node rerun then passed.
- Fresh four-shard portable Chromium census: **203/203 scripts passed** (51 + 51 + 51 + 50), with zero failures, timeouts or errors. Reports: [`browser shard 1`](qa_runs_012710_browser_20261103/browser_shard_1_of_4.md), [`shard 2`](qa_runs_012710_browser_20261103/browser_shard_2_of_4.md), [`shard 3`](qa_runs_012710_browser_20261103/browser_shard_3_of_4.md), [`shard 4`](qa_runs_012710_browser_20261103/browser_shard_4_of_4.md).

The browser result counts script executions. It does not certify every historical QA catalog case or substitute for a visual owner review, physical-device testing, exact-commit CI, hosted verification or real-network/two-device acceptance.

## Acceptance limits

Human balance/visual review, physical controllers/devices, hosted verification and online physical-network acceptance remain open. No deployment is claimed.
