# SuperMagicFootball — owner-priority feature audit and delivery roadmap
**Date:** 19 October 2026
**Basis:** Live modular `dev` tree, `MASTER_DEVELOPMENT_PLAN.md`, `NEXT_MILESTONES.md`, `FEATURE_MATRIX_218_ITEMS.csv`, `REQUIREMENTS_REVIEW_20261016.md`, `SUPER_ATTACK_SEQUENCE_SPEC_v08221.md`, `SUPER_DEFENSE_AND_TRICKS_BACKLOG_v08241.md`, `GRAPHICS_AND_CUSTOMIZATION_SPEC_v082532.md`, `concept_character_pipeline/MASTER_ROADMAP.md`, menu handoff and active backlog. This is a scope/priority correction **not a code completion or test report**.

## Owner instruction — PRIORITY OVERRIDE
The project owner reconfirmed that **more distinct Super Shots including zigzag paths, Super Defense, funny/magical ball-carrier Tricks, radically better graphics and animation, player-facing UX, and playable LAN mode** must receive scheduled implementation rather than remain indefinitely "owner-deferred." Existing historical notes deferring these systems are superseded as *priority only*. Do **not** interpret prioritization as permission to skip dependencies, invent controls, rewrite gameplay wholesale, modify overlapping agent-owned paths, or release untested code.

Keep **Pass / Shoot / Dribble / Jump only**, six formations, existing 223 team/2,676 player identities (2 GK / 3 DF / 4 MF / 3 FW), seven BPW squads, saved IDs, main menu hierarchy, current physical keeper contact bounds and concurrent agent work. Continue small feature-flagged batches, targeted Node + real-browser desktop/simulated-touch tests, exact integrated-SHA full regression and hosted verification; physical-phone QA is separate. Never override someone else's feature claim.

## Verified foundations — do not misclassify them as missing
- `data/mechanics/gameplay.json` already declares named shot behaviors **zigzag** (books/serpent), **curve** (banana), **spiral** (tornado), **homing** (target/eagle), **ricochet** (horse), **phase** (ghost), **burrow** (mole), **warp** (omega), and other named effects. These are **configuration/existing generic families**, **not certification that every distinctive projectile has good visuals, unique flight, collision fairness or owner-accepted animations**.
- Current `docs/SUPER_ATTACK_SEQUENCE_SPEC_v08221.md` plus `tests/v08221_aerial_super_rework.mjs` record ordinary/Super bicycle and header sequences, ground elevated shot and double-jump Super Shot. Four-button cancellation and ball lift have existing tests. Some much older combination documents conflict: use **the newer Super Attack Sequence spec** as source of truth.
- Current `data/mechanics/gameplay.json` has early defensive abilities (DRILL ATTACK, SHOCK BURST; GK MEGA PALM and TORNADO PUNCH); do **not** report all Super Defense as absent. Full wall/spin/supernova roster/counterplay and approved tier gating are **not shipped**.
- Current eight-view Studio and procedural characters exist; art quality, editable true source-layer rig across all eight viewpoints, unique named-character likenesses, consistent beards/hair and animations are still incomplete; passing pose tests alone does **not** satisfy owner art signoff.
- LAN is shown as Coming Later in menu handoff. No proof of a complete two-client synchronized playable LAN match was found in reviewed plan/source inventory; keep it **Missing / not certified**, not implemented.

## 30 top remaining features (status reflects reviewed scope, not a new runtime certification)
Legend: **Partial** = foundational code or UI exists but substantial requested result is unfinished. **Missing** = proposed feature has no confirmed complete implementation. **Unverified** = broader behavior may exist but lacks full acceptance evidence.

