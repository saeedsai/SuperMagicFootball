# Arcade Shot Trial — 2 November 2026

## Player-facing change

Match Setup now includes an optional **Arcade Shot Trial** for local Quick Match, two-player Versus, and Training Arena. Choose a catalog Super Shot, select a home-team midfielder or forward who is in the starting lineup, and preview the ball transformation before kickoff. The selected player uses the existing Jump/Shoot Super Shot action path.

The trial applies only to the temporary roster copy used by that match. It does not edit player identity, attributes, saved equipment, Career or Cup records, Player Studio choices, or online/LAN games. The opponent and other players keep their existing loadouts. Persistent ability equipment remains subject to verified-tier and role rules.

## Validation

- Focused Node regression: **5/5** across runtime clone isolation, selected starting player/shot injection, existing Super Shot activation, rejected modes/inputs, and UI accessibility/scope contracts. A bench player cannot be selected, preventing a trial that is unavailable at kickoff.
- Full local `npm run test:node`: **1,750/1,750**; required club fixture passed for 32 clubs and 384 player slots.
- `python scripts/validate_data.py` passed: 223 teams, 2,676 players, 84 avatar presets, zero errors.
- Chromium browser QA passed on desktop and simulated touch: opened Match Setup, used the native keyboard-accessible shot and player selectors, checked the live preview label, kicked off and confirmed the selected match-copy player held Silver Carp at level 1.
- `node --check` passed for `src/modules/engine.js` and `src/modules/ui.js`.
- `git diff --check` passed; Git reported only the repository's existing LF/CRLF normalization warnings.

This does not establish physical-device acceptance, online loadout support, owner visual approval, hosted deployment, or gameplay balance approval. The trial is intentionally local and temporary.
