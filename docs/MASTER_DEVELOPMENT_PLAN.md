> **Current canonical roadmap:** `NEXT_MILESTONES.md` (v0.8.15). This document is retained as a historical master plan. `FEATURE_MATRIX_216_ITEMS.csv` preserves all prior requirements and appends eight new records.

> **v0.8.3 milestone:** NPC teammate launch coordination, predicted aerial target and difficulty-based apex timing implemented and regression-tested. Stale chase auto-tackle fixed. Next: staged player creator. Original frame parity still unverified.

> **Current brand and build (2026-10-13):** Supermagic Football v0.8.3; see `NEXT_MILESTONES.md`, `FEATURE_MATRIX_126_ITEMS.csv` and `TEST_REPORT_v083.md`. Historical sections below retain earlier milestones.

> **Living plan update (2026-10-13):** v0.6.2 complete — new 12 ratings / fatigue / numerical match mechanics and career growth. Current authoritative milestone sequence: `NEXT_MILESTONES.md`; current backlog: `FEATURE_MATRIX_126_ITEMS.csv`; verification: `TEST_REPORT_v062.md`. Historic statements below describe earlier baseline, not today's build.

# SUPERMAGIC FOOTBALL — living master development plan

**Baseline:** 2026-10-13  | **Status:** ACTIVE — pre-alpha | **Product:** standalone 2D arcade soccer remake + expandable soccer RPG | **Owner:** user | **Technical lead:** ChatGPT (planning/reviews within active sessions)

> **Integrity rule:** a roadmap item is COMPLETE only after implementation, a reproducible test, and acceptance evidence. UI labels or JSON definitions alone do not constitute functional completion. Change this file, `docs/FEATURE_TRACKER.csv`, `docs/CHANGELOG.md`, and the tests together after each development session.

## 1. Vision and non-negotiables

1. **Arcade feel first:** reproduce the *behavior* of 1993 Kunio-kun's Nekketsu Soccer League as faithfully as research and observed reference footage allow: six players on the pitch per team, giant expressive characters, ball handling, tackles and fighting, jumps and aerial moves, teammate commands, goalkeeper saves/knockdowns, transforming super shots, unpredictable pitch/weather, team tactics, halftime, leagues, versus, penalties and team meetings.
2. **Independent technology:** never ship or depend on an NES emulator, ROM, decompiled executable or ripped copyrighted sprites/audio. The user-supplied `Twin Shot (Hack).nes` may be studied privately as reference; distinguish hack-only behaviors from the documented original.
3. **High-resolution redraw:** target genuine, hand-crafted 2D art with 1080p presentation, 4K scaling and consistent proportions/animation; *not* just pixel-filtered NES video. Original-inspired style, authored assets; separate art pack from simulation.
4. **Run everywhere:** desktop Chrome/Edge/Firefox/Safari and mainstream Android/iOS browsers using keyboard, compatible gamepads and on-screen touch. Installable PWA and offline assets after first download. Keep 60 fps target on baseline devices, with quality settings.
5. **Built to expand:** all teams/players/stats/abilities, clubs, tournaments, stadiums, seasons and balance definitions live in versioned structured data. Core simulation must be decoupled from presentation for automated testing and networking.
6. **Original game modes must be finished before major expansions**. Preserve a selectable `CLASSIC` ruleset; new rules live in a separate `EXPANDED` preset.
7. **Respect rights:** game mechanics can be researched and independently implemented; public release using franchise names, character likenesses, music or copied art requires an appropriate rights review/licensing. Use independently authored assets for a distributable release.

## 2. Verified research and limitations

