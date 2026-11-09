# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Existing dev only. Preserve 223 teams/2676 players, six formations, exactly Pass/Shoot/Dribble/Jump, offline saves, ten Career/Cup slots, SD09. No routine LAN/P2P.

## Current checkpoint
- Fixed malformed double-escaped halo regex in `tests/breath_render_guard_contract.test.cjs` (`35882cd1`); JavaScript regex compilation and matching against fetched production renderer verified in connector runtime. Full Node execution NOT verified.
- Read AGENTS, version policy, shared/memory protocol, own checkpoint, roadmap, renderer and browser regression. Candidate stays 0.12.81.67 because this is test-only.
- Local Git checkout confirmed blocked by github.com DNS. Four Node/four Chromium shards, Modular QA, protected promotion and hosted Pages verification unverified.
- Open #48 physical two-phone acceptance, #86 Render commit-trigger drift, #87 missing GitHub-enforced main protection.

## Next smallest action
1. Run focused Node Breath tests including new halo assertion.
2. Run desktop/touch Chromium local-selection regression on playable match.
3. Run four Node/four Chromium shards and Modular QA on exact dev head.
4. Fix failures and enforce main protection before release; verify hosted bytes.
5. Advance Player Studio, counterable four-button Tricks, existing eight-view art, goalkeeper and Career.

## Ownership and exclusions
Own checkpoint only; no new branches, main writes, force-push, other agents' memory or unverified release claims.

## Evidence
GitHub accepted regex repair commit; isolated JavaScript regex match against actual render.js passed. No Node/Chromium suite pass, promotion or deployment claimed.

## Cleanup
Keep physical device certification open until real two-phone evidence.
