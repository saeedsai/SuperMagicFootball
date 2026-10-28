# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 13:00 CET

## Mission
Keep coding one bounded increment each hour on dev. Only dev/main; never force-push, bypass security or pause for pending release.

## Current checkpoint
- 0.11.4.33 LAN-082: temporary broker capacity errors preserve 10-second host retry and room identity; permanent scope errors stop retries. Two focused lobby regressions added; exact-head CI, main and Pages pending. Physical two-device LAN/P2P remains open.
- 0.11.4.32 STUDIO-TRICK-PROGRESS-02 fixes missing rating unlock guidance with focused VM regression; exact-head 4+4, Modular and Pages pending.
- 0.11.4.31 STUDIO-MAGIC-SAVE-STATE-01: no-op Magic Trick save button disabled in Player Studio (KEEP, absent REMOVE, same equipped); genuine changes remain enabled and locked previews stay disabled. Focused VM regression added. First Full #40684644344 and Modular #40684644386 failed three stale source-contract assertions; updated tests to require new disabled state and preserve locked eligibility guard. Fresh exact-head QA pending. Prior .30 exact-head Full #40677013054 and Modular #40677013174 green, dev/main synced at ffa4c143c0a7. New candidate QA/Pages pending.
- 0.11.4.30 STUDIO-MAGIC-NOOP-01: unchanged equipped Trick and absent Trick removal no longer rewrite Career or club saves; genuine edits still persist. New focused VM regression. Initial Full #40676804744 and Modular #40676804765 failed stale KEEP test assertion. Follow-up #40676882873 and #40676883280 exposed second stale assertion plus checkpoint section/identity contract; repaired on dev. New exact-head CI pending.
- Previous 0.11.4.29 STUDIO-TRICK-PROGRESS-01 green full 4+4 and Modular QA; dev/main synchronized at 6ce57cd576facf76f8b9994b875cbb82ae1aef13. Hosted Pages byte verification not established.
- Preserve 223 teams/2676 players, six formations, four buttons, offline saves, Career/Cup ten slots, SD09. Physical two-phone LAN and art QA remain open.

## 2026-10-28 release and graphics checkpoint
- Verified `main...dev` identical at b852ecbbccacd5bebba0f2df64b2d821c41a4e32; no unmerged change to promote. Existing Concept Hero already flips side and quarter profiles locally; avoid double-flip until screenshot QA confirms orientation. No new game-code release or CI run in this checkpoint. LAN/P2P physical acceptance and hosted Pages byte verification remain open. Continue independently useful dev features without waiting for release.

## Next smallest action
1. Verify focused Node and exact-head full 4 Node + 4 Chromium and Modular QA.
2. Repair actual failures on dev; continue independent roadmap increments.
3. Promote only fully green exact dev head through protected pipeline.
4. Verify main SHA, Pages and hosted HTML/JS/CSS bytes.
5. Continue two-client LAN/P2P, counterable Tricks and directional art.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019. No extra branches, cross-agent private memory, force push or security bypass.

## Evidence
PR #73. Failed initial Full #40676804744 and Modular #40676804765; follow-up Full #40676882873 and Modular #40676883280. Latest exact-head CI pending.

## Cleanup
Checkpoint below 4 KiB. Git history preserves prior handovers.
