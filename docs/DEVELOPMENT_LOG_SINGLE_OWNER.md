# SuperMagicFootball — centralized development log

**Effective:** 2026-10-20 | **Ongoing development owner:** `smf-hourly-dev-20261019`

## Single-developer migration
Owner explicitly directed consolidation of previously separate game-feature and agent ownership. The mandatory exclusive-lock workflow is retired in `AGENTS.md`, memory rules and `docs/agent_coordination/README.md`; registry/old records are retained for historical audit. Active audio-feedback sign-off and touch-dribble claims were retired as reservations only, without claiming completed source or editing their previous owners' private memories. No force pushes, security bypasses or weakening of CI/Pages quality gates are authorized.

## Latest completed gameplay baseline
UI Back paths and dev banner fixes, SH01 Books/Serpent zigzag physics, original roster and four-action controls are preserved. The previously certified green full census at `e472a6164b486894cc0e657666a78b826205d780` preceded the policy migration. Subsequent code requires a fresh exact-SHA 4+4 census.

## Current release workflow
- Fetch live `dev` and `main` Git SHAs, source blob SHA, current issues and green/red exact-SHA Actions.
- Implement one small production feature + tests + documentation.
- Fix actual regression failures, verify successful automatic promotion, then Pages and hosted smoke.
- Record passing totals only when observed.

## Next five feature increments
1. FIX-TOUCH-DRIBBLE: resolve missed queued DRIBBLE tap/held second press, with keyboard/touch regression.
2. SAVE-101: ten persistent independent Career save slots, legacy compatibility.
3. SAVE-102: ten Cup/Tournament save slots.
4. SD09: counterable Super Defense with visual and cooldown balance.
5. TR14: four-button Tricks and defensive counterplay.

The [30-feature](OWNER_PRIORITY_FEATURE_AUDIT_20261019.md) and [15-addition](OWNER_UI_ART_SAVES_VERSION_BACKLOG_20261020.md) owner priorities remain active; this log does not mark unfinished tasks done.
