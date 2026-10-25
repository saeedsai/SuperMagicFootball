# Context and memory protocol — single-developer mode

This folder is a short, bounded handover layer. See `AGENTS.md` for the owner-authorized single-developer policy. Start by reading this file, `docs/memory/SHARED.md`, and **only your own** `docs/memory/agents/smf-hourly-dev-20261019.md`. Never bulk-read other chats' private-by-convention notes.

## Identity and write boundaries
- The central maintainer may update shared memory and project documentation. There is **no project-context feature lock** in single-developer mode.
- `AGENTS_INDEX.json` and historical files remain to preserve identity and provenance. Do not reassign, read, or edit another agent's private memory. The GitHub repo **cannot grant file-specific access** to chats using the same credentials; this remains a cooperative boundary. Do not place secrets in these files.
- Previous chat agents must not continue committing without the owner's new approval. Historical active locks are not an authority to block work.

## Mandatory per-commit About revision
The current About screen displays only the installed four-part `0.9.41.5` bundle version and bundled release notes. On **every commit**, keep `src/modules/release.js` and the About tests valid without showing a dev SHA to players. Full immutable Git SHA traceability remains in CI and GitHub history; only main hosted smoke and Pages verify deployed bytes. Follow `docs/VERSIONING_POLICY.md`.

## Start session
1. Read latest `dev`/ `main` SHAs, this file, shared memory and your own indexed checkpoint.
2. Read open issues, owner audit/backlogs and relevant code/handover only. Legacy claims do not require acquisition or release.
3. Implement a small increment using SHA-checked, non-force updates; capture exact failed-write diagnostics; don't bypass validation.
4. Run focused regressions, full CI, and hosted Pages smoke before claiming deployment.

## End session
Replace only your own checkpoint; keep it under 4 KiB with headings Mission, Current checkpoint, Next smallest action, Ownership and exclusions, Evidence, Cleanup. Distinguish actual passing/failing tests from not-run. Keep shared memory under 6 KiB. Git history preserves older states.

## Documentation and validation
See `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md`, `docs/agent_coordination/README.md`, and `docs/README.md`. `tests/project_memory_contract.test.cjs` validates the memory boundary, not legacy feature ownership.
