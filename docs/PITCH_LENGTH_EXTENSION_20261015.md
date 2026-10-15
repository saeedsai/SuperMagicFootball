# Field geometry change — +20% playable pitch length (15 October 2026)

## Implemented
- Modular gameplay JSON `world.field.w`: **1884 → 2260.8** world units, exactly +20%.
- `world.w`: **2184 → 2560.8**, preserving 150 units of perimeter behind both endlines.
- Field height **1220**, vertical position **155**, overall height **1530** unchanged.
- Goal mouth **620–910** and depth **76** unchanged. Six normalized formations, ball/keeper physics, spawn, minimap, renderer, field artwork, camera and goal positions read shared world data.
- Rotated `sw.js` cache version to `smf-082533-pitch-length20-v1` so GitHub Pages clients don't continue serving the old geometry.
- Extended `scripts/validate_data.py` with strict width/end-margin and goal integrity checks.
- Added five active Node geometry contracts and browser desktop + simulated touch kickoff/keeper/camera acceptance. Both are integrated with the inherited full regression workflow.
- No changes to team/player JSON, graphics assets, saves, 4-button controls, 5 main menus, 6 formations or player/goalkeeper abilities.

## QA gating
Run `python3 scripts/validate_data.py`, `python3 scripts/build.py`, `node --test tests/*.test.cjs`, and `python3 tests/pitch_length_browser_qa.py`. The `Full Regression Census` GitHub Actions workflow executes all discovered Node + Chromium browser scripts across eight shards and must pass on the **exact new commit** before calling the release regression-certified. The modular QA workflow also validates JSON and Node tests.

## Active limitations
- A longer field changes real traversal distances and therefore may alter match goals and stamina naturally; do not falsely claim exact same scores at the same random seed.
- Legacy `src/engine.js` is a separate archived compatibility runtime and is not changed.
- Other agents are independently editing 165-club rosters and Character Art III; their source and scripts must not be overwritten.
- Physical Android/iOS certification, true hosted-browser interaction and save-restart persistence remain explicitly far future by owner's request.

Full QA status: **pending exact-commit GitHub CI** at authoring time. See GitHub Actions for result and rerun record.
## Adjacent defect found during roster-agent regression

Modern source-backed clubs sort goalkeepers together, but the historical numeric starting lineup can put their second keeper into a defender's role. Updated modular and legacy tactics `defaultPlan()` to fall back to an exact GK/DF/DF/MF/FW/FW selection when historical slot order no longer fits. `validatePlan()` now rejects two active goalkeepers; `safePlan()` recovers without altering saved player IDs. Four new active Node contracts validate the default active six across all **223 teams** and protect player positions. Explicit user selections that already contain a proper keeper and five outfield players remain supported. See exact-commit CI evidence.
