# Candidate 0.12.81.1 validation — 3 November 2026

## Delivered

- Fixed LAN result payout loss after a transient host wallet write failure. Guest ACK receipt and host settlement are distinct; one valid ACK triggers host persistence, and a failed first write retains the existing 3-second bounded fallback for one retry. `confirmed` is exposed only after a durable host receipt. Duplicate ACKs remain exactly-once.
- Rotated the local candidate to 0.12.81.1 and updated release notes, About metadata, offline cache, root README and version contracts.
- Run21 tested front Run00 full-canvas three-module extraction. Studio reassembly is pixel-exact at 1024 and 64, but module purity fails (head/hair fragments and missing bald scalp), so it is rejected and isolated. Run22's fresh AI bald-head candidate also fails source-face/style fit, neck/collar separation, and fringe checks in official AssetStudio; it is rejected without integration. See [Run21](../../references/analysis/player_master_pilot/animation_three_module_pilot/run00_three_module/iterations/run21_front_run00_source_coordinate_partition_v01/README.md) and [Run22 evidence](../../references/analysis/player_master_pilot/animation_three_module_pilot/run00_three_module/iterations/run22_ai_head_fit_review_v01/README.md).

## Validation actually run on 0.12.81.1

- Build: `python -X utf8 scripts/build.py` passed; 4,974,258 JavaScript characters and 5,068,736 HTML fixture characters.
- Full Node suite: **1,938/1,938** passed.
- LAN/P2P Node suite: **443/443** passed.
- Focused release gate/version contracts: **21/21** passed; release/browser alignment: **136 checks** passed.
- Five local Chromium/WebRTC receipt flows passed: default ACK; host wallet write refusal with one bounded retry; guest wallet write refusal; result-channel closure before ACK; guest reload with a saved but unacknowledged receipt. Each retains one receipt per wallet. The guest-storage-refusal case timed out during parallel browser load, then passed standalone.
- Additional acceptance on the same candidate: VIZ-02 menu route integrity passed 54/54 Chromium route/viewport samples (unique IDs and valid ARIA/label references); token wallet, unlock, committed reward and Cup result contracts passed **29/29**; gameplay tests for dribble styles, trick/shot/defense input access and shot impact/reactions/recovery passed **13/13**.
- `node --check src/modules/lan-live-match.js` and Python compilation of the five ACK browser scripts passed.

The earlier 218/218 four-shard Chromium census belongs to candidate 0.12.81.0 and was not rerun on .81.1. Hosted deployment, exact-head CI, physical-device/screen-reader acceptance, owner visual acceptance, independent-network multiplayer and server-authenticated token settlement remain unverified. Persistent host wallet failure beyond the two attempts remains unconfirmed and requires a recovery/UX decision.

See [host receipt retry evidence](LAN_TOKEN_RESULT_ACK_HOST_WRITE_RETRY_20261103.md), [candidate .81.0 evidence](CANDIDATE_012810_VALIDATION_20261103.md), and [current backlog](MASTER_BACKLOG.md).
