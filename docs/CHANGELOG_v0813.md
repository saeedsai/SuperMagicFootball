# Supermagic Football v0.8.13 — Roster corrections phase 1

- Normalized 216 teams/2592 player records to the requested 2/3/4/3 role mix.
- Modern featured-team shortlist priority: notable first-team players and high-profile stars chosen ahead of generic academy substitutes, subject to positional roles. Source provenance retained.
- Corrected erroneous broad-position examples (e.g., outfield players misclassified as goalkeepers) and preserved arcade Japan slot/ability identity.
- Added `src/roster_corrections.js`, with stable IDs where retained and additive team-prefixed IDs for new records.
- Added full corrected roster CSV, pending verification list, per-team coverage metrics and detailed change log.
- Enhanced standalone build pipeline to bundle offline roster corrections with no network call.
- Corrected default six-player 2-1-2 lineup from a midfielder occupying a forward position to **GK/DF/DF/MF/FW/FW** on modern/continental teams; preserves 1993 Japan original starter indexes and user-customized plans. No changes to match physics or input system; known unverified rosters remain open.
