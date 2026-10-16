# Multi-agent coordination: mandatory feature ownership on `dev`

**Read [AGENTS.md](../../AGENTS.md) first.** Effective 2026-10-16. This is the shared start/checkpoint/release procedure for *every* SuperMagicFootball coding chat. Use **GitHub's current `dev` state**, not copies in chat or a local working tree.

## Lean-memory protocol (required)

Every new or resumed chat must use the memory bootstrap in [docs/memory/README.md](../memory/README.md): shared memory plus its **own** private-by-convention checkpoint only. Read the current GitHub claims as a separate live source of truth; do not copy lock status into permanent shared memory. An agent may maintain its own memory file as part of its own claimed feature scope; the `project-context` lock owns shared memory, agent-index structure and global onboarding changes. Do not reassign another session's agent file. This is a cooperative reading policy, **not** GitHub-enforced per-file privacy.

## Canonical records and priority

- **Feature catalog:** [FEATURE_REGISTRY.json](FEATURE_REGISTRY.json) suggests bounded tasks and their exclusive lock keys. It is a list of *candidates*, **not** a declaration that an agent is free or a feature still needs work. The detailed roadmap/trackers are the authority on completeness.
- **Current reservations:** [claims/](claims/) contains one `<lock_key>.json` for each used lock. Files with `"status": "active"` are held. `"status": "released"` means the key can be claimed again, but check handover and completion first.
- **Recent changes:** check `dev` history, GitHub issues/PRs and area-specific handovers. Work predating this protocol may have **no claim yet**. Never infer exclusive access only because the claims directory is empty.
- **Ownership granularity:** one active owner per **lock key**, not per chat, GitHub username or JS module. Related features that might modify the same shared engine/renderer/UI must use the **same lock key**. One owner may take a small batch; do not claim entire programs for weeks.

### Before you start

1. Read `AGENTS.md`, this document, the registry, the latest `dev` commit, current issue/PR activity, and the specialist plan. Identify a *small unfinished* deliverable and review existing in-progress checkpoints.
2. Choose the corresponding `lock_key` and a unique stable session owner ID (e.g. `graphics-chat-20261016-01`; not `ChatGPT` or the common repository GitHub account). For clubs use **`roster-club-<stable-team-id>`**; for a national team use `roster-national-<stable-team-id>`. Both club lineup selection and club player metadata share the same club key.
3. Verify the active claims. If occupied, or a pre-protocol task may already be underway, **choose a different scope** or obtain a documented handoff. There are no implicit takeovers.
4. Claim **before editing anything** using a GitHub token with Contents write permission:

   ```bash
   export GITHUB_TOKEN=...  # your token, never commit it
   python3 scripts/claim_feature.py list
   python3 scripts/claim_feature.py claim \
     --lock graphics-renderer \
     --feature ART-C01 \
     --owner graphics-chat-20261016-01 \
     --scope "C01 front-layer render/manifest only" \
     --base-sha "$(git rev-parse origin/dev)"
   ```

   The helper writes `claims/graphics-renderer.json` on live `dev`. It creates only when missing; otherwise it requires the **current blob SHA** of a *released* claim. A concurrent write makes the request fail rather than stealing another owner's record. For agents with only a GitHub connector, use its `create_file` on `dev` at `docs/agent_coordination/claims/<lock_key>.json` (no SHA) or `update_file` with the verified current blob SHA of a **released** claim; then fetch the remote file again. Never use unconditional overwrites.

5. Confirm the new remote JSON reads `"status": "active"` with *your exact owner ID and feature ID*. If it does not, **STOP**. Add a tracking issue or handover with scoped files, test plan and base SHA. A branch name alone is not a claim.

### About version at each commit (all agents)

Every commit must be identifiable from **Credits / About** by its current `dev` Git SHA. Preserve the separate bundle release version; don't label a remotely fetched Git SHA as the deployed build. Follow [version policy](../VERSIONING_POLICY.md); run the contract tests and include the exact commit SHA and observed About revision in your handover. A feature claim does **not** authorize edits to `src/modules/ui.js` or release infrastructure owned by another agent.

### While implementing

