# Gameplay development — this chat's checkpoint

**Agent ID:** `gameplay-review-20261016`  
**Updated:** 2026-10-17

## Mission

Improve playable SuperMagicFootball mechanics in small, exclusive, current-`dev` batches. Protect four buttons, six formations, keeper parity, player IDs, career saves, graphics and concurrent agents' scopes. Read AGENTS and live locks at every resume; never access another chat memory.

## Current checkpoint

**New real feature shipped:** a CPU manager in single-player now adapts to the first-half score at the actual halftime boundary. **Trailing:** Direct attack + High Press. **Leading:** Possession + Deep Block. **Tied:** no change. Disabled for two-human Versus/training and outside halftime. Uses existing `applyPlan` with no personnel/substitution/formation or persisted preset changes, emits `cpuTacticalShift`.

**Source:** [engine `6b154814`](https://github.com/saeedsai/SuperMagicFootball/commit/6b154814c0b993f2b0c80678e8468b599390fa1a), [10 Node tests `070dd84d`](https://github.com/saeedsai/SuperMagicFootball/commit/070dd84d1cab791bfe428a41d5614e983b4148d5), [real desktop/touch Chromium `e7e244a2`](https://github.com/saeedsai/SuperMagicFootball/commit/e7e244a2d1ce6467f7e54a664daa0d41eadd4d22), [own Node test expectation correction `6c89d15b`](https://github.com/saeedsai/SuperMagicFootball/commit/6c89d15be695701554767376a656c8760941b595), [specialist handover](../../GAMEPLAY_CPU_HALFTIME_TACTICS_20261017.md), [roadmap](../../NEXT_MILESTONES.md).

Prior shipped: human two-player manual penalty GK and read-only career opponent scouting; their details in earlier specialist handovers. No duplicate files and no old task replay.

## Next smallest action

Refresh live `dev`, claims and **this** memory only. Read [Full Census #39025336514](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025336514) (preflight PASS and 4/4 Node shards PASS; Chromium pending last check) and specifically `tests/cpu_halftime_tactical_response_browser_qa.py` desktop/touch script result. If it fails, take/reaffirm exclusive gameplay-engine claim and fix only relevant code/test. Verify successful GitHub Pages deployment on a descendant and hosted phone/PC smoke, not just previous production URL. If green, close handover, release claim, then take next small feature.

## Ownership and exclusions

Active gameplay engine claim (until handover): `gameplay-review-20261017-gpt6-cpu-halftime-r6`; exact `src/modules/engine.js` halftime method plus dedicated tests and docs only. No UI, audio, graphics, CI, roster, service worker, global shared memory or other agents' files. In-game About uses automatic current online GitHub `dev` SHA per commit and stable human-readable bundle `0.8.25.32-integrated`.

## Evidence

- [Modular QA #39025286524](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025286524): **242/242 Node PASS**, 0 FAIL after correcting our mismatched leading/trailing test; C01 collar graphics tests separately reconciled by art owner.
- [Full Census #39025336514](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025336514): preflight + 4/4 Node shards PASS, Chromium pending. Do not invent browser PASS.
- Public game https://saeedsai.github.io/SuperMagicFootball/; previous Pages green, but newest gameplay commit live hosting and physical Android/iOS not yet certified.

## Cleanup

No deletion without dependency audit; preserve historical tests, modular concept artwork and data. Replace this file each checkpoint; keep below 4 KB.
