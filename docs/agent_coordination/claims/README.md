# Live feature locks

One JSON file per exclusive lock key (e.g. `graphics-renderer.json` or `roster-club-cont_uefa_1.json`).

**Do not treat this README as an ownership record.** Inspect the current directory on the GitHub `dev` branch. An agent must claim its key before editing; consult [the protocol](../README.md). Existing agents active before 2026-10-16 may not yet have enrolled.

Active lock fields: `schema`, `lock_key`, `feature_id`, `owner`, `scope`, `status`, `claimed_at`, `heartbeat_at`, `expires_at`, `base_dev_sha`, `issue_url`. Released locks additionally have `outcome`, `released_at` and `handover`. All timestamps are UTC. Do not edit another owner's active lock.
