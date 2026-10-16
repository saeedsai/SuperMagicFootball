# Mandatory version identification — every agent, every commit

**Status:** enforced as agent-start instruction and Node regression contract on `dev`. Applies to every chat/agent and every Git commit, including changes to assets, rosters, gameplay, QA, documentation and build metadata.

## Two different identifiers (do not confuse them)

1. **Game bundle version** (e.g., `0.8.25.32-integrated`): identifies the established playable release/bundle, save/export compatibility and semantic release milestone. This does **not** need to be manually incremented for unrelated documentation or tiny independent Git commits; change it as a coordinated **release change**, not as an unclaimed UI edit.
2. **Per-commit development revision**: the full GitHub `dev` commit SHA uniquely identifies **every** commit, even if the human-readable version is unchanged. The existing **CREDITS / ABOUT** screen displays this as a linked 12-digit abbreviation, fetched with `cache:'no-store'` when the menu is visited. After every new commit, reopening About while online should fetch the new SHA. Never delete this feature, replace it with a hard-coded commit ID, or claim it identifies the already-deployed browser code.

**Important:** if the GitHub Pages build is behind `dev`, About explicitly labels the SHA as **Latest GitHub development commit**, not as the current installed/deployed build. When offline or GitHub API is unavailable, the application retains its bundle version and shows a graceful "unavailable offline" status. Offline per-commit build verification will require a separately implemented **deployment-embedded revision**; do not pretend the online API provides that.

## Required workflow for EVERY agent

**Before work:** read root `AGENTS.md`, shared [memory](memory/SHARED.md), this policy and the live coordination claims. Confirm who holds `ui-controls` and `release-infra`. Never edit another owner's UI code to "bump" the version.

**Before pushing:** keep the About commit-revision mechanism intact; run relevant gameplay tests plus the About version tests (`node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`). If you change a human-readable release version, get the appropriate lock/handoff and keep runtime About, HTML title, package metadata, documentation and tests consistent without changing the save file schema accidentally.

**After pushing:** read the **new latest** `dev` SHA, show it in your report together with the current bundle version, and confirm that the online About screen links to the newest `dev` commit when reopened (or clearly report if browser/API verification was not run). Avoid claims that a commit is "on Pages" until its deployment run succeeds. Because commits themselves alter the SHA, use **GitHub commit metadata** as the automatic monotonically changing identity rather than manually committing a version file that all agents would conflict over.

**For docs/test-only commits:** the Git SHA changes automatically even when the semantic bundle release version does not. Report the revision without rewriting the game release version. This minimizes conflicts between concurrent agents.

## Regression contract and gap

- `tests/about_revision.test.cjs` verifies the About UI's live SHA, on-revisit refresh, offline behavior and developer info.
- `tests/versioning_policy_contract.test.cjs` verifies all-agent governance pointers and About's unique SHA retrieval contract. Both are picked up by the existing Node CI glob.
- Known gap: **exact deployed bundle SHA**, visible even offline, has not been built into the site by this policy-only change. This requires a coordinated `release-infra` + `ui-controls` feature, e.g., a deployment-time embedded revision manifest tested against GitHub Pages. Never bypass an active UI claim.

The agent instructions/CI cover compliant agents, not arbitrary external pushes. For hard enforcement of release tagging or actual deployed build IDs, protect `dev` and require checks/PR review.
