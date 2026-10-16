# SuperMagic Football — full scope review and active requirements map
_Date: 16 October 2026. Basis: current master plan, 218-item historical feature matrix, latest gaps and live `dev` modular game._

## How to interpret completion
The archived `FEATURE_MATRIX_218_ITEMS.csv` has **218 requirements: 41 Done, 120 Partial, 57 Missing** as entered in that matrix. These counts are a **historical inventory**, not today's independently audited functional completion figures: subsequent gameplay, asset, team and QA commits have changed the code. Do not automatically mark anything complete without a runtime test, repeatable acceptance result and versioned source evidence. Older master M0–M10 gate labels similarly describe ambitions, not recent CI certifications.

The live entry point is `index.html` + `src/main.js` + `src/modules/` + `data/`. Legacy `src/engine.js`, older handovers and single-file QA artifacts are not the authoritative playable implementation.

## Outstanding requirements — grouped, scoped and prioritized

| Workstream | Actual work still required | Delivery priority |
|---|---|---|
| Keeper gameplay | **New:** earlier visible autonomous dive initiation for credible incoming shots, with real save geometry unchanged; continue physical approach/movement, missed-save animation/hand grip, corner fairness, recovery and human/CPU balance | P0; active |
| Fair Super Shot | 4% slower launch / 8% greater cost already shipped; calibrate successful goals, keeper contacts, fatigue and nonlinear Level 1–5 trajectories in seeded and actual match cohorts, both directions | P0; next follow-up |
| Goalkeeper hands | Catch and hold at glove height exists; add eight-direction gripping/throwing pose and proper transitions, and refine tactical/manual distribution | P1; next |
| Character graphics | Named-player resemblance and provenance; authored 2D art quality; all directional motion; expression diversity, goal celebrations, sadness, contact and weather materials; remove art overlaps without altering physics | P1; parallel artist |
| Roster and statistics | FC27 ratings/positions versus actual verified sources; birthdates, ages, height, nationality, roster names, player appearance/identities, historical provenance, provisional ratings without FC27; retain immutable club/team indexes and 2GK/3DF/4MF/3FW | P1; separately owned agent |
| Match mechanics | Original timing/frame parity, aerial moves missing from legacy tracker, free kicks/fouls/referee, contextual pass/cross, goalkeeper punches, passes, pressure and collision animation and physics balance | P1/P2; incremental |
| AI, strategy | Real human-v-CPU and all difficulty levels; teammate press, movement, repositioning, tactics, reaction, pathfinding, keepers against varied shot classes | P1 |
| Team management | Full starter/captain/reserve changes across paused/halftime phases; tactical advice; suitable-position feedback; morale/talks, items and coaching interactions | P1/P2 |
| Modes and cups | Original league and playoffs parity, up to four local human participants including GK, single PK mode, full national/continental qualification rules, season simulation and endings | P2 |
| Career and tools | Transfer, training, budgets, facility/academy and long-term growth, side-by-side club/roster editors, conflict/provenance guards, player creator/avatar editor and customization | P2 |
| Stadiums/weather/audio | Pitch deterioration and surfaces, stadium presentation and crowd, audio/music original production and cross-browser lifecycle correctness | P2 |
| Engineering / platform | Extract remaining physics tuning with bounded checks; deterministic standalone sim; browser-save and import/export restart checks; physical iOS/Android, gamepad, Firefox/Safari, offline/PWA/FPS/accessibility | P3 / owner-deferred certification |
| New feature expansion | Rare Stars/Superstars Super Defense, MF/FW eligibility, comedy tricks and anti-stunlock balancing; online multiplayer/server sync and matchmaking | Long term, explicitly deferred |
| Legal/rights | Author independently original visual/audio assets; perform likeness/license review before public production release | Required before production |

## Protected invariants
- Exactly **four gameplay buttons** (Pass, Shoot, Dribble, Jump), five primary menu areas, six 6-a-side formations, seven designated BPW historic squads and historic stable team/player indices and save keys.
- Club starting-roster contract **2 GK, 3 DF, 4 MF, 3 FW** across twelve-player rosters; do not overwrite work from roster or graphics agents.
- Preserve the 20% extended field, legitimate goalkeeper depth-plane contact, swept high-speed ball save checks, 14% single-roll rare keeper super logic and standard pass/normal-shot speed.
- Never equate a successfully built Pages artifact with actually interacted gameplay; report the exact CI commit and live browser check separately.

## This bounded checkpoint
**Selected P0:** implement a keeper anticipation animation so goalkeepers *attempt* more credible dives before a shot reaches their save depth. Intent is triggered by a short-horizon non-mutating ball projection within the goalkeeper's available region; prevent attempts for away-travelling, far-wide, overhead shots and repeat intent. A failed attempt visually recovers. Crucially, the first visible action does not move the player/ball, grant a save, alter save radius, or change the historical narrow keeper contact plane. Existing real catches and deflections remain the only valid save events.

Acceptance gate: 30/60/120Hz, both defended goals, desktop/simulated touch, no early keeperContact/save, one intent per qualifying flight, unchanged real-contact rules; preflight + sharded full regression before declaring release ready. The feature **does not yet improve actual lateral movement or catch percentages**; that's a measured later milestone, not a claimed completion.

## Revised next five focused iterations
1. **Keeper dive intent QA and shot fairness:** complete new tests and seeded corner/save-rate analysis; tune real movement only if outcomes show a reproducible defect.
2. **Goalkeeper hand poses and distribution:** grip and throw/long punt animation across eight views and controlled keeper time-to-release.
3. **Player first-touch and passing actions:** improve contact/reception and directional pass follow-through with four-button regressions.
4. **Concurrent data/editor validation:** FC27 provenance audit, appearance preset references and safe dry-run conflict report; no changes to agent-owned roster without source review.
5. **Career and tactics usability:** substitutions and formation suitability advice, manage pauses/halftime, preserve saved teams and coaching UX.

After five iterations: expand original mode/cup parity and distinctive gameplay abilities only after clear acceptance, maintain physical device/online/Super Defense/Tricks as owner-deferred.

## Cleanup / archival safety
The many `docs/GAP_REGISTER_*`, `TEST_REPORT_*`, previous matrix versions, QA run logs and source-scoped asset handovers are historical evidence or active regression inputs. `tests/.generated/` is created at build time and not a tracked replacement entry point. Do not remove historical, template-looking or another agent's files until a reference/CI dependency check and a successful full regression prove them safe. Only eliminate proven local transient files (untracked `__pycache__`, temp Playwright artifacts and generated fixtures), not repository provenance.

## Owner-priority update — goalkeeper attempt/contact telemetry (16 October 2026)

The modular game already emits early `keeperDiveAttempt` events separately from actual physical `keeperContact` events. The diagnostic `MatchOpportunityTracker` now links both events to the correct currently active ordinary or Super Shot, differentiates unmatched events and uses separate denominators for dive attempts, actual contact and match outcomes. This is an incrementally fulfilled QA/measuring requirement; **not** proof of increased goalkeeper intervention frequency or a finished P0 dive balance target. Follow `docs/KEEPER_DIVE_TELEMETRY_20261016.md` for test evidence and known limitations. Historical 218-item feature-matrix counts have **not** been silently rewritten from this telemetry-only improvement.
