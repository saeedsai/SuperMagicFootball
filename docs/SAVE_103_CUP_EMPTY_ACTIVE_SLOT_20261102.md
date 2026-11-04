# SAVE-103 Cup active-slot restore edge case

## Acceptance

When a valid ten-slot Cup vault exists, its selected active slot is authoritative. If that slot is empty or references unavailable teams, startup must expose no active campaign instead of falling back to a stale `legend_continentalRun` mirror. Keep the legacy mirror bytes intact for export/recovery. When no vault exists, a valid legacy campaign must still migrate to slot 1.

## Change and coverage

The Cup startup adapter now assigns the active campaign from the vault even when the active slot is empty; it uses `null` for empty or unavailable data. The focused regression exercises the actual `CUP_SLOTS` API and the startup adapter extracted from `src/modules/ui.js`. It covers empty-active/no-resurrection with mirror preservation, occupied slot precedence, legacy-only migration, and invalid team references. A same-origin Chromium browser test repeats the empty-active case through the built game on desktop and simulated touch, checks the Continue control stays hidden, reloads the page, and confirms the legacy mirror remains untouched.

Run:

```powershell
node --test tests/cup_active_slot_authority.test.cjs
..\.qa-browser-venv\Scripts\python.exe tests/cup_empty_active_restart_browser_qa.py
```

The browser test requires a fresh `python scripts/build.py` first. These checks do not certify physical power-loss behavior or hosted restore.
