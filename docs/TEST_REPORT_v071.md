# Test report — v0.7.1 Alpha

**Date:** 2026-10-13. **Platform tested:** Node.js 22 + headless Chromium desktop and simulated mobile 844×390. **Baseline:** v0.7.0 Alpha.

## Results

1. `npm test` **PASS** — prior identity/tactics, home/away uniforms, speed/agility, simulation, career, all six continental cup simulations (151 entries), all 5 AI difficulty profiles and 216×12 stat assertions. New `fitness_substitutions.mjs` **PASS** for action costs, fatigue/halftime/kickoff, 3-sub limits, rejected substitutions, no re-entry, CPU replacement and career match condition.
2. `npm run qa` **PASS** — desktop and simulated mobile tactical management, teams and menus, original browser QA, and new fatigue/substitution screen: UI shows FIT + remaining substitution count, uses a bench substitute, preserves pause and no page errors.
3. `npm run build` **PASS** — modular source compiled into a self-contained `play.html`, requiring no ROM/emulator. JavaScript syntax and browser initialization checked.
4. Captured screen evidence: `tests/fitness_substitutions_desktop.png` and `tests/fitness_substitutions_mobile.png`.

## Limitations and unfinished verification

- Browser storage was mocked in standard UI regressions. A separately attempted real local HTTP host test could not connect because this execution environment blocks the loopback server; **cross-reload localStorage persistence is not newly verified**. The older save UI regression covers a mocked roundtrip only.
- No tests on real Android/iOS hardware, USB/Bluetooth gamepads, WebKit/Safari or Firefox; no formal performance/60 FPS checks.
- The more complex career roster lifecycle still needs in-game injury/starting-lineup restrictions; injuries currently affect metadata/condition, not live match availability at kickoff.
- Professional balance, authentic Famicom timing, and physical controller UX need human play sessions.

## Known risks

Players may tire too fast or recover too slowly in longer matches; the action-cost formula requires real-play tuning. Three substitutions is this game's arcade rule, not an assertion of current IFAB limits. Match fitness across completed fixtures is implemented for Manager Career, not World League or other exhibition modes.
