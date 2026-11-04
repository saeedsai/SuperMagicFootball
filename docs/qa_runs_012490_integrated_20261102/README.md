# 0.12.49.0 integrated local acceptance

Date: 2 November 2026. Scope is the local uncommitted candidate based on the current dev worktree. This report records local implementation evidence only; it does not claim protected CI, a hosted deployment, physical-device acceptance, or owner visual approval.

## Changes in this candidate

- New hosted Internet P2P rooms are unlisted by default for current clients. The lobby shows the existing cryptographically random 128-bit room ID in a dedicated copyable invite-code field. A guest may submit it without a directory listing; the request goes through the existing host-approval gate. Hosts may opt into public listing. LAN discovery is unchanged.
- Older clients that omit the new listing flag retain public directory behavior. The invite code is a bearer invitation, not account authentication, encryption, or same-Wi-Fi certification.
- Cup backup import no longer writes null to the legacy legend_continentalRun mirror when the imported active Cup slot is empty; prior recovery bytes remain available.
- No new concept graphics were created.

## Local results

- npm run test:node — **1,596/1,596 passed**. The build step and FC27 roster parity check also completed. Full output is in [node.log](node.log).
- Independent Node census — **409/409 passed** across four shards: [shard 1](../qa_runs_012490_node_20261102/node_shard_1_of_4.md), [shard 2](../qa_runs_012490_node_20261102/node_shard_2_of_4.md), [shard 3](../qa_runs_012490_node_20261102/node_shard_3_of_4.md), [shard 4](../qa_runs_012490_node_20261102/node_shard_4_of_4.md).
- Desktop/simulated-touch Chromium census — **162/162 passed** across four shards: [shard 1](../qa_runs_012490_browser_20261102/browser_shard_1_of_4.md), [shard 2](../qa_runs_012490_browser_20261102/browser_shard_2_of_4.md), [shard 3](../qa_runs_012490_browser_20261102/browser_shard_3_of_4.md), [shard 4](../qa_runs_012490_browser_20261102/browser_shard_4_of_4.md).
- After the broad census, the dedicated copyable invite-code field was added and verified on a real rendered game page with simulated touch: the visible field contains a valid 128-bit room ID and the copy action writes that exact value. See the [invite-copy browser recheck](invite_copy_browser_recheck.md).
- The parallel Chromium run had two resource-contention results: lan_auto_two_browser_qa.py timed out once and graphics_integration_v082522.py timed out once. Both passed when rerun alone. The LAN rerun confirmed auto-discovery, approval, authoritative input ownership, replicated state, synthetic ICE recovery, and gameplay after signaling-broker shutdown. The graphics diagnostic passed 19/19 desktop/touch checks through the Windows-compatible browser wrapper. The historical shard outputs retain their first-run results; both isolated results are recorded below.
- Data validation — **PASS**, 223 teams, 2,676 players, 84 avatar presets, zero errors.
- Actual local hosted-mode WebSocket broker — **PASS** for private-by-default snapshots/announcements, explicit public listing, direct invite-code request, mandatory host approval, and subsequent offer/answer forwarding (p2p_hosted_discovery_browser_qa.py).
- Save-specific browser verification — Career/Cup backup and persistent-origin restart matrix **8/8**; empty-active Cup backup restore passed on desktop and simulated touch. Focused save assertions **31/31** passed as part of the save agent's acceptance run.
- Focused combined LAN/Cup module suite — **44/44** passed after source-contract expectations were updated for idempotent listing changes.

## Isolated browser rechecks

- python tests/lan_auto_two_browser_qa.py — **PASS**: auto discovery, host approval, away-player input ownership, state replication, synthetic ICE recovery, and a live match surviving local broker shutdown.
- python tests/browser_runner_compat.py tests/graphics_integration_v082522.py — **19/19 PASS** across desktop and simulated-touch contexts using the installed Playwright Chromium. This is existing graphics integration diagnostics, not new art or owner approval.

## Acceptance still outside local automation

The existing Render broker was checked read-only on 2 November 2026: `https://supermagicfootball-lan-signal.onrender.com/healthz` returned HTTP 200 (`ok`), and `/lan-signal` accepted the Pages origin with HTTP 101. Render reports its current live commit as `3da2f0c` (LAN-094), which predates this local candidate. This verifies endpoint availability and the origin gate only; the candidate has not been deployed, and no hosted room-pairing or cross-network gameplay claim is made. See [hosted-service status and operating limits](../LAN_HOSTED_DEPLOYMENT.md).

Exact-head GitHub CI and protected promotion; hosted Pages byte verification; the exact candidate deployment to the active WSS backend and real cross-network service checks; two-physical-device match/reconnect acceptance; assistive-technology and owner visual review; and the remaining art/source-quality gates are not claimed complete.
