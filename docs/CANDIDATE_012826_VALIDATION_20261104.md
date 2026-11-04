# Candidate 0.12.81.26 validation — 4 November 2026

## Change

Spin Bumper's defender now completes a brief, asymmetric arm impact/recovery pose across all eight match headings. The pose follows its existing 0.28-second visual timer after the .42-second pending tell resolves. In the engine's update order the action can already be `idle` when the pending action resolves; the recovery therefore keys off the defender-specific timer rather than the action label. This affects only rendering. Hit detection, stun duration, stamina, cooldown, movement/physics, and the existing four-button control path are unchanged. The procedural painter remains the safe fallback; no new character art was created or approved.

## Validation

- `python -X utf8 scripts/build.py` — passed; bundle contains **4,998,634 JavaScript characters** and **5,120,496 HTML characters**.
- `node --test tests/*.test.cjs` — **1,965/1,965 passed** after rebuilding the test fixture for .26.
- `node --test tests/art102_spin_bumper_pose.test.cjs` — **3/3 passed** for the existing anticipation tell, idle-state impact phase mapping, visual-only recovery, and reduced-flash telegraph.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21 passed**.
- `node --check src/modules/render.js`, `node --check src/modules/characterart.js`, `node --check src/modules/release.js`, `node --check sw.js` — passed.
- `python -X utf8 tests/browser_runner_compat.py tests/art102_spin_bumper_impact_browser_qa.py` — passed: **40 actual-renderer samples** (8 headings × 5 phases), five distinct phases per heading, eight distinct heading views per phase, unchanged physics/state, and zero browser errors. The test deliberately renders the impact timer after the defender is already `idle` to match the engine's deferred resolve order.
- Gallery: [Spin Bumper impact and recovery](evidence/browser/art102_spin_bumper_impact_gallery.png). Inspected as a contact sheet; the asymmetrical arm follow-through and torso lean are visible through recovery in front, profile, quarter, and rear views.

## Release status

Candidate .26 passed exact-head dev regression and protected promotion in [run 41847351215](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41847351215). Hosted Pages verification passed in [run 41848789472](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41848789472), including exact deployed bundle checks. The procedural character pose remains pending owner visual approval; physical-device acceptance remains separate. Candidate .27 is now the local, unpromoted development candidate.