**References:**
- Falanx (2008), [GameFAQs Move List and Guide](https://gamefaqs.gamespot.com/nes/570716-kunio-kun-no-nekketsu-soccer-league/faqs/53977): controls, 12 Japan players and ratings, original modes, formations/AI, weather, moods and special-shot timing.
- RCREX (2004), [GameFAQs Guide and Walkthrough](https://gamefaqs.gamespot.com/nes/570716-kunio-kun-no-nekketsu-soccer-league/faqs/30061): menus/modes/opponents/controls.
- [Kunio-kun Wiki — Nekketsu Soccer League](https://kuniokun.fandom.com/wiki/Kunio-kun%27s_Nekketsu_Soccer_League): supplementary character and team information; verify against footage.
- User-provided `Kunio Kun no Nekketsu Soccer League Twin Shot (Hack).nes`: valid iNES container, MMC3/Mapper 4, PRG 8×16KiB, CHR 16×8KiB. **Hack modification list not established.** Not included in distributable package.

**Historically documented:** two 2-minute halves; 12 opposing teams; league qualifying threshold of >=16 wins and 70 points; four tournament playoff matches finishing with Italy; ties resolved by penalty kicks; up to four human players in versus (third/fourth control goalkeepers); PK mode; changeable formations/starting positions; AI pass/shoot/attack/goalkeeper settings; 12 Japan profiles; weather and pitch conditions; player mood and items. **Caution:** source translations, stats and super-shot appearance vary; record uncertainty and confirm by gameplay capture.

**Crucial gameplay detail:** special shots are *timing-dependent aerial contact near jump apex*; normal special shot is no direction + B, whereas the directional input produces a shared alternate arc shot. A one-button instant special is a convenience accessibility control, **not original parity**. Core prototype may use quick-super, but `CLASSIC` removes or remaps it.

**Historical uncertainty backlog:** numerical stats of every international player, exact opposing captains, precise special-shot sprites/collision trajectories, Twin Shot hack changes, original frame timing, exact team-selection restriction in versus. Never label inferred stats as authentic.

## 3. Technology and architecture

**Recommended production target:** TypeScript monorepo, Vite, Phaser 3 (renderer/input/animation, or PixiJS if profiling shows better results), engine-agnostic deterministic fixed-step simulation, Zod/schema-checked JSON content, Vitest for simulation tests, Playwright for browser/mobile smoke tests, Web Audio for sound; PWA with service worker. Later: Node.js + WebSocket/Colyseus authoritative or rollback-compatible multiplayer server, PostgreSQL for accounts/careers and object storage for UGC assets. No backend needed for offline classic mode.

**Current vertical slice:** browser-native HTML/CSS/Canvas JavaScript with editable `src/data.js`. This is deliberate low-dependency scaffolding; migrate to TS and separate modules before implementing networked simulation.

```text
packages/
  sim/                  # deterministic, renderer-independent match systems
  content/              # players, clubs, teams, shots, tournaments, weather schemas
  client/               # browser rendering, audio, input, menus, accessibility, PWA
  server/               # future authoritative sessions, matchmaking, persistence
  editor/               # future player/team/tournament/shot authoring tools
assets/
  characters/           # HD source, spritesheets, atlases, animation metadata
  stadiums/             # pitch, crowds, goal variants, weather elements
  vfx/                  # transforming shot sheets, hit effects, trails
  sfx/                  # newly composed/licensed sound effects and music
specs/                  # reference captures, parity checks, frame studies
```

### 3.1 Core simulation contracts

- `MatchRules`: duration, halves, kickoffs, goal scoring, overtime, penalties, fatigue, knockout recovery and penalties/no-fouls rules.
- `PlayerDefinition`: stable ID; identity, country, club, role, jersey, base attributes and progression caps; skills; special shot ID; personality; equipment; asset references; provenance (`verified`, `inferred`, `original_new`).
- `RuntimePlayer`: current position/velocity/facing, action state, possession, jump height, stamina, damage, fatigue, knockdown, mood, AI intent, cooldowns and effects.
- `BallState`: 3D-like z-height, velocity/spin, carrier, airborne collision, wall/line bounds, kick source, shot profile, goal interactions.
- `ShotDefinition`: activation constraints, transforms/animations, path integration, turn rate, multiple stages, bounces, damage, save difficulty, energy cost, sound/VFX; can be modded without code changes where possible.
- `TeamDefinition`: roster, country/club, colors, formation, default starting six and reserves, captain, offensive/defensive AI config, kits, home venue.
- `CompetitionDefinition`: league/knockout/bracket/season, participants, points and tie-breakers, qualification, fixtures, rewards, persistent records.
- `Save`: version, campaign state, career squad, player development, standings, unlocked assets and migration version.

### 3.2 Main systems and future-proofing

Deterministic update at 60 Hz; seeded random number generator; replay serialization to enable regression tests, spectator mode and eventually netcode. Renderer interpolates simulation snapshots and supports HD sprite assets, particles, configurable zoom and safe areas. Input action abstraction merges keyboard, touch and gamepads and supports per-player profiles. Multiplayer ownership must be explicit in simulation, with predictable pause/disconnect handling. Store non-sensitive offline data in IndexedDB/localStorage with export/import and migration strategy; online identity separate from save files.

## 4. Complete feature scope (requirements IDs in tracker)

### A — Original-style match simulation (critical)

- Field with accurate proportions/scrolling and goal detection; six active players per side, substitutions/reserves and keeper-specific behavior.
- Eight-direction motion, walk/double-tap dash/hustle, collisions, dribble, tackles, shoulder strikes, aerial kicks/headers, diving/flip kicks, team jumps, knockdown and recovery.
- A/B controls contextually depend on possession, opponent possession, loose balls and teammate possession. Teammate order-to-pass/order-to-shoot and defensive AI command system.
- Ball velocity, trajectory/height, bounces, spin, rebounds, airborne contact, goalkeeper blocks/catches/knockbacks and rebound follow-ups.
- Two halves, kickoff, halftime, scored goal/reset, draw/penalty overtime, full penalty mode and match summary.
- Fixed-step CPU AI: formation discipline, passing, shooting, tackle aggressiveness, attacking/defending zones, context tactical variants and difficulty.

### B — Original players, teams and super shots (critical)

- Original **Japan 12**: Kunio, Yoritsune, Saji, Horibata, Iwakabe, Genei, Ugajin, Onitake, Kumon, Kaizuki, Tsunewo and Carlos. Preserve source-attributed power, shooting, defense, speed class, original named shot and non-shot ability.
- The **13 teams**: Japan, Korea, Thailand, Mongolia, Cameroon, New Guinea, Senegal, Argentina, Mexico, Brazil, England, Germany and Italy. Each has playable six + roster/reserves, captain, lineup, tactics, kit and special-shot profile.
- **All 12 individual Japan super shots** with frame/state mechanics. Base shot identifiers: Nuts, Ninja, Wheelie, Princess Mole, Unstoppable, Mega Drive, Bitter, Accurate, Boring, Tosa Moon, Banana Crocodile, Omega Drive. Source guide is authoritative for names; animation appearance needs capture.
- **All opposing teams' super shots** and the shared *directional alternate shot*. Verify animation and exact behavior from video/ROM observation; current invented team names/effects are placeholders, not factual historical names.
- Super-shot transformations are geometry + projectile mechanics + hit effects, not only particles: curved bananas, fish, bird, and other projectiles where authentic to each move. Stage-by-stage animation with hitstop/camera/audio, per-shot stamina/cooldown only in EXPANDED if not authentic.
- Player-specific dribble, attack, goalkeeper skills; player mood/meeting interactions; original/reserved stats tracked with provenance and uncertainty.

### C — Original menus, environment and modes

- Title/intro, main mode selection, original-style team/roster screens, strategy and formation editor, player meeting dialogue and items, match setup, halftime and results.
- **Nekketsu League:** selectable 12 opponents, points/wins thresholds, 4-match playoffs, standings and save/continue (modern save plus optional password-like presentation).
- **Match/Versus:** six selectable best teams in CLASSIC (verify list), expanded mode all teams, two active players + extra goalkeeper participants, local gamepads and keyboard remapping.
- **Penalty:** 1vCPU/2P, five kicks or reference-accurate format, goalie dives and timer.
- Weather: clear/rain/wind/storm/lightning/tornados; pitch: grass/dirt/sand, wet spots, mud movement and blue/slowed ball, environment influence on shots.
- Music chooser, volume toggles, graphic scales, quality preset, subtitles, touch layout, language, accessibility.

### D — HD production quality

- Individually authored high-resolution big-head character style, 8-direction facing, run/jump/fall/tackle/hurt/recover/keeper animations, ball+transform animations; variation by team, uniform and character silhouette.
- 1080p/4K display support (not necessarily 4K native textures), 16:9 responsive camera for PC and landscape phone, readable HUD, 60 fps performance budget, dynamic LOD/particle settings.
- Particle and shader FX for lightning, mud, wind, spinning/projectile/banana/fish/bird shots. Animated spectators, score celebrations, original-style dramatic camera beats.
- Original/relicensed music/SFX; localization English then Swedish/Japanese; color-blind-friendly indicators and rebindable inputs.

### E — Future expanded game (after classic parity)

- Club and nation editor; user-defined players and super shots; import/export JSON mod packs, validation, versioning, safe asset sandbox.
- Custom tournaments: group stage, knockout, home-away, seasons, promotion/relegation, seeded brackets and configurable rules.
- Career manager: hire/firing, transfers, scouting, facilities, training schedules, injuries/recovery, growth/leveling, morale, contracts, economy and budget. **Separate progression ruleset**, preserving CLASSIC.
- Team building: stadium, academy, medical facilities, training upgrades, uniforms, sponsor and fan support.
- Ability growth: attributes/skill trees, specialty synergy, position adaptation, counter abilities, mastery/unlocks, fair-balance caps.
- Online: invite rooms, matchmaking, friends, reconnect, spectator/replay, ranked/unranked, anti-cheat, server authority, latency compensation, privacy/moderation and account recovery.
- Custom seasons and community workshop moderation; cross-device cloud saves where sign-in enabled; controlled updates/migrations.

## 5. Phases and hard acceptance gates

| Gate | Deliverable | Test required | State |
|---|---|---|---|
| M0 Source baseline | audited ROM metadata, original-vs-hack registry, verified mechanic spreadsheet, copyright boundaries | provenance checks, versioned tracker | IN PROGRESS |
| M1 Playable vertical slice | new engine launches on PC/mobile, 6v6 AI, passes, shots, goals, one special, pause, basic menu, keyboard/gamepad/touch | browser smoke + input test + 3-min match | IN PROGRESS |
| M2 Core parity | all original basic/A-B context moves, GK, ball physics, collisions, two halves, penalty overtime | matched reference-video test cases and physics unit tests | NOT STARTED |
| M3 Full roster/shot parity | Japan 12, every national roster and team attack, 12+12 unique special behaviors | every shot fires and produces verified outcome; roster traceability | NOT STARTED |
| M4 Modes/UI parity | strategy, reserves, meeting/moods/items, original league/playoffs, match/versus, PK, proper menu structure | complete campaign and local 4-player e2e | NOT STARTED |
| M5 HD remaster | approved HD animation sheets, original-ish art direction with authored assets, SFX/music, 60fps on target devices | visual comparisons, performance tests, accessibility QA | NOT STARTED |
| M6 Cross-device release | PWA/offline, persistent saves, responsive controls, exported distributable | Android/desktop multi-browser matrix, save migrations | NOT STARTED |
| M7 Extensibility/tools | content schemas, roster/shot/competition editors, mod import/export | add new team/shot/tournament WITHOUT core-code changes | NOT STARTED |
| M8 Clubs/career/progression | contracts, stats growth, facilities, budgets, seasons, AI careers | season simulations, economy balancing, save continuity | NOT STARTED |
| M9 Online | server matches, rooms, matchmaking, sync, recovery/replay | network simulation under loss/latency, concurrent load and security | NOT STARTED |
| M10 Production release | content completion, legal/rights review, performance, monitoring, documentation | release checklist and manual signoff | NOT STARTED |

**Ordering:** M0/M1 can run concurrently. M2/M3/M4/M5 are the classic-remake release track. M6/M7 enable future growth. M8/M9 follow once core simulation stabilizes, though architecture seams are designed now. A prototype's generic shot animation does not complete M3.

## 6. Development update workflow and definition of done

After **each active development session**:

1. Update `docs/FEATURE_TRACKER.csv`: requirement ID, status (`TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`), priority, implementation path and evidence.
2. Append a dated entry to `docs/CHANGELOG.md` with **actually changed code**, test outcomes, blockers, deviations and next targets.
3. Re-run `node tests/static_check.mjs` and applicable browser/manual acceptance tests. Any failed check blocks status `DONE`.
4. Document incomplete/unknown source behavior in `docs/REFERENCE_GAPS.md`, with a proposed test/reference clip.
5. Update phase gate statuses here. No milestones become DONE solely because folders exist.
6. Ship versioned ZIP artifacts and SHA-256 file hashes; track known issues and backward compatibility.

**DoD for any feature:** complete logic + 60 fps interactive proof + unit/e2e check + PC keyboard + generic gamepad as appropriate + touch interaction if appropriate + mobile viewport/landscape + error and save handling + tracker link. High-risk special shots also need dedicated golden-frame and collision tests. Multiplayer features need multi-client determinism and disconnect tests.

**Management policy:** each session reports accomplished work, next work, missing permissions/assets, blockers and risks. Updates require an active conversation/session or independently scheduled automation; this plan does not imply autonomous work continues when chat is inactive.

## 7. Immediate prioritized work packages

**WP-01 (first):** implement missing `src/main.js`, get independent playable 6v6 prototype and reliable keyboard/gamepad/touch input; launch in a local HTTP server; record browser smoke test.

**WP-02:** split from monolithic Canvas prototype into engine/input/sim/render; implement original context-based A/B actions and multi-phase jump super shots; consistent grounded ball and goalie response.

**WP-03:** create shot specification documents and annotated reference captures for all Japan players and national teams; verify player statistics/captains and label `unknown` rather than auto-inventing.

**WP-04:** create 1080p HD original-style player animation template and character asset pipeline (spritesheet metadata, color palettes, body/head/jersey layers, batch exports); verify consistent scale against screenshot.

**WP-05:** original competition screens + complete standalone loop including save/continue and field/weather.

## 8. Decisions and risks

- **Rights risk / release:** an exact graphical recreation of protected Kunio-kun characters may need approval for public distribution. Use reference only during research and commission/create independent artwork for distributable assets.
- **Source gaps:** one Twin Shot hacked ROM may alter physics, characters, music or abilities. Maintain parity matrix for stock game, hack and our optional expanded mode.
- **Scope:** full production is a multi-milestone project, not a single build. Do not announce feature-complete before testing.
- **AI/gameplay:** heuristics can make play feel wrong even with matching sprites. Prioritize measured behavior and input responsiveness over graphics alone.
- **Network:** authoritative sync is costly if the sim isn't deterministic. Require deterministic APIs and versioned input packets from early iterations.
- **Tools and local access:** chat tooling operates on uploaded/generated files and cannot silently edit the user's Windows folders. Sync to GitHub or local machine requires an explicitly supplied repository path/permission or manual ZIP copy.

## 9. Detailed content inventory and latest engineering report

- `docs/CONTENT_BIBLE.md`: 13 teams, original Japan 12 stats/skills, shot transformation verification protocol, all original and expanded gameplay content groups and HD animation checklist.
- `docs/STATUS_REPORT_2026-10-13.md`: actual engine deliverables, tests, incomplete work, source limitations and next tasks.
- `tools/update_feature.py`: safe per-requirement status updates with DONE evidence requirement, appending to changelog.

## 10. Current sprint focus

S0 tasks: (a) inventory uploaded project, (b) baseline reference table and risk log, (c) create tracker/tests, (d) implement/fix independent browser launch, (e) package and report verified results.

Last updated: **2026-10-13**. Update the phase table, tracker and changelog together whenever development continues.


## Updated 2026-10-13: staged AI and team management delivery

- v0.6.1 AI profile and live CPU difficulty: DONE, automated QA PASS, balancing not verified by people.
- v0.7.0 flags/club crests, shared pre-game/live team management: NEXT.
- v0.7.1 stamina/fatigue action costs and match effects: PLANNED.
- v0.7.2 morale/pep talks and expressive celebrations: PLANNED.
- v0.8.0: first two defensive and first two GK super move prototypes DONE; exact Nintendo move parity and further moves PLANNED for v0.8.1+.

See `NEXT_MILESTONES.md`, `FEATURE_MATRIX_90_ITEMS.csv`, and `TEST_REPORT_v061.md` as the authoritative current tracking documents. This dated update supersedes stale status values in the 2026-10-12 original master-plan milestone table.


### v0.6.3 update (2026-10-13)

Completed focused uniform and agility milestone. See `NEXT_MILESTONES.md` for next priority (v0.7.0 flags and team command center) and `PLAYER_CREATOR_SPEC_v063.md` for staged avatar development; 124 tracked features in `FEATURE_MATRIX_124_ITEMS.csv`. Every milestone requires source, test, screenshots, documentation, versioned downloadable game and editable project.


## v0.7.1 implementation update — 2026-10-13
Completed bounded stamina and substitution milestone. Full change log in `CHANGELOG_v071.md`, model in `FITNESS_AND_SUBSTITUTIONS_SPEC_v071.md`, test evidence in `TEST_REPORT_v071.md`. Next is v0.7.2 emotional reactions and morale/team talks; do not start full player creator and online systems in same step.


## Brand and mobile display delta (v0.7.2, 2026-10-13)
Supermagic Football is the new **provisional** project name. UI, docs, app metadata and packages updated; original Nintendo reference names retained only as historical research. Live browser fullscreen tested for desktop and emulated Android landscape; iOS Add-to-Home-Screen instructions added. Native iOS and legal clearance remain gaps. Morale now targeted at v0.7.3. See `TEST_REPORT_v072.md`.


## Incremental checkpoint v0.8.1 — 13 October 2026
Completed a limited hyperdash / timed airborne header / ordinary GK dive subsystem. It reuses the existing engine, fitness and NPC logic, keeps older save compatibility and rare moves, and passes dedicated Node + Chromium desktop/phone-emulated tests. Team stacking and original apex-shot timing remain open; next milestone v0.8.2. Full results: `docs/TEST_REPORT_v081.md`.


## 2026-10-13 v0.8.5 continuation

The four-button interface is the current baseline; v0.8.5 adds physical player contact only. Features 153–180 capture new AI, roster, national tournament, animation, supershot and tuning requirements. See the new active roadmap `NEXT_MILESTONES.md`. No new international teams, player portraits or authored super moves were shipped this milestone.


## Update 2026-10-13 — v0.8.6

Four-button Phase 2 delivered with bicycle/flying kicks, a basic dribble trick, GK distributions, and AI detours. Full test evidence: `TEST_REPORT_v086.md`. New requirements 181–184 cover major UI/icon and player-cartoon-graphics redesign; staged after v0.8.7 dribble library and v0.8.8 remaining controls/penalties. Current authoritative plan: `NEXT_MILESTONES.md`; canonical 184-item tracker: `FEATURE_MATRIX_184_ITEMS.csv`.


## 13 October 2026 v0.8.9 addendum
Main-menu navigation redesign phase 1 delivered; all preexisting actions and controls preserved. Audited three supplied CSV datasets and staged 734 *review-only* corrections; game roster changes remain deferred. Added seven BPW year/era squads to backlog, including unique canonical person IDs across BPW years and BPW-only boosted variants. 2016/2020 are not World Cup years. See new v0.8.9 docs and tracker.


## v0.8.10 addendum — cartoon team identities (13 October 2026)

All 216 current teams have offline vector identity artwork. 165 receive original club shields, 51 receive stylized flag artwork; symbols show in setup, standings, scoreboard, club lists. This is a partial completion of interface requirements, not verified official flags or crests. Roster/BPW corrections remain deferred. See `NEXT_MILESTONES.md` and `TEST_REPORT_v0810.md`.
