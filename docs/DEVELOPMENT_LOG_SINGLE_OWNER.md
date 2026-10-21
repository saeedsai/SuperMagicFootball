# SuperMagicFootball — centralized development log

**Effective:** 2026-10-20 | **Ongoing development owner:** `smf-hourly-dev-20261019`

## Single-developer migration
Owner explicitly directed consolidation of previously separate game-feature and agent ownership. The mandatory exclusive-lock workflow is retired in `AGENTS.md`, memory rules and `docs/agent_coordination/README.md`; registry/old records are retained for historical audit. Active audio-feedback sign-off and touch-dribble claims were retired as reservations only, without claiming completed source or editing their previous owners' private memories. No force pushes, security bypasses or weakening of CI/Pages quality gates are authorized.

## Latest completed gameplay baseline
UI Back paths and dev banner fixes, SH01 Books/Serpent zigzag physics, original roster and four-action controls are preserved. The previously certified green full census at `e472a6164b486894cc0e657666a78b826205d780` preceded the policy migration. Subsequent code requires a fresh exact-SHA 4+4 census.

## 2026-10-20 touch-dribble source increment
- Fixed a swallowed second rapid DRIBBLE touch press in `src/modules/input.js` (commit `61732fee50db`); added three focused edge/cancel/release regressions in `tests/touch_dribble_pulse.test.cjs` (commit `506fe32b36e0`).
- Source-level Modular Game Dev QA [#39504673228](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39504673228) PASSED. Full Regression Census and green promotion at the final handover SHA remain to be independently confirmed.
- See [touch-dribble handover](TOUCH_DRIBBLE_TAP_HOLD_20261020.md). This does NOT claim an Android physical-device verification.

## Current release workflow
- Fetch live `dev` and `main` Git SHAs, source blob SHA, current issues and green/red exact-SHA Actions.
- Implement one small production feature + tests + documentation.
- Fix actual regression failures, verify successful automatic promotion, then Pages and hosted smoke.
- Record passing totals only when observed.

## Next five feature increments
1. SAVE-101: ten persistent independent Career save slots, legacy compatibility.
2. SAVE-102: ten Cup/Tournament save slots.
3. SD09: counterable Super Defense with visual and cooldown balance.
4. TR14: four-button Tricks and defensive counterplay.
5. LAN29: genuine two-client LAN match prototype.

The [30-feature](OWNER_PRIORITY_FEATURE_AUDIT_20261019.md) and [15-addition](OWNER_UI_ART_SAVES_VERSION_BACKLOG_20261020.md) owner priorities remain active; this log does not mark unfinished tasks done.

## 2026-10-21 Career save slots browser/Pages integration repair
- Failure baseline `08cc725b9e107a9ceab0ea6938e14b83bdf6809b`: Full Census [#39514001176](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39514001176) failed 88 Chromium scripts; Node shards passed 161/161. Concept Hero/Modular browser initialization also failed.
- Root cause: `src/modules/ui.js` imports `CAREER_SLOTS` but `scripts/build.py` omitted `career_slots.js` from the inherited inline test fixture, so browser game initialization lacked the symbol. `sw.js` also omitted it from the offline module cache.
- Fixed `scripts/build.py` in [`c1b1b238`](https://github.com/saeedsai/SuperMagicFootball/commit/c1b1b238d76d7651af321e604d608d4de24fcf25): correct module assembly order and fixture-only conversion of `export const CAREER_SLOTS` to `const CAREER_SLOTS`.
- Fixed `sw.js` in [`bf034340`](https://github.com/saeedsai/SuperMagicFootball/commit/bf034340bbf822e13aea7bbe51cb7f290a3e6afa): precache the new module and rotate the offline shell key.
- Added `tests/career_slots_fixture_contract.test.cjs` in [`e27a2835`](https://github.com/saeedsai/SuperMagicFootball/commit/e27a28352762b68050e826338a5561588f7283c4) to prevent this integration omission recurring.
- Source writes succeeded without bypassing security validation. Exact-head full 4+4 Node/Chromium CI, dev-to-main promotion and hosted Pages smoke must be rechecked after the last commit. Do not claim new release from earlier green CI.

### 2026-10-21 follow-up: restricted-origin Chromium initialization
- Exact old census [#39547678441](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39547678441): four Node shards passed; Chromium had repeated `Page.wait_for_function` timeouts despite passing real HTTP preview smoke. Root cause: `src/modules/ui.js` evaluated `localStorage` as an argument to `CAREER_SLOTS.create` before the module's internal error handling could run. Opaque-origin `about:blank` fixtures deny property access and throw `SecurityError`, aborting initialization.
- Fixed the access with a guarded storage adapter in [`b860ba17`](https://github.com/saeedsai/SuperMagicFootball/commit/b860ba17bdf450ff4a3df74bee62189e5bdafefd). Normal HTTPS uses real persistent storage; denied storage does not silently accept writes. Updated Career source-contract test in `e8bd6abd`, and added a restricted-origin integration contract in `445fe03d`.
- This is not evidence that all Chromium gameplay tests pass. Wait for full exact-head 4+4 Census and hosted smoke before releasing. No force push or safety bypass.

## 2026-10-21 SD09 spinning-bumper opt-in gameplay prototype
- **Verified production baseline prior to edit:** `dev` and `main` both `3705c92ffcb21c2c9c78bd33a9b2768a26d1fdba`. Development Full Census [#39551972569](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39551972569) passed preflight, all 4 Node and 4 Chromium shards, preview and automatic promotion. Main Full Census [#39552365252](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39552365252) passed the same 4+4 plus hosted Pages smoke. Pages deployment [#39552365389](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39552365389) passed. This **certifies the previous Career-save release**, not the new SD09 work.
- **New gameplay:** added `defensiveAbilities.spinBumper` with 116-unit pulse radius, 48-unit radial push, max .72-second stagger, 11-second cooldown, high fatigue, jump/dash/invulnerability counterplay and level-3 DF/equipped-only gating. Existing teams, roster assignment, attacks, controls and saves unchanged. Actual engine method extended; no separate fifth button. Not yet equipped or Player Studio-selectable, so **SD09 remains partial opt-in prototype**.
- Added `tests/spinning_bumper_defence.test.cjs` for extracted live-method Node scenarios (both sides, cooldown/fatigue/ball drop, evasion, tier/role) and `tests/spinning_bumper_browser_qa.py` for real game Chromium desktop and simulated touch replay. Offline game cache rotated; Career cache contract relaxed to accept future legitimate suffixes.
- See [feature scope and acceptance](SPINNING_BUMPER_SD09_20261021.md) and [five-iteration plan](NEXT_MILESTONES.md). Latest `dev` SD09 commit must complete 4+4 CI, automatic `main` promotion, and independent main/Pages verification; no earlier passing checks substitute. Await full results and fix only observed defects. No force pushes or bypasses.
