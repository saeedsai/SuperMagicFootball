# Developer blocker playbook
Effective 2026-10-21. Read with AGENTS.md.

1. Capture exact dev/main SHAs, file blob SHA, failing CI job/run ID, command and error. Previous green runs do not certify a newer commit.
2. Reproduce the smallest failure and fix its root cause with regression tests. Run focused checks, four Node and four Chromium shards, and Modular QA.
3. Preserve About-only 0.9.27.0, offline saves, 223 team/2676 player identities, six formations and four gameplay buttons.
4. Commit only to dev with current blob SHA or expected-head fast-forward. On write rejection record the actual response, refresh branch/file, diagnose permissions and conflicts, and retry legitimate corrections.
5. If a write is unavailable, continue read-only diagnosis and prepare a tested patch. Do not claim an unverified fix.
6. Promote only after green exact-head checks. Inspect promotion logs for skipped releases; verify main, Pages deployment and hosted bytes independently.
7. Update central log, own <4KiB checkpoint and five-step plan.
