# Supermagic Football — 2026 Squad Audit Reconciliation (v0.8.9)

**Status:** reviewed and staged; **NO roster changes applied** in this release, per request. User-provided CSVs are an audit input, not ground truth for automatic edits. All three attachments were read and the rows counted, classified and reconciled into `ROSTER_RECONCILIATION_QUEUE_v089.csv`. Source URLs inside the CSVs have **not been rechecked live** in this milestone. Store the source date before future changes.

| Input CSV | Rows | Main content |
|---|---:|---|
| `Supermagic_2026_Audit_Faults_and_Gaps.csv` | **9,736** | Missing physical data; generated faces; placeholders; role, age and rating conflicts |
| `Supermagic_2026_Missing_Players_To_Add.csv` | **296** | 16 featured clubs; 113 candidates called critical, 183 medium |
| `Supermagic_2026_Named_Players_Verification_and_Correction.csv` | **806** | Player-level positions, ratings, valuations and historical/modern references |

## Key findings

- **1,642** `FICTIONAL_PLACEHOLDER` flags in the supplied audit (different sampling scope from the prior all-game count of 1,786). These are not necessarily distinct from other issue rows. Do **not** add issue counts together as player counts.
- **167 proposed position corrections** have source URLs; **121** are marked modern verified mismatches and **46** historic. Their source dates and broad-role mappings still require review. Examples: Pedri currently GK → MF; Harry Kane MF → FW; Arda Güler DF → MF; Haaland MF → FW. This is a *priority defect queue*, not proof every cited role is up to date.
- **127** same-player age conflicts and **55** cross-roster overall-rating spreads ≥8. Normalize players by canonical identity to prevent the same person's age, base ability and caricature varying without explanation.
- **40** EA-style overall alignment flags, **13** market-value discrepancy flags, and **36** possible club membership departures. Store source valuation and game economy as separate fields.
- **2,364** missing-height warnings and **2,364** generated appearance warnings; these overlap substantially. Do not infer real skin tone, eye color, ethnicity, or height from a name or nationality. Human visual verification required where reliable reference images can be used.
- **296 candidate additions** from 16 featured clubs cannot all fit into fixed 12-player rosters; some clubs have **zero vacant slots**. Rank starters and significant players per team; record who is omitted and why. A suggested player can also be transferred, loaned, or outdated, so confirm membership against the current source.
- **384** modern-national selection warnings cannot be resolved by club roster sources alone; compare the most relevant dated federation selections.

## Staged review queue

The `ROSTER_RECONCILIATION_QUEUE_v089.csv` contains **734 actions**. It is intentionally **review-only**: no game ID, rating, role, color, appearance or squad slot is changed.

| Queue category | Count | Next action |
|---|---:|---|
| Position reviews | 167 | Confirm source, fix broad position, reassign on-field slot |
| Candidate additions | 296 | Confirm present-day membership, replace selected placeholder |
| Same-player ages | 127 | Canonical DOB and identity registry |
| Cross-team overall consistency | 55 | Shared base attributes; contextual modifiers separately |
| Potential club departures | 36 | Check official club roster/transfer history |
| Overall reference alignment | 40 | EA-style reference stored separately from game balance |
| Market-value reference alignment | 13 | Dated EUR market value; keep career buy price separate |

**Release gate for future roster milestone:** select one small club/national cohort, resolve documented defects with reliable dated references, check GK/DF/MF/FW ratio and unique identities, migrate saves, validate stat influence, then rerun all gameplay/browser regressions. Preserve edit history.
