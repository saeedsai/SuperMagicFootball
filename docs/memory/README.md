# Context and memory protocol — mandatory start for every project chat

This folder is a **short handover layer**, not a new code authority, long-term transcript store, or replacement for GitHub claims. Start each new task by reading only: (1) root `AGENTS.md`, (2) this protocol, (3) `SHARED.md`, (4) **your own** indexed agent file, then (5) the specific live claim and specialist document needed for that task. Do not preload all docs, tests, chats, old plans or other agents' memory.

## Identity and read/write boundaries

- `SHARED.md` is the **one shared memory file**. Every agent reads it. Only a current `project-context` lock owner or authorized maintainer updates it; other agents propose changes through an issue/handover.
- `AGENTS_INDEX.json` maps the **known chats** to one memory file each. At startup select the exact chat's stable ID; do not reuse another agent's ID even when all chats use the same GitHub user. If missing, first arrange a unique path/index entry without editing an active owner's scope. A new chat can be added after a documented handoff or by the project-context owner.
- Each agent **reads and edits only its own** `agents/<id>.md`. An agent's existing feature lock authorizes its own checkpoint updates; it never authorizes another agent's memory. All other agent files are off limits for reading, searching, summarization, or edits.
- **Security limitation:** the GitHub repo cannot grant file-specific access to independent chats sharing repository credentials. This is an operational rule only. Do not put secrets, private user data or confidential chat contents into any repository memory. For technical isolation, use separately permissioned repositories or private scoped storage.

## Mandatory per-commit About revision

All agents must follow [versioning policy](../VERSIONING_POLICY.md) on **every commit**, not merely major feature releases. The About screen must keep its on-open `dev` commit SHA and stable bundle version clearly distinct. Do not modify another agent's UI/release-owned file; verify existing About tests and report the SHA with your QA checkpoint.

## Start session: 1–2 minute protocol

1. Use the latest remote `dev` HEAD; do not load the entire repository into ChatGPT context.
2. Read `AGENTS.md`, this file, `SHARED.md`, then **only your** agent file in `AGENTS_INDEX.json`. Do not copy previous conversation transcripts into a new session.
3. Recheck `docs/agent_coordination/claims/`, open issues/PRs and only your specialist tracker. **The live claim, not memory, establishes current ownership.**
4. Select one small unowned item, claim it with SHA-check, verify that the remote file names your unique session, and act only inside its scope. On conflict, stop and switch/handoff; never override another claim.
5. Keep context bounded: fetch only relevant code/tests and the newest handover; prefer small diffs and targeted reads. State clearly when a device or browser test was not run.

## End session: compact checkpoint and stale-note cleanup

Replace your **own** memory file rather than appending transcript-style logs. Keep it under **4 KB**, with these headings: Mission, Current checkpoint, Next smallest action, Ownership and exclusions, Evidence, Cleanup. Include a dated update, current feature/claim **link** (if known), short change summary, passing/failing test counts with commit/URL evidence, and exact next action. Mark uncertainty honestly. Remove already finished to-dos, expired assumptions, stale SHA claims, duplicate details and old test tallies. Link to durable specialist docs or Git history for provenance.

The shared file must stay under **6 KB**. Edit it only when cross-agent project facts, global priorities, contracts or document pointers truly change; avoid volatile head SHA, copy/pasted active claim tables or daily test totals. Git history is the archive; do not create v2/v3 shared-memory duplicates.

## Documentation and validation

See [docs index](../README.md) for active documents, specialist handovers and archives. Existing version-stamped QA/replay records are historical evidence, **not ChatGPT startup context**. Never bulk-delete them without checking test references, provenance, active locks and before/after regression. The memory validator runs automatically through `tests/project_memory_contract.test.cjs` in the standard Node regression suite; locally use `node --test tests/project_memory_contract.test.cjs`.

This policy improves *new session* context discipline but cannot erase already-loaded context, change ChatGPT account memory settings, or force ongoing chats to adopt it automatically. Send the [adoption prompt](../README.md#agent-adoption-prompt) to every already-running chat at its next checkpoint.
