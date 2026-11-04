# Context and memory protocol — coordinated development

This folder is a short, bounded handover layer. See `AGENTS.md` and `docs/agent_coordination/README.md` for the owner-authorized scoped multi-agent policy. Start with this file and `docs/memory/SHARED.md`; read **only your own indexed checkpoint** when applicable. Never bulk-read other agents' private-by-convention notes.

## Identity and write boundaries
- The task coordinator may update shared memory and project documentation. Scoped contributors may update only their assigned files; coordinate before overlapping edits. There is no feature-lock handshake.
- `AGENTS_INDEX.json` and historical files remain to preserve identity and provenance. Do not reassign, read, or edit another agent's private memory. The GitHub repo **cannot grant file-specific access** to chats using the same credentials; this remains a cooperative boundary. Do not place secrets in these files.
- Previous chat agents must not continue committing without the owner's new approval. Historical active locks are not an authority to block work.

## Mandatory per-release About revision
The About screen displays the installed four-part candidate version and bundled notes. Keep `src/modules/release.js`, root README and About tests aligned for player-facing changes; never show a dev SHA to players. Full immutable Git SHA traceability remains in CI and history; hosted smoke checks deployed bytes separately. Follow `docs/VERSIONING_POLICY.md`.

## Start session
1. Read latest `dev` SHA, this file, shared memory and your own indexed checkpoint.
2. Read open issues, owner audit/backlogs and relevant code/handover only. Legacy claims do not require acquisition or release.
3. Implement the assigned small increment; reconcile against the latest SHA and do not bypass validation.
4. Run focused regressions, full CI, and hosted Pages smoke before claiming deployment.

## End session
Replace only your own checkpoint; keep it under 4 KiB with headings Mission, Current checkpoint, Next smallest action, Ownership and exclusions, Evidence, Cleanup. Distinguish actual passing/failing tests from not-run. Keep shared memory under 6 KiB. Git history preserves older states.

## Documentation and validation
See `docs/MASTER_BACKLOG.md`, `docs/agent_coordination/README.md`, and `docs/README.md`. `tests/project_memory_contract.test.cjs` validates memory boundaries, not feature ownership.
