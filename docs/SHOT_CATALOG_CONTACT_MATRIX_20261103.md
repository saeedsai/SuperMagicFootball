# Full Super Shot player-contact matrix — 3 November 2026

## Coverage

The production game engine is checked for every catalog entry across both attacking directions and both target affiliations (friend and opponent): 32 shots × 2 directions × 2 affiliations = **128 real-engine contact cases**. Each confirmed hit must set temporary shot-impact weakness, stay within the stacking cap, start the bounded recovery timer and reduce the hit player's movement speed. Carp, Dolphin and Wave are sampled during their reachable surfaced phase; underground frames are not treated as failed contacts.

A companion check preserves the control distinction: a strong ordinary shot produces confused stun without launch, while a high-force Super Shot uses the existing launched/downed behavior.

## Validation

- `node --test tests/shot_catalog_player_contact_matrix.test.cjs`: **2/2 passed**, including all **128** Super Shot contact cases.
- Full local Node: **1,796/1,796 passed**, including the club fixture; data validation passes for **223 teams, 2,676 players, and 84 presets**.
- Four-shard Chromium census: **198/198 passed**, with zero failures, timeouts or errors. Per-shard output is archived at `docs/qa_runs_012590_final_20261103/`.

This is deterministic engine regression evidence, not human balance or physical-device acceptance. No shot tuning, player identity/stat edits, save changes or input changes were made.
