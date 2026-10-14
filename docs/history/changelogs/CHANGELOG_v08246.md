# Supermagic Football — v0.8.24.6 Alpha changelog
14 October 2026

- **QA fix:** finished the inherited 38-script browser baseline sequentially before touching runtime code; corrected prior incomplete certification status.
- **Calibration fix:** identified that five-level AI-vs-AI keeper comparisons were methodologically invalid: `cpuLevel()` deliberately gives both AI teams Normal behavior when `humans=0`. New 15-fixture automated policy/shot test confirms chosen difficulty affects actual solo CPU only. No gameplay physics retuned based on invalid inference.
- Regenerated 15-match AI-vs-AI matrix with `effectiveCpuDifficulty` and explicit `calibrationValidForCpuDifficultyComparison:false` to prevent reuse as an actual difficulty curve.
- Node regression grows from 63 to 64 scripts. Added three master QA acceptance entries (402 → 405), release alignment and test runner metadata sourced from current package/catalog. 
- Versioned PWA cache, save export version, runtime labels, release contracts, browser test assertions and rebuilt portable HTML all now match 0.8.24.6.
- Consolidated active README, status, roadmap, gap register and handover; removed stale per-run outputs and generated artifacts from release payload.
- Preserved four gameplay actions, six formations, 6+1 BPW teams, all Super Attack combinations and offline audio. Super Defense and Tricks remain deferred, roster corrections postponed.
- Final executed browser/Node results: see `docs/TEST_REPORT_v08246.md` and `docs/qa_runs`.