| ID | Priority | Feature | Status | Definition of done / core scope |
|---|---|---|---|---|
| SH01 | P0 | **Distinct zigzag super shots** | Partial | At least two independently tuned left/right mirrored zigzag flight profiles, speed-amplitude-frequency curves, swept interception + keeper tests, 30/60/120 Hz |
| SH02 | P0 | **Bending banana / double-curving shots** | Partial | Distinct signed sideways curves and delayed second bend, both goal directions, realistic hit/crossbar behavior and visible transform |
| SH03 | P1 | **Spiral / tornado-style projectiles** | Partial | Distinct vertical/lateral movement, visible wind spiral/trail and consistent hit/collision semantics |
| SH04 | P1 | **Ricochet / bank / rebound specials** | Partial | Intentional bounce rules, safe bounded rebound count, valid goal scoring and readable trails |
| SH05 | P1 | **Counterable homing specials** | Partial | Predictable limited turn rate, defender/GK interception, no unavoidable goal or sudden teleport |
| SH06 | P1 | **Warp, phase, underground/burrow shot profiles** | Partial | Individually authored animations and fair actual paths; visible tells and no invulnerable collisions |
| SH07 | P1 | **More transformed balls and special VFX** | Partial | Unique character-specific animals, fruit, objects, funny shapes, visual return to ordinary ball, accessible FX |
| SH08 | P0 | **Player-specific shot catalog, rarity and ability progression** | Partial | Distinct move identities/levels 1–5 with tier restrictions, exclusive shoot/defense rules, save-safe migration; original/BPW provenance |
| SD09 | P0 | **Super Defense: spinning bumper** | Missing | Player push/stun with fixed radius, capped stun, high fatigue, cooldown and human/CPU counter |
| SD10 | P1 | **Super Defense: cartoon bat/mace bonk** | Missing | Original, non-graphic animation; short bounded hitbox + recovery; avoid repeat exploit |
| SD11 | P0 | **Fire/Ice/Magic/Demon Walls** | Missing | Different readable temporary barriers; collisions, counterplay, no permanent goal line |
| SD12 | P1 | **Supernova defense** | Missing | Rare area effect with telegraph, strict cost/radius, accessibility and no guaranteed save |
| SD13 | P0 | **Rare GK/DF Super Defense and level gating** | Partial | Integrate existing drills/GK specials with role/tier progression, extreme GK fatigue, cooldown, mirroring and fairness |
| TR14 | P0 | **Comic dribble tricks: bonk/spin/sand/scream/lightning** | Missing | One at a time as bounded star-only trick, counter cue, fatigue/cooldown and anti-stun lock |
| TR15 | P1 | **Fireball, ice slip, wind gust and mud trail tricks** | Missing | Individually scripted non-stacking elemental field interactions with clear duration and recovery |
| TR16 | P1 | **Stealth and temporarily invisible ball** | Missing | Short readable telegraph, owner-side outline, fair CPU/human counter and deterministic recovery |
| TR17 | P1 | **Ride-ball wheel and teammate-shoulder tricks** | Missing | Funny but stable rig/collision, cancel on contact, teammate eligibility |
| TR18 | P1 | **Blink forward / short teleport trick** | Missing | Safe constrained displacement, collision/goal-bound safeguards, cooldown and readable trail |
| CT19 | P0 | **Complete four-button combination grammar** | Partial | All action/tap/hold/ordered/double-tap sequences, ball states, goalkeepers and multi-touch/gamepad conflict precedence covered in test matrix |
| CT20 | P0 | **Defensive contextual action reliability** | Partial | Dribble switch, Shoot slide, Pass tackle/chase, Jump sprint, Jump+Pass pursuit/auto-tackle, auto-switch and cooldown reliably work |
| GR21 | P0 | **High-quality authored eight-view player rig** | Partial | Replace flat/distorted provisional sprites with approved front/back/side/quarters, clean limb/kit/head alignment and visual signoff |
| GR22 | P0 | **Unique player faces/bodies/hair/beards/accessories** | Partial | Real options match all previews/game views; proper face shape fit, inclusive natural palettes, elite player distinctness and persist |
| GR23 | P0 | **High-quality complete motion & VFX set** | Partial | Smooth run/dribble/pass/shot/tackle/fall/keeper dive/grip, all combo/super animations and transitions without geometric distortion |
| GR24 | P1 | **20–30 celebrations and 10–20 sad/crying reactions** | Missing | Distinct face/body motion, selectable eligibility, appropriately timed cancel/recovery and variation |
| GR25 | P1 | **Stadiums, crowd, pitch/weather makeover** | Partial | Up to 20 stadiums; grass/mud/wetness/rain/wind/tornado/lightning visuals, bounded physics and accessible effects |
| UX26 | P0 | **Mobile/desktop UX & complete interactive control help** | Partial | 5 clean menu categories, better input rebinding, visible combo tutorial/practice, large touch targets, gamepad focus, Back/pause, accessibility |
| UX27 | P1 | **Reliable saves, performance and device quality** | Partial | Reload persistence, safe legacy migration, graphics-quality/FPS options, browser/physical Android/iOS/gamepad testing |
| UX28 | P1 | **Career, tournaments and team-management depth** | Partial | Reliable substitution, manager transfers/training/progression, cups/leagues seasons/standings/fixtures, useful coaching tools |
| LAN29 | P0 | **LAN host/join and two-device lobby** | Missing | Host + discover/join (manual IP/code fallback as browser permissions demand), assign teams/controllers, recover UI gracefully |
| LAN30 | P0 | **LAN real-match netcode, recovery and QA** | Missing | Actual synchronized two-client 6v6 play with ownership, deterministic or authoritative snapshots, lag/drop/reconnect tests; no local-only mock called delivered |

Beyond these 30: internet matchmaking/rooms, multiplayer tournaments/career, regional cups, player/team/shot editors and mod imports, long-term roster research, true hardware/browser accessibility certification and classic frame-by-frame parity remain in the master plan. None are canceled by this shortlist.

## Canonical combo matrix — preserve the existing commands and extend only through nonconflicting grammar

