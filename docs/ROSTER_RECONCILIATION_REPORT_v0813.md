# Supermagic Football — v0.8.13 Roster Reconciliation Report

Date: 13 October 2026. Based on v0.8.12, user-supplied audit files, and a small number of checked 2026/27 primary club roster pages. **This is a playable roster-shape / priority-selection correction, not verified worldwide football licensing or complete first-team data.**

## Shipped scope

- All **216** original selectable teams preserved (13 arcade, 32 modern national, 32 featured clubs, 6 legend-era, plus continental clubs).
- **2,592** in-game roster records: exactly **12 per team**, with **2 GK, 3 DF, 4 MF and 3 FW** per team.
- Ordinary teams' first six slots follow GK / DF / DF / MF / MF / FW and use preferentially selected named-player shortlists. Japan's classic side retains original slot and player-ID order for legacy special-move compatibility; its saved default XI still contains a goalkeeper and striker.
- **Existing player IDs kept when the same source player is retained**; supplementary players have stable team-prefixed IDs. No changes to football movement, stats formulas, kit colors or named super-shot definitions.
- **648** audit-diff records captured in `ROSTER_CORRECTION_CHANGES_v0813.csv`, including 344 position changes, 124 new named picks, and 152 players removed from the 12-place shortlist.
- **224** proposed player additions remain in a pending review queue instead of being accepted as verified club membership. The reviewed suggestions include possible misleading transfers.
- **816** roster entries carry non-fictional names, **1776** entries remain fictional/academy placeholders (role-correct, not actual footballer identities). The named entries include explicitly labeled editorial or audit-derived suggestions that require further verification.

## Source provenance and limitations

1. User-provided `Supermagic_2026_Audit_Faults_and_Gaps.csv`, `Supermagic_2026_Missing_Players_To_Add.csv`, and `Supermagic_2026_Named_Players_Verification_and_Correction.csv` contain position proposals and candidate names, but **some source URLs refer to different players or outdated transfers**. An audit label alone is not a guarantee of correctness.
2. Confirmed 2026/27 AC Milan first-team names and roles from https://www.acmilan.com/en/teams/men-first-team and https://www.uefa.com/uefaeuropaleague/clubs/50058--milan/squad/ .
3. Confirmed 2026/27 Barcelona first-team names and positions from https://www.fcbarcelona.com/en/football/first-team/squad/68906/alejandro-balde and related official squad pages. Additional selected names remain editorial.
4. Arsenal priority review includes David Raya, Ben White and Martin Ødegaard, also documented in https://www.reuters.com/sports/soccer/arsenal-manager-mikel-arteta-extends-contract-until-2030-2026-10-07/ .
5. Match roles `GK/DF/MF/FW` are broad game classifications; real-life dual-position players may be assigned an acceptable wing/midfield position to preserve the requested roster structure. This is not an individualized verified scouting taxonomy.
6. Synthetic player ratings and values are **game balance estimates**, not EA FC 27 or Transfermarkt figures. Personality, height, skin tone and hair should not be inferred from nationality or name.
7. Six historical legendary teams were **not** replaced by the seven planned BPW teams in this release; that separate historical-copyright/roster project stays scheduled. Classic Japan's Kumon was classified MF to meet the requested slot quota, although his documented 1993 role is DF.
8. Saved user-customized `legend_edits` may intentionally override updated built-in team shortlists. These user edits are preserved rather than silently overwritten; reset/reconciliation UI remains a future requirement.

## Teams needing the most data work

| Team | Named (not necessarily verified) | Fictional | Actions |
|---|---:|---:|---:|
| AC Milan | 12 | 0 | 19 |
| Barcelona | 12 | 0 | 13 |
| Arsenal | 12 | 0 | 15 |
| Manchester City | 12 | 0 | 16 |
| Real Madrid | 12 | 0 | 14 |
| Paris Saint-Germain | 12 | 0 | 11 |
| Italy | 0 | 12 | 7 |
| Japan | 12 | 0 | 3 |
| Inter Miami | 5 | 7 | 7 |

## QA and acceptance

- `npm test` includes **24 Node test suites** (23 inherited plus a new 216-team roster reconciliation suite).
- **19 inherited Chromium browser scripts** run on desktop and simulated mobile, plus new roster-specific desktop/mobile checks, Player 2 control, cartoon identity, character art and fullscreen/save checks.
- The combined browser runner may reach tool execution time limits; each individual suite must be reported separately and not marked passed just because no failure appeared before timeout.
- Check primary-keeper default, standard six-person lineup and no player-ID/name duplication for every team.

Next: v0.8.14 goalkeeper input hardening as previously planned, followed by incremental verification of the 1776 remaining placeholders and user audit queue with official club/national squad evidence. The broader 2026 World Cup / 7 BPW squads / exclusive faces / more super shots remain separate backlog milestones.
