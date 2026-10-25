# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25

## Mission
Continue development only on existing `dev`, independent of release blockers; promote *only* exact green head using protected workflow. Never create branches, bypass security, or claim unobserved QA. Preserve 223 teams / 2676 players, six formations, four buttons, 10 Career/Cup slots, SD09, offline/saves.

## Latest LAN milestone — 0.10.0.0 candidate, NOT certified
`main=84f8bae589f0675ea1e4cd8525a802ef0a643a92`. Last checked `dev=14ce9ab9971558f6a3cc62b18218da46689faa46` (91 commits ahead, 0 behind). Automatic local `npm run serve:lan` WebSocket room discovery, host consent, WebRTC SDP exchange and existing host-authoritative `lan-live-match.js` GameEngine bridge. GitHub Pages remains static and *cannot* auto-discover rooms; the same companion LAN URL must be opened by both browsers.

New commits: private IP address helper 843d96f3 and server broadcast 40f93dc3; one-click queued Host/Find 0a068ad0; bounded discovery reconnect 487f0c9f; race/cancel guard 6d13289f; localhost host visibility from private LAN guest 12be7bd0; stale host heartbeat 6cb9db77; Windows one-click `start-lan.cmd` 8f28f6d2; UI navigation hint 3d0280c9; Node tests 75ec3924/c8c19711/00d3e303/cec3f476/b065604e; full browser two-tab acceptance script bb4e1129 plus waiter repair d70f799a; browser CI installs ws cc3e2263; version/README/notes/SW/docs aligned to 0.10.0.0. README has complete host/guest LAN procedure.

## Evidence and blockers
Local Node v22 isolated mirrors of address/WS/policy logic: **5/5 pass** (not full exact-head repo). Browser smoke script committed but **not run**: container GitHub DNS lookup fails, local browser navigation is administratively blocked, GitHub Actions PR-filtered query returns [] and commit legacy statuses []; none means green. Full 4 Node + 4 Chromium, Modular QA, physical two-device host/guest, graphics screenshots, protected main promotion and GitHub Pages byte smoke remain **UNVERIFIED**. Do not mark LAN fully certified/production deployed. Workflow `.github/workflows/full-regression-census.yml` auto fast-forwards dev→main only after exact-head green 4+4/preview/preflight, then triggers main Pages smoke.

## Next five actions
1. Inspect exact new dev SHA and all CI run/job failure logs through valid accessible tools; resolve red steps.
2. Run `python3 tests/lan_auto_two_browser_qa.py` in CI: automatic discovery, acceptance, actual WebRTC and synchronised game/graphics.
3. Verify two physical devices same private LAN, firewall, host localhost vs guest IP, dropped connection and retry; test offline regression.
4. Fix any remaining game/graphic issues surfaced by full Node 4/Chromium 4/Modular QA.
5. Confirm exact-head protected fast-forward and main hosted byte comparison; only then close LAN issue #48.

## Latest increment — 2026-10-25
- LAN safe-send serialization exception containment committed `a2bc9cdc`; circular/BigInt regression cases committed `47566947`. CI and physical LAN not yet verified. Main promotion gated on exact-head green 4+4 and Modular QA; no Pages claim.

## 22:00 increment
- Missing/invisible room joins now receive privacy-neutral rejection: `7341338a` helper, `53b66edb` wiring, `3475d101` tests; log `14ce9ab9`. Isolated Node 3/3 and live source wiring 2/2 pass. Full CI, real-device LAN and graphics remain unverified. Old full CI canceled by workflow `cancel-in-progress: true` as newer dev commits arrived; not a green result.

## Ownership
Update central `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` and this checkpoint only. No other agents' memories. Never change player identifiers/save formats for LAN.
