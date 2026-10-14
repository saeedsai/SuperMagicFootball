# Gap register — v0.8.24.9 Alpha

| Priority | Gap / defect | Status / evidence / next step |
|---|---|---|
| Fixed | A zero-human AI-vs-AI session incorrectly marked home player #3 as human-controlled | Corrected `GameEngine.inControl`, controlled-player assignment, automatic switching loop, penalty ownership; `v08249_zero_human_control.mjs` passes for humans 0,1,2 |
| Fixed | Versioned browser tests stale after release bump | Aligned to v0.8.24.9; 45 assertions inspected; browser suites rerun |
| Verified | No regressions in protected gameplay and menus | 66/66 `npm test` plus master contract 1/1; 40/40 Chromium scripts in eight completed groups |
| High | Representative player-versus-CPU scoring and skill curves not proven | 120 seeded live-keeper scripted shots (24 per difficulty) record goals **2,0,0,0,0** and saves **21,16,20,19,8**; interceptions, trajectories, goalkeeper saving and non-goals overlap; not evidence to nerf or buff GK |
| High | Full human-like replay gameplay with passing, possession, meaningful shot selection, rebound follow-up | Next milestone v0.8.24.10; completed match distributions and confidence intervals required |
| High | Real Android/iPhone gamepad and physical keyboard/touch hardware | Browser emulation only |
| Medium | Safari/Firefox/browser-origin persistence/Bluetooth audio | Unverified outside current headless Chromium environment |
| Medium | Low-end mobile performance and frame pacing | Requires profiling on representative real devices |
| Planned | BPW historical cartoon identity, expressions, signature animation | v0.8.25; all seven existing teams preserved |
| Deferred | Star/Superstar Super Defense and unusual Tricks | User backlog preserved; no fifth action button; cooldown, fatigue, fair counterplay required |
| Much later | Routine worldwide roster corrections | User explicitly postponed |

**Methodology:** the new shot study uses full `GameEngine.update(1/60)` with the CPU defenders and goalkeeper actively moving, while a scripted human shoots from a fixed setup. It is more representative than a frozen-goalkeeper/open-lane test, but does *not* estimate human match win rates, difficulty quality, or goalkeeper save percentage in real competitive play. Old AI-vs-AI reports used the pre-fix input ownership behavior and are historical, not valid post-fix balance baselines.
