# Supermagic Football — complete project handover and forward plan

## Single source of truth

Release **v0.8.24.12 Alpha**. Edit `src/*.js`, `index.html`, `style.css`, `package.json`; rebuild `play.html` with `npm run build`. Never attempt to reconstruct the game from screenshots or an older HTML file. `HANDOVER_README.md` prescribes document reading order and `NEXT_CHAT_PROMPT.md` is the copy/paste instruction for a new conversation.

## Project layout

- `src/engine.js`— match states, ball physics, keeper logic, aerial combos, penalties, ability events.
- `src/main.js`— five-category UI, match setup, career, competitions, settings, persistence and control navigation.
- `src/input.js`— keyboard, touch and gamepad mapping for exactly four actions.
- `src/render.js`— canvas pitch, teams, player visuals, effects.
- `src/data.js`, `src/bpw_world_cups.js`, `src/bpw_alltime.js`— team identities and rosters.
- `src/audio.js`— audio engine, music, ambience and controls.
- `src/match_telemetry.js`— diagnostic-only telemetry observer (not part of standalone game).
- `tests/*.mjs`— Node gameplay, content, controls and diagnostic regression.
- `tests/*.py` and `tests/run_master_suite.py`— Chromium desktop/touch regression runner with JSON records.
- `docs/MASTER_QA_TEST_CASES_v08221.csv`— living QA requirement catalog; do not confuse catalog count with executions.
- `docs/history/changelogs/`— earlier historical versions; latest changelog is at root.

## Current foundation, protected invariants

- Five top menu choices: Quick Match; Online (planned modes labelled Coming Later); Career; Leagues & Cups; Settings.
- Four and only four gameplay actions: Pass, Shoot, Dribble, Jump. No Special button added.
- Six 6-a-side formations, six BPW World Cup historical squads, and seventh BPW All-Time Legendary 12 with the user's exact names/countries/positions/LEG 98–99 ratings.
- Super Shot/Header/Bicycle double-action combinations, stamina/fatigue, ordinary shots, saves, penalty shootouts, original audio, career, playable competitions, responsive touch/desktop UI, import/export and save compatibility.
- Do not restart postponed routine roster-stat corrections. Keep future rare Super Defense and Tricks ideas, huge GK fatigue and comedy/magic visuals in the deferred specification.

## Completed milestones

- v0.8.22–v0.8.23: aerial combos, audio implementation, BPW All-Time.
- v0.8.24.0–v0.8.24.6: keeper fairness, difficulty tests, browser reliability.
- v0.8.24.7: five-category responsive menu redesign.
- v0.8.24.8–v0.8.24.9: resting-ball physics/ordinary shot reach, zero-human AI ownership.
- v0.8.24.10: penalty keeper tracking/sudden-death fairness and 15 full match scripted replays.
- v0.8.24.11: keeper collection reach and event-backed kick telemetry; 45 scripted match cohort.
- v0.8.24.12: passive release pressure/keeper position capture and 30 additional diverse scripted matches; two new Node suites and complete full automated regression.

## Next milestones in priority order

1. **v0.8.25 (next major): BPW unique character animation/personalities.** Introduce respectful original cartoon silhouettes, expressions, unique victory/goal animations and coherent transition timings for the seven BPW teams. First write acceptance tests for roster invariants, animation fallback, state transitions and mobile performance. Keep every existing gameplay control and team ID; avoid copying licensed athlete photographs or unverified actual features.
2. **Balance QA continuation:** collect more real player representative difficulty trials; stratify by shot distance, defensive pressure, GK fatigue/lane and rebound chain. Fix only confirmed, reproducible engine defects; no blanket GK nerf from current synthetic results.
3. **Cross-platform certification:** real Android+iOS phones, external gamepads, Firefox/Safari, normal browser-origin audio preference persistence, reduced-motion access, low-end frame timing and input latency.
4. **Later Star/Superstar features:** high-fatigue Super Defense for GK/DF, Super Shots for MF/FW, specialty animations and rare ball-carrier Tricks with cooldowns, counterplay and fairness—strictly no fifth gameplay action button.
5. **Future larger systems:** career/competition, stadiums/weather, customization and roster updates at their actual scheduled milestones.

## Iteration work cycle

Review gap/test reports → reproduce defect → add minimal acceptance regression → implement within milestone → run Node/browser suites in independent bounded batches → record exactly passed/failed/timed out/unrun → update docs/change log/master catalog → rebuild standalone → remove generated QA images/exports → verify ZIP and SHA-256 manifest → deliver complete ZIP + standalone playable HTML + copy-paste handover prompt.

## Current limitations and scientific interpretation

The historical 45 and new 30 scripted full-engine matches are **not 75 human-player matches**; only the latter contains release context snapshots. Pressure buckets use game-world unit thresholds rather than calibrated xG. Available browser tests are Chromium desktop and simulated-touch, not physical iPhone/Android/gamepad certification. Record these limitations explicitly in future handovers and avoid inventing success counts.
