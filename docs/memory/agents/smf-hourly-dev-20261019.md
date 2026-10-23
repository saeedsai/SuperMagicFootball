# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23 23:02 Europe/Stockholm

## Mission
Sole developer on existing dev, never stop for pending release. No new branches, force push, bypass or weakening CI. One bounded tested increment per run; only green exact-head protected main promotion.

## Current checkpoint
- Starting dev `c1aed416811e78677eef94e38807e6a1e43c43be`, main `fb5ed03196e6a27ad2d2a075d4e5055a6360dbc1`, dev ahead 14, behind 0.
- Full Census 40023142814 browser preview failed with console `SyntaxError: Invalid or unexpected token`, no HTTP errors. Root: literal `\\n` in `src/modules/release.js` after `notes:Object.freeze([`. Corrected and confirmed V8 parse. Version advanced 0.9.29.1 → 0.9.29.2 in About/package/README/cache/docs.
- New automated CI regression test `every shipped JavaScript module parses before browser startup` uses Node `--check` for src/main.js, src/assets.js, sw.js, all src/modules/*.js. This is a new QA feature; it is not gameplay/visual certification.
- Last feature/test commit `78e792985771377e627028faabcc67c49d3c31bc`; Full Census 40023966569 and Modular QA 40023966819 pending. Do not claim green or deployed.
- Preserve 223 teams/2676 players, 6 formations, 4 buttons, 10 Career/Cup slots, SD09, offline/save compatibility.

- LAN-001 groundwork: src/modules/lan_protocol.js and tests/lan_protocol.test.cjs committed b1285a3b and bf5047b7. V8 parse/roundtrip/replay/invalid input checks passed. No network transport or two-client play yet; no user-visible version change.

## Next smallest action
1. Inspect exact latest dev CI; fix new Node syntax gate failures if any.
2. Fix any remaining browser/preview or 4 Chromium shard failure.
3. Complete 4 Node + 4 Chromium + Modular QA for exact head.
4. Permit protected main promotion only when all green, verify Pages byte smoke.
5. Continue LAN host-authority/two-browser transport or counterable Trick/graphics increment on dev even if release remains pending.

## Safety
Read AGENTS.md, VERSIONING_POLICY, SHARED and this checkpoint; latest SHA before writes. Never touch other agent memories or add branches. No unsupported QA/deployment claims.
