# SuperMagic Football development status — multi-agent integration

As of **15 October 2026**, `dev` remains the authoritative modular application (`index.html` + `src/` + `data/`). Graphics character-art v2, 32 Club26 reconciled teams and the eight-view comparison UI are integrated through the existing commit ancestry; no cherry-pick or history rewrite is required. The inspected starting head for this focused iteration was `a42ce51cc1cee1c276a90b260a3e05e6285526e1`.

**New integration tooling:** `scripts/parallel_data_merge.py` checks separate agents' team, player and graphics edits against a shared ancestor; merges non-overlapping field edits; refuses conflicting edits, ID/order drift and missing team rosters; and writes only to an explicitly separate empty output folder. The 11 new Python unit tests exercise those contracts, including the CLI and conflict report. This does **not** change the live game or player data.

**QA:** Refer to `docs/PARALLEL_DEVELOPMENT_QA_20261015.md` and the exact integration commit's GitHub Actions run for current pass/fail. Earlier 129/129 script regression and 32 active Node checks passed on `8f4817fe`, but are historical; do not misattribute them to newer agent commits. All new changes must pass the complete regression census and current Pages workflow.

**Protected:** 223 teams / 2,676 players (12 each), stable team and player IDs, seven BPW squads, 2GK/3DF/4MF/3FW, four action buttons, five main menu groups, six formations, existing save keys and graphics option indices.

**Known gaps:** visual likeness remains subjective, some FC27 comparisons/editorial ratings lack independent source verification, additional gameplay constants remain in JS, and further editor conflict review is still needed. Full hosted-play/save-restart checks and physical-device/PWA/FPS work are **far future**, not milestone blockers.