| Possession/context | Input | Required behavior / status |
|---|---|---|
| Ball carried | Tap Pass | Short pass on release; existing, retain tests |
| Ball carried | Hold Pass then release | Long/high pass; existing, retain tests |
| Ball carried | Pass with direction | Teammate selection in aimed direction, improved ranking; existing but requires actual-match latency and targeting QA |
| Ball carried then airborne | Jump then Pass | Cross **only** after Jump-first; reverse/simultaneous is NOT a cross (newer spec) |
| Ball carried | Tap Shoot / hold Shoot | Regular vs charged shot; existing, tap/hold reliability QA |
| Ball carried | One Jump then Shoot | Elevated ordinary shot, NOT transformed Super Shot |
| Ball carried | Double Jump then Shoot | Transformed Super Shot if shot-specialist; otherwise stronger ordinary |
| Ball carried | Tap Dribble / double tap Dribble | Normal dribble / eligible trick when enabled; new distinctive tricks still missing |
| Ball carried | Hold Dribble >=0.26 s then Jump | Stationary ball lift, player does not jump |
| Loose aerial ball in reach | Jump then one Dribble | Normal bicycle |
| Loose aerial ball in reach | Jump then double tap Dribble (within 0.32 s) | Super Bicycle, transformed for shot-specialist, boosted normal otherwise |
| Loose aerial ball in reach | Jump then one Shoot | Normal Header |
| Loose aerial ball in reach | Jump then double tap Shoot (within 0.32 s) | Super Header, transformed for shot-specialist |
| Ball carried | Hold Jump + direction | Run/sprint while staying grounded |
| Without ball | Tap Dribble | Manual player switch; auto-switch separately |
| Without ball | Shoot | Slide tackle; bounded travel and recovery |
| Without ball | Tap Pass / hold Pass | Tackle / chase |
| Without ball | Jump / hold Jump + Pass | Sprint / fast chase + auto tackle on contact (regression confirmation outstanding) |

**Conflict priorities:** Completed release beats held chord; reserve Jump-first aerial cross and super actions before new trick commands; cancel on blur/pointercancel and possession loss; hold and double-tap timers must never create duplicate moves. No fifth action button and no mandatory simultaneous five-finger phone gesture. Add accessible on-screen Help showing which moves a selected player's attributes permit. Source: [Super Attack contract](SUPER_ATTACK_SEQUENCE_SPEC_v08221.md), [Input balance](INPUT_AND_SUPER_BICYCLE_BALANCE_SPEC_v08211.md), [Control priorities (historical)](CONTROL_COMBO_PRIORITY_SPEC_v08171.md).

## Revised next five small iterations — owner priority
1. **SHOT PATHS:** Characterize existing zigzag and curve in live engine; add **one** distinctive, controllable zigzag or double-bend profile with visual trail and mirror/interception/keeper/ball-reset tests. Claim `gameplay-engine` and `graphics-renderer` only if editing shared visual runtime; otherwise split code batches.
2. **GRAPHICS QUALITY:** Advance opt-in modular C01→C02 with one owner-approved eight-view head/body/motion sample and visual before/after; fix distortion, beard/face clipping and proportions under graphics ownership. Preserve normal fallback. Incorporate one touch/desktop UI preview enhancement if separately owned.
3. **SUPER DEFENSE:** Deliver one first Star/DF spinning defense **behind a feature flag**, full cooldown/fatigue/counter/collision test and visual feedback; avoid cross-scope claims. Document the high-fatigue GK variant separately.
4. **TRICKS + CONTROLS:** Deliver one visually readable ball-carrier trick behind a flag; wire only a safe double-Dribble grammar after testing existing Jump/Dribble, Shoot and Pass hold/chords on keyboard, gamepad and simulated touch; improve context Help and cancellation.
5. **LAN MVP:** Build LAN lobby host/join **and an actual minimal two-client synchronized movement-and-ball exercise**, documented network authority and input ownership, lag/packet-loss/reconnect acceptance; do not call this a complete LAN match. Ensure the existing single-device game remains unaffected.

**Following five:** extend the Super Defense wall catalog, shot shapes and effects, trick catalog, Career/league content, authored graphics teams and production-grade two-client full matches with performance tests. Each future session must recheck active claims/current head and release gates; plans do not establish ownership.

## Independent QA and status discipline
- Documentation-only planning here does not mean any new gameplay/graphics/LAN feature shipped.
- All new code must run target Node tests, About revision tests, complete modular regression and desktop/simulated-touch Chromium on **same integrated SHA**; verify Pages HTML/assets post-merge; never force push.
- Owner visuals require human review plus eight-direction/contact-sheet checks. A passing automated pose hash does **not** establish artistic quality.
- LAN needs two actual independent clients, repeated interactions, state consistency, loss/reconnect and player-ownership security; not merely a lobby mock.
- Update the historical 218-item matrix only after evidence-driven row-by-row re-audit; its 41 Done / 120 Partial / 57 Missing counts are historic labels, not current exact counts.
