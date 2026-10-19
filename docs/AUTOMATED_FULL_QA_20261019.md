# Automatic Full Regression Census — 2026-10-19

## Delivered
`.github/workflows/full-regression-census.yml` now triggers on **every** push to `dev` or `main`, not only a narrow file-path allowlist. Existing manual `workflow_dispatch`, pull requests targeting `main`, preflight checks, four Node historical regression shards and four Playwright Chromium shards remain intact.

## Why
Previous pushes to `dev` that changed only agent checkpoint, documentation, or newly named test files could skip full regression. This caused missing CI evidence and required the owner to run a workflow manually. This change makes the verification attempt automatic on each push, including integration commits.

## Verification and limits
- GitHub accepted workflow source commit `678214a542c54be28e71104079133aa1774638ab`.
- Inspected the workflow text to confirm triggers, preflight and both four-shard matrices remain.
- The available GitHub connector's commit workflow lookup only returns pull-request-triggered runs and is **not** authoritative for push-triggered Actions. A blank result is not a failure.
- Native Node and Chromium runs on the new workflow commit are **not yet independently confirmed**. Hosted Pages/real-device tests were not run; container cannot resolve github.io.
- No automatic merge to `main` was enabled; merge still requires green exact-head QA and approved release criteria.
- CI cost: this intentionally runs a full 4+4-shard census on every push, including documentation-only commits. Optimize later with batching or scheduled census if excessive.

## Next five bounded steps
1. Inspect the Actions run for the newest `dev` SHA; repair any failing preflight/Node/browser shard.
2. Add deployed-site smoke verification (desktop and mobile emulation) as a release gate, with reliable deployment provenance.
3. Set up branch protection / required checks and a controlled `dev` to `main` promotion policy, with maintainer approval if required.
4. Resume bounded goalkeeper AI / passing improvements after the CI baseline is green and gameplay lock is available.
5. Implement one career management improvement, then begin LAN multiplayer architecture in a separately claimed scope.

## Multi-agent
Release infrastructure lock `release-infra` is released after this checkpoint. Do not modify other agents' ownership records or unrelated files. Keep `main` unchanged.
