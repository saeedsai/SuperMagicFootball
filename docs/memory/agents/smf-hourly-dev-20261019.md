# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-30

## Mission
Only existing `dev` branch; no new branches, force-push, manual main writes or CI/security bypass. Preserve 223 teams/2676 players, 12-person squads, six formations, Pass/Shoot/Dribble/Jump, ten Career/Cup slots, SD09, LAN/P2P, offline and save compatibility.

## Current checkpoint
- **0.12.12.0 HIDE-BALL-PASS-01:** A defender's close (<=70), forward-facing, grounded and still-active ordinary PASS poke (`action='punch'`) counters a Hide Ball cast. Expired, airborne, backwards, distant, idle and SHOOT-slide actions do not; unrelated Freeze unaffected. Caster still pays six-second cooldown and 0.035 fatigue. No new input or save schema. Added `tests/hide_ball_pass_counter.test.cjs`.
- Prior **0.12.11.0** Studio Jumping preview: all 15 attributes and shared jump metrics. Prior **0.12.10.0** Breath foot-ring, walk recovery and Breath-driven dribble. Prior **0.12.9.0** Career Energy/Breath.
- LAN-094 automated two-client coverage exists; physical two-phone acceptance **unverified** (#48). Do not resume routine LAN work. Render commit-trigger auto-deploy drift (#86) and main protection (#87) remain open.

## Next smallest action
1. Obtain exact-head four Node, four Chromium and Modular QA; fix genuine failures, preserve required checks.
2. Validate Hide Ball PASS counter against actual phone controls and AI timing; inspect on-device Studio Jumping preview.
3. Improve eight-view authored directional graphics and fix side orientation (#15).
4. Advance goalkeeper penalty control (#5) or Career progression in one bounded tested increment.
5. Promote only green exact `dev` through protected main pipeline and verify Pages hosted bytes; never certify physical LAN without two phones.

## Ownership and exclusions
Sole authorized maintainer. Historical locks are nonblocking. Do not read/edit other agents' private memory. Never close #48 without physical evidence.

## Evidence
- Starting heads: `dev` aabb56651ccfb322096e6aa92548defb4bdd52e7, `main` e8c07652f66071ec2da5370127966475f2f0df45; 70 ahead, 0 behind.
- Actual gameplay method extracted and executed with V8: 14/14 focused checks passed (counter, cooldown/fatigue, negative timings/angles, unrelated spell, rejection and syntax).
- Local git remote DNS failed (`Could not resolve host: github.com`); GitHub connector works. Combined status empty and PR-filtered workflow query returned no runs at prior head; neither certifies full CI. Full Node/Chromium/Modular, main promotion, Pages byte verification and physical LAN not verified.

## Cleanup
Keep checkpoint <4 KiB, shared memory <6 KiB. Git history and development log hold prior details.
