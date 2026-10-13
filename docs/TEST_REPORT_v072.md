# Supermagic Football v0.7.2 — Validation report

**Date:** 2026-10-13  · **Milestone:** Rebrand + immersive phone fullscreen

## Automated evidence

- `npm test` — core Node simulation, career, 151 continental club tournament entries, AI, team tactics, kits, player stats, fitness/substitution constraints: PASS.
- `python tests/fullscreen_brand_qa.py` — branding, fullscreen entry/exit/fallback, in-match button, Android-landscape/desktop emulation, visual snapshots, PWA manifest metadata: PASS.
- Legacy JSON-save import supported; export product and filename are changed, storage prefix preserved.
- `npm run qa` — Chromium desktop/mobile tactics, kits, 216-team category filters, career scouting, save JSON roundtrip, AI difficulty and player-stat checks PASSED; full combined command timed out while reaching the last fitness test. `python tests/fitness_browser_qa.py` rerun separately PASSED on desktop and mobile.
- `npm run build` — single-file game constructed from current source; compile/run smoke checks performed.

## Remaining acceptance blockers

- Real Android Chrome fullscreen on physical phone including gesture, landscape lock and safe-area; iOS Safari / home-screen PWA on actual iPhone.
- Reinstall/offline PWA and real cross-reload browser-storage verification in HTTPS environment. Local web server was blocked by the browser test environment; Playwright exercised the complete inline HTML instead.
- Human playtesting, CPU game balance, touch latency, Xbox/PS Bluetooth gamepads, thermal/performance over long play sessions.
- Legal trademark search in official EU/SE/global registers before product public commercial release.

These unverified items are not marked complete.
