# Cusco FC rating source audit — partial (11 mapped players)

**Audit date:** 2026-11-02  
**Scope:** Audit only the eleven `cont_conmebol_23` ledger rows with explicit FC27 source-player IDs. EA's official [Cusco FC FC27 team ratings page](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/teams-ratings/cusco-fc/112659) lists the eleven same-name players below. Their linked individual FC27 pages confirm the IDs and profile positions. The ledger's twelfth player, Rodolfo Anderson, has no FC27 source-player ID; the official Cusco team page does not list him. His separate ledger URL points to Starting11, which does not establish an EA stable ID. This is the exact blocker to a complete 12-player batch. No substitute was selected and no roster, game, ledger, tier, or shared-index data was edited.

## Mapped identities and position comparison

| Ledger player | Ledger position → EA primary | EA FC27 source ID / profile |
|---|---|---|
| Pedro Díaz | GK → GK | 259780 — [EA profile](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/pedro-diaz/259780) |
| Aldair Fuentes | DF → CB | 253602 — [EA profile](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/aldair-fuentes/253602) |
| Alvaro Ampuero | DF → LB | 213311 — [EA profile](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/alvaro-ampuero/213311) |
| Carlo Diez | DF → CDM **(mismatch)** | 254184 — [EA profile](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/carlo-diez/254184) |
| Iván Colman | MF → CAM | 225590 — [EA profile](https://www.ea.com/pt-br/games/ea-sports-fc/ratings/player-ratings/ivan-colman/225590) |
| Diego Soto | MF → CM | 261970 — [EA profile](https://careers.ea.com/es/games/ea-sports-fc/ratings/player-ratings/diego-soto/261970) |
| Nicolás Silva | MF → RM | 232517 — [EA profile](https://www.ea.com/pt-br/games/ea-sports-fc/ratings/player-ratings/nicolas-silva/232517) |
| José Bolívar | MF → LB **(mismatch)** | 265446 — [EA profile](https://careers.ea.com/es/games/ea-sports-fc/ratings/player-ratings/jose-bolivar/265446) |
| Facundo Callejo | FW → ST | 215356 — [EA profile](https://www.ea.com/es-mx/games/ea-sports-fc/ratings/player-ratings/facundo-callejo/215356) |
| Lucas Colitto | FW → LM **(mismatch)** | 223842 — [EA profile](https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lucas-colitto/223842) |
| Juan Manuel Tévez | FW → ST | 224161 — [EA profile](https://www.ea.com/pt-br/games/ea-sports-fc/ratings/player-ratings/juan-manuel-tevez/224161) |
| Rodolfo Anderson | GK → no Cusco FC match located | **No explicit FC27 source-player ID in ledger.** No ID inferred or substituted. |

The official team list confirms the eleven mapped names and shows Rodolfo Anderson is absent from its FC27 Cusco roster. EA's Peru ratings search does contain a Rodolfo Anderson goalkeeper profile, but it does not connect that profile to Cusco FC; it is insufficient evidence to populate the missing ledger ID. The row remains unresolved. Three of the eleven mapped identities have broad-position mismatches (Carlo Diez, José Bolívar and Lucas Colitto); these are documented without changing roster assignments.

## Canonical-field coverage for the mapped subset only

Canonical fields follow `data/mechanics/gameplay.json` → `positionOverallStats`. Only a directly matching individual EA attribute label counts. EA summaries (Pace, Passing, Dribbling, Defending, Physicality) do not count; GK Reflexes does not count as `gkSkill`, Finishing does not count as `shootAccuracy`, and Heading Accuracy does not count as `heading`. No conversion or OVR formula is inferred. For this partial report, a direct leaf is counted only for a mapped player's stored broad position. The denominator is **11 mapped players × 6 fields = 66**; Rodolfo Anderson contributes no observations and is not included.

| Stored group | Mapped players | Direct / unresolved fields |
|---|---:|---:|
| GK | 1 | 4 / 2 |
| DF | 3 | 9 / 9 |
| MF | 4 | 16 / 8 |
| FW | 3 | 9 / 9 |
| **Mapped subset** | **11** | **38 / 28 of 66** |

For the 11 mapped players, the position canonical fields directly observed were: GK `gkDiving`, `agility`, `strength`, `stamina`; DF `strength`, `aggression`, `stamina`; MF `crossing`, the individual Dribbling leaf, `agility`, `stamina`; FW `shootPower`, the individual Dribbling leaf, `agility`. The other 28 of those 66 canonical leaves were unresolved under the matching rule above. The 12-player full-batch denominator would be 72, but no 12-player aggregate is reported because Rodolfo Anderson lacks an EA source ID and matching profile evidence.

## Validation and blocker

- Ledger membership: 12 rows for `cont_conmebol_23`; 11 explicit, unique numeric FC27 IDs and one blank source ID (`cont_conmebol_23_11`, Rodolfo Anderson).
- Official roster cross-check: 11 mapped names appear in the EA Cusco FC team list; Rodolfo Anderson does not.
- Position check: 8/11 broad-position matches; 3 mismatches (Carlo Diez DF→CDM; José Bolívar MF→LB; Lucas Colitto FW→LM).
- Partial field accounting: 38 direct + 28 unresolved = 66; 12th player's six fields excluded, not imputed.
- Blocker: the ledger has no stable FC27 source-player ID for Rodolfo Anderson and the official Cusco FC FC27 roster/profile evidence does not resolve his identity. A complete 12-player source audit requires a team-confirmed stable ID; no replacement is justified.
- Source-ledger SHA-256 before: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Source-ledger SHA-256 after: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1`.
- Changed file: this partial dated report only.
