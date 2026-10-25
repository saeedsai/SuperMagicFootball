# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`  
**Updated:** 2026-10-26 00:20 CET

## Mission
Hourly development on existing dev despite pending CI and deployment; preserve exact-head release discipline.

## Mission
Keep hourly development enabled. Develop one bounded roadmap increment on existing `dev` even if previous CI, main promotion, Render deploy or phone QA is pending. Never create another branch or force-push, bypass safety or protected CI. Only `dev` and `main` allowed. Preserve 223 teams/2676 players, six formations, exactly four controls, SD09, ten Career/Cup save slots, offline/save compatibility. Release version is four fields, visible only in Settings → About. Synchronize `package.json`, `src/modules/release.js`, README banner/heading/notes, `sw.js` cache and version policy for player-facing changes.

## Current checkpoint
- `dev` candidate `0.10.3.1`; `main` observed `fc69ba332e163d0023bbdd82dc2cdf5b684c2cdb` (older 0.10.2.0). Branches diverged by one main-only merge; protected pipeline must reconcile after exact-head green CI. Do not push directly to main.
- Hosted Render broker service `srv-dbf8m6gm7kps7385tjo0` at `https://supermagicfootball-lan-signal.onrender.com` was LIVE on older commit `c871ee697d8191118a9e893d796b0a4b09038afc`. Auto-deploy configured but newer dev head was not confirmed live. GitHub Pages uses `wss://supermagicfootball-lan-signal.onrender.com/lan-signal` for Host/Find. Physical two-phone acceptance remains open.
- 2026-10-26 increment: `a5654077` and `71d13261` protect hosted discovery from spoofed XFF prefix, then `08daa11d` repairs proxy-hop handling by selecting last valid public client candidate. A prior Modular QA #40243391096 had 813/814 pass, failing `lan_public_network.test.cjs` because private proxy hop was selected. New-head CI was queued; inspect fresh runs and logs. Local reconstructed 3-case Node smoke passed, not full repo QA.
- `0.10.3.1` metadata synced across package, release, README, SW and policy; release remains **candidate**, not production certification. `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` records root cause and deployment gap.

## Next smallest action
1. Fetch fresh exact `dev`/`main` heads and Modular QA/Full Census run statuses; repair any failing Node/Chromium test.
2. Verify actual Render deployment matches exact dev head; diagnose why auto-deploy did not advance if still stale.
3. Run full four Node + four Chromium shards and Modular QA; inspect two-browser LAN acceptance and input/graphics smoke.
4. Validate two physical phones on same Wi-Fi (host consent, kickoff, away controls, finish, disconnect/rejoin); never claim certification without devices.
5. Permit protected green exact-head dev→main reconciliation; verify Pages deploy and hosted HTML/JS/CSS byte hashes.

## Ownership and exclusions
Read `AGENTS.md`, `docs/VERSIONING_POLICY.md`, shared memory and only this agent checkpoint. Do not edit another agent's checkpoint. Keep this file under 4096 bytes.

## Evidence
- Modular QA #40243568741 failed solely on this checkpoint's missing identity/section contract; correct headers restored here. Next exact-head CI must confirm.

## Cleanup
- Keep only dev/main branches, checkpoint under 4096 bytes, no force pushes.

## Evidence
- Exact-head CI and provider deployment logs are required release evidence; queued checks do not prove success.

## Cleanup
- Maintain only dev/main branches and bounded checkpoint; preserve Git evidence.
