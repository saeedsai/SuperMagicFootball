# Canonical player identity specification — v0.8.20.6

## Core definitions
`player.id` is the persistent **roster/save slot ID** and must never be overwritten by a new real-world identity. `player.canonicalId` is an additional optional reference that exists only if `rosterVerification === 'verified_club_role'`, the name is not a placeholder, and the date of birth is valid. The canonical format is `person:<normalized full name>:YYYY-MM-DD`. E.g. `person:son-heung-min:1992-07-08`. Never infer DOB or person equivalence from name alone.

Normalization removes accents, collapses spacing/hyphenation and case. Identical verified name+DOB may group; identical names with incompatible verified DOB must be escalated, not silently merged. No guesswork for unverifiable aliases or same-name national/club rows. `rosterFor` returns copied players with optional canonicalId, leaving source records untouched.

## Identity validation
1. Retain 216 teams × 12 player slots and every roster save ID.
2. Valid, verified name plus DOB gives a repeatable canonical reference (99 currently).
3. Fictional Academy Prospect placeholders never receive global person IDs; any repeated names are independent game characters.
4. Compare normalized same-name collision groups for **possible** identity matches, but require independent source verification before merging national-team copies.
5. Audit conflicting roles as candidate differences. Players may have multiple legitimate positions; a role conflict alone is not sufficient proof of a data error.
6. Do not use canonical population caps for Superstar / Star yet; source and rating coverage are too incomplete. Preserve all existing stats, market values and art as unverified unless explicitly certified.

## Current evidence (October 14, 2026)
- 2,592 roster slots; 99 verified unique person IDs; 2,493 club/role unverified.
- 141 normalized same-name collision groups. Of the 28 role-disagreement groups, 25 are non-placeholder and 3 are repeated fictional Academy Prospect labels. No bulk role rewriting or merging occurred.
- 134 same-name groups contain at least one unverified person association; they are review candidates only.
- LAFC: Son GK → FW, Thomas Hasal added in an Academy FW slot as GK, Hugo Lloris retains GK; squad 2GK/3DF/4MF/3FW and 12 unique shirts retained. Two unrelated fictional shirt numbers were reallocated **as gameplay placeholders**, not asserted as real registrations.

## Regressions
`tests/v08206_canonical_identity.mjs`, `tests/v08206_lafc_roles.mjs`, `tests/v08206_identity_audit.mjs`, `tests/v08206_identity_browser_qa.py`, `tests/v08206_roster_inventory.mjs`, `tests/master_contracts.mjs`. Check old save/player IDs, GK-first valid lineups and nonmutating OVR/tactics.

## Future canonical migration
A later milestone may support verified source-backed aliases and explicit club/nation membership links, but must preserve older save IDs, repair incorrect role assignments only with evidence, and test when two people share a name. BPW variants will carry a variant-of reference without forcing identical stats.
