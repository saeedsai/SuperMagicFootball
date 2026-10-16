# SuperMagicFootball — mandatory instructions for every coding agent

**STOP before changing code, tests, player data, artwork, or plans.** This file applies to all development chats and agents working on `dev`. Read the [shared coordination protocol](docs/agent_coordination/README.md) and [feature registry](docs/agent_coordination/FEATURE_REGISTRY.json) **before** choosing a task. Re-read the live GitHub files every session; cached conversation context is not a reservation.

## Mandatory low-context memory bootstrap

Before loading specialist plans or old chat history, read **[memory instructions](docs/memory/README.md)** and **[shared project memory](docs/memory/SHARED.md)**, then **only your own** `docs/memory/agents/<agent-id>.md` file (register a unique ID if your chat is missing). Do **not** open, search, summarize, or edit another chat's memory. Check live feature locks and latest `dev` separately; memory never establishes ownership or real-time state. At each checkpoint, replace stale notes in your own file with a short current handover, preserve links to evidence, and avoid loading previous transcripts.

**Limit:** GitHub repository permissions do not isolate files per ChatGPT chat. The own-file rule is cooperative, not an access-control guarantee; shared memory must contain no secrets. Existing chats must be explicitly told to adopt this process at their next message. For hard privacy, separate repositories or credential-scoped storage are required.

## Mandatory start gate

1. Fetch the **latest** `dev` HEAD, [roadmap](docs/NEXT_MILESTONES.md), relevant specialist handover/tracker and any active GitHub issues/PRs. Previous work may have landed since your last message.
2. Inspect every [active claim](docs/agent_coordination/claims/) and its `feature_id`, `owner`, `scope` and `lock_key`. An absent claim does **not** prove a pre-existing agent is idle: check recent commits/handover and coordinate if ambiguous.
3. Select **one small, unfinished, unowned feature or named roster club**. A feature does not belong to you merely because you plan to work on it.
4. Claim its **exclusive lock key** directly on the live `dev` branch using `python3 scripts/claim_feature.py claim ...` or the equivalent GitHub Contents API **create-if-absent / SHA-checked update**. GitHub write access is required. If a claim fails or another agent already owns an overlapping scope, choose another feature; do not edit.
5. **Re-read the remote lock and confirm your unique agent session ID owns it** before starting. Record your feature ID, exact affected files/club IDs, base commit and acceptance tests in your handover/issue.
6. Work in small batches. Before integrating: re-fetch `dev`, check other claims again, reconcile changes, run affected tests plus regression, and never force-push. Preserve all other agents' changes.
7. Renew the claim at least once every 24 hours while working. An expired active claim **must not be stolen automatically**; ask for a documented owner/maintainer handoff.
8. Commit and push only your owned scope. Publish exact commit SHA, verification and next checkpoint; **release** the claim with a link to your handover. Paused work also requires a handover.

**If you cannot read/write GitHub claims:** do not start editing shared `dev`; report the blocker and request assignment. If your desired feature overlaps another lock (even through shared `render.js`, `engine.js`, `ui.js`, a JSON shard, or CI config), coordinate first or choose a disjoint task.

## Important project boundaries

- `dev` is the shared integration branch, not an invitation to overwrite it. Check its tip immediately before every push.
- Protect team/player IDs and order, 2 GK / 3 DF / 4 MF / 3 FW, the four gameplay buttons, six formations, stored saves and currently playable modular runtime.
- Specialist roadmaps remain authoritative for work details: [concept art](docs/concept_character_pipeline/NEXT_CHAT_HANDOVER.md), [roster batches](docs/CLUB_ROSTER_BATCH_PLAN_20261016.md), [general milestones](docs/NEXT_MILESTONES.md), and [data merges](docs/PARALLEL_DATA_MERGE_GUIDE.md).
- A claim is **coordination metadata, not proof of feature completion or exclusive enforcement against a non-cooperating actor**. All agents must follow this protocol.

Start here: **[Feature claims and ownership](docs/agent_coordination/README.md)**.
