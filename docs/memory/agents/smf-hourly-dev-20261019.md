# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-28 09:05 CET

## Mission
Keep coding one bounded increment on existing dev every hour, regardless of pending CI or release. Only dev/main; no force push, bypass, or unauthorized branches.

## Current checkpoint
- STUDIO-TRICK-PREVIEW-02 0.11.4.26: All eight Magic Tricks visible for outfield read-only previews; locked selections disable SAVE, with existing save-handler validation retained. New Node VM regression. Await exact-head Full/Modular and Pages.
- STUDIO-TRICK-HELP-01 0.11.4.25: Magic Trick preview action guidance and Node regression on dev; Full/Modular #40649528225/#40649528401 passed; main synced to a7c671d80816d938cbd535b6023eb3f2e6cb26cc; Pages bytes not verified.
- Baseline dev/main `60fff3cf7b980364923fcd3976a3faaa161cf7c4` (0.11.4.23), PR #66 merged. Main Full #40645171130 (4 Node+4 Chromium, preview, hosted smoke) and Pages #40645170675 green.
- STUDIO-STAR-01 candidate 0.11.4.24: Magic Trick new equipment gated at Star/Superstar 91+ by rating or positional OVR; Gold 90 may keep/remove legacy Trick, not replace. Super Shot/Defence and four controls unaffected. Regression and release metadata included; first push CI failed on stale Studio assertion and 6 KiB shared-memory bound. Both repaired; new exact-head CI/Pages pending.
- Preserve 223 teams/2676 players, six formations, offline saves, ten Career/Cup slots and SD09. Physical two-phone LAN/P2P and human graphics QA remain pending.

## Next smallest action
1. Check new locked-preview regression and 4 Node + 4 Chromium + Modular exact-head QA.
2. Fix CI failures on dev, promote only fully green exact dev via protected PR.
3. Verify main SHA, Pages deploy and hosted HTML/JS/CSS bytes.
4. Test real two-phone LAN/P2P and Concept/Crown directional art.
5. Continue next Player Studio/Tricks/graphics roadmap increment on dev.

## Ownership and exclusions
Sole developer smf-hourly-dev-20261019. Never read/write other agents' memory; no other branches, force push or security bypass.

## Evidence
Prior release main #40645171130 and Pages #40645170675 passed. New candidate is not yet certified; GitHub CI/Pages are authoritative.

## Cleanup
Only dev/main. Keep checkpoint under 4 KiB.
