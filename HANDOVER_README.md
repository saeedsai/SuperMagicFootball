# START HERE — Clean handover for the next chat

## 1. What this archive is
One **complete but cleaned** Supermagic Football v0.8.22.1 alpha baseline. Open the project root after extracting this ZIP. The source code, browser game, test catalog, active design requirements and current QA evidence are all here. This handover removes redundant historical checkpoints, old version manifests, test screenshots, logs, obsolete roster audit snapshots, upgrade scripts, and duplicate release bundles.

**`play.html` is the portable playable offline game.** `index.html` + `src/` is the editable/hosted game; do not attempt to edit the huge generated `play.html` directly. Build it after source changes using `npm run build`.

## 2. Current proven baseline
- Version: **v0.8.22.1 Alpha** (October 14, 2026).
- Playable four-action-button soccer game, six approved six-a-side formations, Career and cup modes, keeper automation, six mixed World Cup BPW teams and the new Super Shot / Super Header / Super Bicycle input grammar.
- **54/54 Node scripts** passed and **34/34 distinct browser scripts** passed, in six bounded browser groups, at last release. The cleaned package was independently rebuilt and reran the Node suite for handover. The authoritative prior detailed evidence is retained in `docs/qa_runs/` as seven JSON files.
- **357 acceptance cases** in `docs/MASTER_QA_TEST_CASES_v08221.csv`, including future requirements that have *not* been implemented/certified.
- Actual phones, physical gamepads, Safari/Firefox and single-command uninterrupted browser regression are still **not certified**.

## 3. Read in order
1. `NEXT_CHAT_PROMPT.md` — full handoff instruction, safe to copy into a new ChatGPT chat.
2. `docs/NEXT_MILESTONES.md` — active roadmap and deferred requirements.
3. `docs/SUPER_ATTACK_SEQUENCE_SPEC_v08221.md` — authoritative latest controls; overrides older specs when they disagree.
4. `docs/GAP_REGISTER_v08221.md` and `docs/STATUS.md` — known gaps.
5. `docs/TEST_REPORT_v08221.md` and `docs/MASTER_QA_TEST_CASES_v08221.csv` — what passed versus what is only planned.
6. `docs/AUDIO_MUSIC_PRODUCTION_PLAN_v0818.md` — first specification for **v0.8.23**.
7. `docs/FEATURE_MATRIX_218_ITEMS.csv` and `docs/FEATURE_BACKLOG_ACTIVE_v08203.csv` — tracking; historical status snapshot requires careful interpretation.

## 4. Minimal commands
```bash
npm run build
npm test
node tests/master_contracts.mjs
python tests/run_master_suite.py --profile smoke --category browser
```

Full browser regressions are **34 distinct scripts**. Run sequentially in six bounded groups (never launch all shards simultaneously):
```bash
python tests/run_master_suite.py --profile full --category browser --shard-count 6 --shard-index 0 --timeout 55
# repeat for indexes 1, 2, 3, 4, 5, one after the other
```
Generated screenshots, log files and `docs/qa_runs/` new run reports are test outputs; remove stale outputs from *future release* ZIPs while retaining the final current-run evidence.

Python Playwright and a Chromium executable must be available for browser tests. Node and Python are required; there are no external runtime network dependencies for the playable HTML.

## 5. Non-negotiable design rules
- **Four buttons only:** Pass, Shoot, Dribble, Jump; no fifth special/swap/sprint/GK dive button.
- Six formations only: **2-1-2, 1-2-2, 2-2-1, 1-3-1, 1-1-3, 3-1-1** (one goalkeeper + five outfield).
- Hold Jump + direction to run; off-ball Dribble taps switch teammates. Keep goalkeeper saves/dives/catches/distribution automatic.
- **Jump first then airborne Pass = cross**; Pass before Jump is never a cross. Held Pass then release produces a loft/long pass.
- Current special attack grammar: when the ball is airborne nearby, Jump→Dribble = normal bicycle; Jump→double Dribble = Super Bicycle; Jump→Shoot = normal header; Jump→double Shoot = Super Header. When carrying, Jump→Shoot = elevated ordinary shot; double Jump→Shoot = Super Shot. Hold Dribble→Jump stationary ball lift remains, without the player jumping. Double-tap resolution window: **0.32 s**.
- Super Shot, Super Header, Super Bicycle share special-shot power and transformed-ball animation *when the player has a shoot-type Super ability*. Without shoot ability, these commands produce stronger ordinary, untransformed attacks. Defensive-specialists should not transform shots.
- Six BPW squads: **1998, 2002, 2006, 2010, 2014, 2018**, each 12 unique mixed-nation World Cup players, quota 2 GK / 3 DF / 4 MF / 3 FW; keep older historical legend teams separate.
- Preserve existing saved-game identifiers and backwards compatibility. OVR is six-position-stat mean (see dedicated spec).
- Five-level Super Defense, tiers, rare Star/Superstar caps, manager customizer, Career growth and improved stadium/weather/celebrations are **future backlog**, not currently enforced.

## 6. Roadmap decisions
- **Next major implementation: v0.8.23 audio**: original or explicitly licensed music (menu + halftime) and goal, save, tackle, stun, and Super attack sounds, mute/volume controls, mobile audio unlock and offline tests.
- Follow-ups: v0.8.24 keeper and animation polish; v0.8.25 BPW personality; later specializations, Career, stadiums/weather.
- **Do not resume routine 2026 roster/ratings correction** unless the user explicitly changes this decision.

## 7. Deliverables expected at the end of every development turn
Implement changes now, write regression cases, execute Node and browser QA as available, update active docs/QA catalog/roadmap and build **a complete ZIP plus a separate playable `play.html`**. Verify archive integrity and exact HTML equality. Never report a script or acceptance case as passed unless executed. Report all hardware and timeout limitations.
