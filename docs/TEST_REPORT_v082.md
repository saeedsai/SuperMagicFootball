# Supermagic Football v0.8.2 — Test and validation report

**Date:** 2026-10-13  
**Environment:** Node.js 22, Linux Chromium/Playwright, desktop 1366 × 800 and simulated touch Android 844 × 390.  
**Release scope:** One bounded addition — teammate-assisted aerial combination, flip kick, transforming apex super, landing collision. Existing systems are regression targets, not new scope.

## Results

| Test | Result | Verified |
|---|---|---|
| `npm test` | **PASS: 12 / 12 Node suites** | Core simulation, tactics, 216 identities and kit sets, AI 5 levels, 6 continental tournaments (151 entry slots), career transfers, stats, fatigue and substitutions, morale, goalkeeper and defensive abilities, v0.8.1 aerial controls, v0.8.2 combos |
| `tests/team_combos.mjs` | **PASS** | Grounded teammate within 115 units, eligibility and stamina requirements, helper animation, cooldown surviving kickoff, timing window and transformed special, mistimed normal flip, non-combo aerial flip, landing stun and ball drop, no-teammate fallback |
| `tests/team_combos_browser_qa.py` | **PASS desktop + simulated Android** | Real keyboard K+Space and L, real simulated two-finger PASS+JUMP and SPECIAL; actual game match state + ability selection, no JS page exceptions; screenshots saved |
| Existing browser regression suites | **PASS: 12 / 12 existing suites** | Team tactics, kits, championships, manager careers, save import/export, AI, stats, fitness/substitutions, morale, rare super abilities, hyperdash/headers/keeper dives, fullscreen/fallback. The total browser count is 13 including new suite. |
| Standalone builder | **PASS** | Source bundling generated `play.html` with inline CSS/JS, no ROM or emulator dependencies |
| Package check | **PASS** | Produced HTML game and source ZIP; verified paths and archive integrity |

Logs: `tests/results/final_node_v082.log`, `tests/results/full_browser_v082.log` and `tests/results/full_browser_v082_summary.txt`; completion marker `tests/results/browser_done.txt` reports `DONE failures=0`.

## What remains unverified

- Physical Android/iOS devices, physical gamepads, installed PWA, cross-browser Safari/Firefox, long human-play difficulty/balance and high-frame-rate stability.
- Exact original Nintendo game animation timing, stacking hitboxes, original combination input sequences, shot-path parity, coordinated AI launch and ball riding.
- Real-world squad accuracy, player face fidelity, full player creator, in-depth career and online multiplayer — not changed in this milestone.

**Acceptance decision:** v0.8.2 bounded mechanics pass automated QA; overall game is **still an alpha**, not a fully faithful historical game or production-quality commercial release.
