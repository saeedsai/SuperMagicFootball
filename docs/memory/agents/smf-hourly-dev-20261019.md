# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Small tested commits on dev; release only QA-certified main. Preserve 223 teams, 2676 players, six formations, exactly Pass/Shoot/Dribble/Jump, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- PROD-MAIN-ONLY-01: owner requires main as the source of every production deployment. Current hosted Pages setup already specifies main; Full Regression Census promotes only exact green dev SHA, then dispatches main verification.
- Existing Render LAN signal service srv-dbf8m6gm7kps7385tjo0 remains configured branch=dev, autoDeploy=yes (commit). Render connector has no service-branch update action; dashboard change to main is still required, not accomplished by editing render.yaml.
- Set render.yaml and render.online.yaml production Blueprint branches to main; switched three hosted live Pages smoke push triggers to main. Added source-level policy test. No new game/version change (0.12.81.67).

- PROD-MAIN-ONLY-01 QA follow-up: exact-head Census 42592059593 and Modular QA 42592059523 failed one older analog Breath contrast test; its sprint start at cap/3 clipped at zero for Stamina 1. Corrected comparison to start at full cap, preserving the walking-recovery case and the >1 Breath sprint contrast. Exact-head CI still pending.

## Next smallest action
Verify focused main-only policy test and full exact-head Census (4 Node + 4 Chromium) / Modular QA. Do not promote unless green. Change existing Render LAN service's connected branch to main in its dashboard; re-read service settings and inspect next legitimate automatic deploy from main. Verify Pages source/main and hosted bytes. Continue Player Studio, Magic Tricks, graphics, goalkeeper and Career.

## Ownership and exclusions
Only this agent checkpoint. Never create branches, force-push, bypass security or push development gameplay directly to main. Physical two-phone #48 remains open; Render drift #86 and GitHub main protection #87 need separate acceptance.

## Evidence
Render list_services identified LAN signaling production on dev, AssetStudio on main; main Pages branch-source policy documented in GITHUB_PAGES_SETUP.md. Full Census exact-head promotion/main-only hosted smoke reviewed. CI for new config pending; live Render branch remains dev.

## Cleanup
Checkpoint under 4 KiB. No release or deployment claimed.
