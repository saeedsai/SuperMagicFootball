# Candidate 0.12.75.0 validation — Store, tokens, LAN rewards, gameplay, and hazard cues

**Status:** Integrated local validation passes on `dev` at base commit `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted worktree. The worktree contains other concurrent backlog work; this report does not attribute unrelated edits to .75.

## Delivered

- Added a local soft-token wallet and a Store route from Home. Tokens are earned after durable Career, continental Cup/tournament, and World League result saves. Completion pays 20 tokens; a win adds 10 and a draw adds 5. Failed persistence, unfinished matches, duplicate result receipts, and unsupported modes do not pay.
- The Store sells unlocks for existing Super Shots, Magic Tricks, appearance palettes/details, and accessories. New shot/trick selections are checked again in their save handlers, and existing role/verified-tier requirements remain enforced. Saved choices are grandfathered. Teams and players remain explicitly marked **Coming Soon** because there is no safe new selectable-content path yet; current choices are not removed or token-gated.
- General save export/import carries the additive wallet while preserving wallet data when older backups omit it.
- LAN and peer-to-peer matches now include a host-authoritative terminal receipt with a cryptographically random match ID, room/host binding, final score, and penalty winner. Both devices award into their own local wallets; receipt de-duplication makes repeated frozen snapshots safe. If secure ID generation, session identity, or result validation is unavailable, the match continues without an online payout.
- A failed terminal snapshot send no longer awards the host or closes the result flow. The host retries the frozen result and waits for the transport's explicit `snapshotSent: true` receipt before awarding locally; the UI keeps the LAN runtime active until that receipt arrives. This is transport acceptance, not a remote-peer acknowledgement.
- Online receipts are **not server-secure**: the room host is authoritative for this peer session and can be modified. The wallet is local soft currency, not a competitive/server ledger. Real-money token packs and checkout are not implemented.
- Pending Super Shot/defence wind-ups and AI reaction cues clear at corner, goal-kick, free-kick and penalty dead-ball starts while spent cooldowns remain spent.
- Store keyboard paging now moves focus away from a newly disabled pager control, and a purchase moves focus to the next usable offer. The accessibility live region announces purchase results.
- The Home Store card now shows the live token balance beside the earn/spend summary.
- CPU defenders already rising in a jump now preserve that jump through Spin Bumper/Mace Sweep warnings instead of spending stamina on an ineffective second jump.
- Drill Attack and Shock Burst now fail to hit defenders who are already airborne or dashing; the defender keeps their evasion action and the attacker spends no cooldown/resource on the missed move.
- Supernova AI counterplay no longer treats any active slide as covering the whole warning. If the slide ends before impact, the defender retains its difficulty-scaled reaction and can jump afterward; slides that last through impact still suppress a redundant jump.
- Shot-impact contact scaling now fails safely for malformed/non-finite distance, power, and speed input while preserving valid tuning and numeric-string compatibility.
- Banana Peel and Ice Patch arming rings now remain visible and static under reduced motion; normal mode keeps its timed progress sweep. This changes only warning rendering, not hazard timing or gameplay.
- LAN guest snapshot subscriptions now release channel bindings if abort-listener registration fails, so a later clean subscription can succeed instead of inheriting a stranded receiver.
- Fullscreen-help focus restoration now rejects connected but hidden, inert, or disabled openers and returns focus to an available page target; route replacement and visible/hidden/disabled opener paths are covered.

## Validation evidence

- `npm run test:node`: **1,917/1,917** Node tests pass; club fixture passes (32 clubs, 384 slots, 2/3/4/3).
- Release/version contract: **21/21**.
- Data validation: **PASS**, 223 teams, 2,676 player slots, 84 avatar presets, zero errors.
- Focused token wallet, reward, Store ownership, and appearance unlock suites: **32/32**. Forged unowned shot and Trick selections are rejected by the real save handlers.
- LAN snapshot and paired host/guest receipt suites: **48/48**. Host loss/guest win, penalty winner orientation, malformed receipt rejection, repeat-heartbeat de-duplication, missing-crypto no-reward, and retry after a rejected terminal send (without early host payout) are covered.
- Pending-ability dead-ball cleanup focused suite: **18/18**.
- Spin Bumper/Mace Sweep active-jump and cross-rate counterplay focused suite: **23/23** across both sides, five difficulty profiles, and 30/60/120 Hz. Drill Attack/Shock Burst airborne and dash evasion suite: **23/23**, including both sides and 30/60/120 Hz.
- Shot contact safety and impact regression suite: **21/21**, including actual-engine contacts and 30/60/120 Hz.
- Store browser smoke passes in desktop Chromium and simulated touch. This covers all six categories, the live Home wallet balance, an existing shot and Trick purchase, current tier restrictions, appearance/accessory unlocks, and wallet persistence.
- Keyboard-only Store browser check passes on desktop Chromium: Home route and wallet balance, named category/search/pager/purchase controls, paging, purchase announcement, and focus retention.
- Four-shard portable-Chromium census passes **211/211 scripts** with zero failures, timeouts, or errors; shard audit passes ([reports](qa_runs_012750_browser_final_20261103/README.md)). Corrected Player Studio fixtures seed already-purchased appearance items while dedicated Store tests continue to cover purchase and tier gates. Three hosted-origin/process-restart/device cases remain explicitly unexecuted by one script.
- General save export/import roundtrip passes in desktop and simulated-touch Chromium.
- Career Transfer Market browsing has accent-insensitive search, role filtering, stable OVR/price sorts, a polite result count, and clear/retain selection behavior. Browse actions leave Career data and localStorage unchanged; focused market/quote tests pass **14/14**, Career/Cup/tournament suites pass **269/269**, and browse/quote flows pass desktop and simulated-touch Chromium.
- Banana Peel and Ice Patch warning-cue tests pass **22/22**. Actual Canvas Chromium compares full-frame pixels on desktop and simulated touch: reduced-motion frames change **0 pixels** as arming time advances, while normal progress changes 461/661 desktop pixels and 177/145 simulated-touch pixels for Banana Peel/Ice Patch respectively.
- Supernova active-slide expiry counterplay passes **5/5** focused suites, mirrored across both teams, Easy–Expert reaction timings, and 30/60/120 Hz.
- LAN peer-connection/snapshot tests pass **57/57**; the full LAN test glob passes **431/431** for this lifecycle fix.
- Fullscreen-help focus restoration passes **3/3** Node tests and desktop/simulated-touch Chromium checks, including hidden or disabled openers after route replacement.
- TR17 Shoulder Ride real-engine AI counterplay passes 17/17 focused tests across both directions and 30/60/120 Hz; CPU contact/possession counters before ride completion, while the four actions and paid cost/cooldown remain unchanged ([evidence](TR17_SHOULDER_RIDE_AI_COUNTER_20261103.md)).
- `git diff --check` passes; CRLF conversion notices are emitted for existing mixed-line-ending files.

## Not claimed

The first four-shard portable-Chromium census was rejected (199 PASS, 10 FAIL, 2 TIMEOUT). After correcting stale Home-menu expectations and purchase-backed Player Studio test fixtures, the final four-shard census passed 211/211 scripts with zero failures, timeouts, or errors; the shard audit passed. One script leaves hosted-origin, process-restart, and physical-device subchecks unexecuted. Exact-head GitHub CI, hosted bytes, physical-device behavior, two-physical-device networking, owner visual approval, and server-backed competitive receipts remain separate acceptance gates. No menu reference image was available in the request, so the Store follows the existing arena menu style rather than claiming a reference match.

LAN reward limitation: `snapshotSent: true` records local transport acceptance only; it does not prove the guest application received or persisted the snapshot. If the terminal send continues failing, the host withholds its reward and keeps the result flow alive for retry; no remote receipt acknowledgement protocol is implemented.

## Remaining TOKEN-ECONOMY-01 work

Team/player unlocks require a genuine selectable item path that preserves all currently available choices. Real-money token purchases require a future trusted checkout and server ledger. The current peer-to-peer receipt is suitable only for local soft tokens and must not be represented as server-verified.
