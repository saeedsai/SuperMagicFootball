# SMF sole hourly developer checkpoint — smf-hourly-dev-20261019
**Updated:** 2026-10-25 09:05 CET. Only dev/main; never force push or bypass CI.

## Latest verified context
Read AGENTS.md, docs/VERSIONING_POLICY.md and docs/memory/SHARED.md each run. At start of LAN-059 main=dev f4a71836a109fc85efaaee78836024731e3f43be; 0.9.41.9 About-only candidate, production certification separate. Issue #48 requests automatic LAN Create Game → Find Games → Join → host Accept/Reject, no manual copy/paste. Browser discovery needs secure service/companion; client-only protocol cannot guarantee same LAN.

## LAN-059 incremental implementation
- Source commit ac26aade5f076a536ef687f22489242c040c488a: host join queue now caps pending/replay IDs, rejects repeats after approval/rejection, expires IDs, validates limits and clears state.
- Tests commit 88a9ec2017299684753c29c5e603aaf6ead64821: replay, expiry, queue capacity and configuration cases.
- Focused local Node 4/4 PASS (reconstructed module files); exact GitHub source executed in V8, 8/8 behavioral assertions PASS. Local full clone blocked by github.com DNS resolution. Full 4 Node + 4 Chromium, Modular QA, production/Pages and physical two-client LAN NOT verified.
- Central log updated in docs/DEVELOPMENT_LOG_SINGLE_OWNER.md. Documentation-only commits do not bump version.

## Non-negotiables
Only develop directly on existing dev. Main only through exact-green protected promotion; no new branches. Do not pause hourly feature work for pending release. Keep 223 teams, 2676 players, six formations, exactly four buttons, 10 Career/Cup save slots, SD09, offline/save compatibility. Four-field release/version + README + cache + About notes on every player-facing change. Keep this checkpoint under 4 KiB.

## Next five
1. Diagnose exact-head CI and source access; run full 4 Node + 4 Chromium and Modular QA.
2. Implement secure same-LAN discovery/signaling transport (do not claim browser broadcast).
3. Integrate Find Games and host Accept/Reject UI with four-button gameplay.
4. Real two-client latency/disconnect/rejoin test; graphics/animation QA.
5. Promote only exact green dev to main; verify Pages deployment and hosted bytes.