- Continue in **small separately tested checkpoints**; append changed paths / impacted IDs / results to your area-specific progress ledger. Source code edits should be on an agent branch where possible; rebase/cherry-pick only reviewed changes onto refreshed `dev`. The lock record itself lives on `dev`.
- Never modify another active agent's scope, rename/delete their files, or silently reassign/close their claim.
- Before changes to a shared path outside your claim (e.g. `src/modules/engine.js`, `src/modules/render.js`, `src/modules/ui.js`, `sw.js`, any CI workflow), first obtain the **other relevant lock key**, or explicitly hand off ownership. Do not create two independent locks for the same shared editing surface to bypass this.
- Different clubs can proceed in parallel under distinct club keys, but their shared `data/players/*.json` shards require ID-aware merge via [PARALLEL_DATA_MERGE_GUIDE.md](../PARALLEL_DATA_MERGE_GUIDE.md) and latest-`dev` preflight before push.
- Refresh/renew a long-running claim:

   ```bash
   python3 scripts/claim_feature.py renew --lock graphics-renderer --owner graphics-chat-20261016-01
   ```

  The 24-hour expiry is **a warning, not automatic permission** for another agent to claim. For abandoned ownership, request maintainer authorization, document reason and handover, then have the owner/maintainer release it.

### Finish / checkpoint / recover

1. Fetch latest `dev` again, inspect active claims/issues, integrate without rewriting other agent commits; test the changed behavior and appropriate full regression. Report **actual** tests on the integrated SHA; distinguish not-run browser/device checks from passed checks.
2. Update your specialist roadmap, tracker and handover in the same code delivery. Provide changed paths, feature ID, claim owner, GitHub commit SHA, test results, remaining work, integration risks and next actionable batch.
3. After your code+docs are pushed and verified, release (also release when pausing, with a handover):

   ```bash
   python3 scripts/claim_feature.py release \
     --lock graphics-renderer \
     --owner graphics-chat-20261016-01 \
     --outcome completed \
     --handover "docs/concept_character_pipeline/NEXT_CHAT_HANDOVER.md — commit <sha>"
   ```

4. A released key is *available for a future separately chosen feature*, subject to current scope checks. Retained JSON gives the last owner and handover; full claim history is in Git commits. If no token/GitHub access, preserve work outside `dev` and ask a maintainer to reconcile rather than bypassing ownership.

### Conflict and stale-claim policy

- **409/422 / stale content SHA / an active owner / changed branch HEAD:** stop, refetch and retry only if legitimately free. Never force-push, patch another owner's claim, or silently change its owner.
- **Two chat agents sharing one GitHub identity:** choose distinct `--owner` session IDs. GitHub assignees alone cannot disambiguate them.
- **Active but expired or nonresponsive owner:** treat as blocked; post a coordination issue with last timestamp, intended new owner, precise scope and previous handover. Owner or trusted maintainer must release/reassign after confirming no in-flight edits. No automatic takeover.
- **Shared code path spanning groups:** a task requires all affected ownership, or must be split; one claim never grants permission to unrelated paths.
- **Existing sessions at rollout:** no active lock files were created on their behalf. These agents **must register their current scope at their next checkpoint** before further shared edits. A missing record is *unknown*, not "free."
- **Enforcement limit:** this is a **cooperative GitHub reservation protocol**. GitHub cannot force arbitrary ChatGPT sessions to read these docs, and direct push permission can bypass it. For hard enforcement, an administrator must later protect `dev` and require PR review / automated ownership checks; do not assume branch protection is enabled.

## Quick agent handover template

```text
Agent session ID:
Feature ID and exclusive lock key:
Claim URL, status and last heartbeat:
Base dev SHA -> integrated commit SHA:
Scope (explicit paths, team/player IDs) and excluded paths:
Requirement / acceptance test and current result:
Tests run (pass/fail/not run) and CI run URLs:
Known overlaps / unresolved conflicts:
Next smallest action, handover document, and release outcome:
```

### Local verification

```bash
python3 -m unittest discover -s tests -p 'test_feature_claim.py' -v
python3 scripts/claim_feature.py --help
```

These tests use a fake GitHub contents client and do **not** create real reservations. A real claim is confirmed only by rereading the GitHub `dev` lock record.
