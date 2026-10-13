# v0.7.3 validation report — 13 October 2026

## Automated gameplay suite — PASS

Run `npm test`: 9 individual Node tests passed: tactical plans/identities, home/away kits, simulation shots+goals+PK, manager career, all 151 continental competition entries, five AI difficulties, 2,592 player stats, fatigue/substitution restrictions, new morale goal/reaction tests.

Morale tests: stable personality outcomes, positive/negative talk reactions in the same team, no repeat talks, persistence over a goal kickoff, speed response to high/low morale, physical scoring changing both sides, losing player crying state, five defined celebration styles, legality of halftime talk phase.

## Browser regression — PASS on Chromium desktop and emulated mobile

- `tactics_browser_qa.py`: desktop/mobile PASS.
- `kits_browser_qa.py`: desktop/mobile PASS.
- `v060_qa.py`: desktop/mobile PASS.
- `manager_v060.py`: desktop/mobile PASS.
- `save_filter_v060.py`: desktop/mobile PASS (new export version and save compatibility).
- `ai_browser_qa.py`: desktop/mobile PASS.
- `stats_browser_qa.py`: desktop/mobile PASS.
- `fitness_browser_qa.py`: desktop/mobile PASS (rerun separately due initial combined timeout).
- `morale_browser_qa.py`: desktop/mobile PASS (pregame talk, halftime talk, duplicate guard, goal/cry renderer).
- `fullscreen_brand_qa.py`: desktop and simulated Android landscape PASS; unsupported fullscreen fallback and old save imports PASS.

## Validation boundaries / honest limitations

These tests are automated smoke and game-logic regressions, **not exhaustive coverage of all 126 historical requests**. An existing feature marked Partial or Missing remains incomplete even if its applicable regression passes. Physical Android/iOS devices and Bluetooth controllers have not been tested. Browser persistence across actual app updates still requires extended integration testing. We have not profiled 60fps across target GPUs and have not achieved original 1993 NES game-mechanics fidelity.

## Hosted web-module validation — BLOCKED (not a pass)

A local HTTP Chromium navigation attempt in `tests/hosted_smoke_v073.py` failed with `net::ERR_BLOCKED_BY_ADMINISTRATOR` due to this runtime's localhost browser policy. The standalone HTML path was verified in Chromium and modular `src/` files were syntax/build checked by Node. Actual HTTPS deployment, PWA service worker caching, reload preservation, and iOS standalone installation are **unverified**. Re-run the hosted smoke and physical-device tests in a normal accessible browser environment before release.
