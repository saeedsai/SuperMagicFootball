# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · **Updated:** 2026-10-23 12:57 Europe/Stockholm

## Mission
Never pause for pending CI/release. Work only on existing dev; promote exact green head through protected pipeline. No new branches, force-push or security bypass.

## Current checkpoint
- Start dev `d48c987d6ec94e9ed0b09e03a301d4fdb60d7dc1`; main `385022294d86fdaf5c25ad33222b6bba978c412b`.
- New candidate 0.9.20.0: separate Crown Royals (Art WIP) team, first reference-derived Alex #1 3-view sprite and experimental run/action transforms. Previous Concept Royals FC and canonical 223 teams/2676 players untouched.
- Asset is transparent, cropped from owner-supplied artwork, 132x90 palette PNG. Front/back/side genuine; quarter views use nearest art. Other 11 players are placeholders. No claims of finished bespoke animations or QA acceptance.
- Added specialized Chromium screenshot QA and focused Node tests. Renderer-only Chromium QA 39944291648 PASS (3 genuine projections, action differences). Mapped live kick/super/slide to provisional poses. Exact-head 4+4, match QA, main and Pages pending.

## Next smallest action
1. Inspect new Crown Royals Chromium screenshots and CI; fix concrete defects.
2. Refine Alex reference fidelity and side hair mismatch; author distinct quarter views.
3. Add next teammate as an actual reference-derived sprite, not a shared generic overlay.
4. Continue counterable four-button Tricks and two-client LAN independently of release queue.
5. Promote exact fully green dev through protected pipeline, verify main SHA and hosted bytes.

## Ownership and exclusions
Sole maintainer smf-hourly-dev-20261019; dev coding, main protected promotion only. Preserve four controls, six formations, ten Career/Cup slots, offline saves and SD09.

## Evidence
First CI 39943679151 failed on stale regex tests and checkpoint headings, not on renderer itself. Specialized Crown QA 39943679547 is independent.

## Cleanup
Retain original Concept Royals, canonical data and saves. Do not claim full QA approval until real Chromium and exact-head regression are green.
