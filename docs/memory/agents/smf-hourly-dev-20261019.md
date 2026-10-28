# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 19:04 CET

## Mission
Continue bounded tested increments on existing dev only; no new branches, force push, security bypass or paused hourly work.

## Current checkpoint
- 0.11.4.38 LAN-087: mixed-scope room snapshots now retain only valid same-mode rooms; foreign-only snapshots cannot erase valid directory; malformed same-scope entries still reject the snapshot. Two-mode Node regression added. Exact-head CI and protected promotion pending.
- Render signaling deployment drift was confirmed: latest prior live deployment `b3c8100a` from 27 Oct. Manual redeploy `dep-dbh3hj61egvs739c6g6g` completed LIVE 28 Oct 18:03 UTC at `350f09a0` (0.11.4.37), aligning broker with pre-LAN-087 dev/main. Check subsequent auto-deploy behavior; do not infer latest broker version from GitHub alone.
- Previous 0.11.4.37 LAN-086 binds guest admission replies to room and request ID. Physical two-device discovery/consent/sprint/Jump/reconnect/mobile acceptance not certified. Concept Hero direction flip already exists; screenshot QA needed.
- Preserve 223 teams/2676 players, six formations, four action buttons, offline saves, Career/Cup ten slots and SD09.

## Next smallest action
1. Run focused LAN-087 Node and exact-head Full 4 Node + 4 Chromium, Modular QA.
2. Repair real CI failures on dev and promote only exact green head via protected PR.
3. Verify main SHA, Pages hosted HTML/JS/CSS bytes, and new broker deployment.
4. Complete physical two-device LAN/P2P consent, hold-sprint, Jump edge, reconnect/mobile QA.
5. Mark LAN done only on acceptance; then prioritize Player Studio, counterable Tricks, eight-view art, gameplay and Career.

## Ownership
Sole developer `smf-hourly-dev-20261019`; no other agent memory or security bypass. Central log and Git history retain evidence.
