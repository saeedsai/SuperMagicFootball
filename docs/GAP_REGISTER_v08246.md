# Open gap register — v0.8.24.6 Alpha

| Priority | Gap | Current state and follow-up |
|---|---|---|
| P0 | Regressions from prior incomplete browser batches | Sequential six-shard approach established; check `TEST_REPORT_v08246.md` for final 38-script certification |
| P0 | Misinterpreted CPU difficulty calibration | **Measurement defect corrected**: old AI-vs-AI difficulty groups all use Normal AI under `humans=0`; new 15-scenario policy and shot targeting regression verifies single-player differences |
| P1 | Real player-vs-CPU goal/save fairness | Still unmeasured with representative attacking inputs and enough statistically useful matched trials; do not retune from old matrix |
| P1 | Mobile and controller devices | Needs physical Android/iPhone/real gamepad; emulation does not certify latency or hardware |
| P2 | Browser compatibility and audio persistence | Firefox/Safari and unrestricted-origin storage reload; synthetic Chromium storage test not enough |
| P2 | Low-end performance | Physical frame-time profiling under CPU/GPU load needed |
| P1 future | BPW Legendary cartoon personality | v0.8.25 after quality gate; historical appearances, celebrations and signature identities |
| Deferred | Star/Superstar Super Defense and Tricks | Complete future backlog in `SUPER_DEFENSE_AND_TRICKS_BACKLOG_v08241.md`; **not yet implemented** |
| Postponed | Worldwide roster / transfer corrections | Explicit user direction to defer; do not resume |
