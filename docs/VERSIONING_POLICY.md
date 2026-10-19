# Mandatory version identification — every agent, every commit

**Status:** enforced as agent-start instruction and Node regression contract on `dev`. Applies to every chat/agent and every Git commit, including changes to assets, rosters, gameplay, QA, documentation and build metadata.

## Two different identifiers (do not confuse them)

1. **Game bundle version** (e.g., `0.8.25.32-integrated`): identifies the established playable release/bundle, save/export compatibility and semantic release milestone. This does **not** need to be manually incremented for unrelated documentation or tiny independent Git commits; change it as a coordinated **release change**, not as an unclaimed UI edit.
2. **Per-commit development revision**: the full GitHub `dev` commit SHA uniquely identifies **every** commit, even if the human-readable version is unchanged. The **CREDITS / ABOUT** screen now presents this as a visible combined version label, `v<BUNDLE>+dev.<12-char-SHA>` (for example `v0.8.25.32-integrated+dev.abcdef012345`), linking to the complete exact Git commit. The SHA is fetched with `cache:'no-store'` every time About opens; after every push, re-opening About online identifies that update. This auto-version label covers **all commits**, including docs/tests, without agents racing to edit a shared SemVer string. Never remove the mechanism, freeze the SHA, or claim the *remote* dev version is the already-deployed browser code.

**Important:** if the GitHub Pages build is behind `dev`, About explicitly labels its composite version as **Latest GitHub development commit · auto-versioned after every update**, **not** as the current installed/deployed build. When offline or GitHub API is unavailable, the application retains its bundle version and shows a graceful "unavailable offline" status. Offline per-commit build verification will require a separately implemented **deployment-embedded revision**; do not pretend the online API provides that.

## Required workflow for EVERY agent

**Before work:** read root `AGENTS.md`, shared [memory](memory/SHARED.md), this policy and the live coordination claims. Confirm who holds `ui-controls` and `release-infra`. Never edit another owner's UI code to "bump" the version.

**Before pushing:** keep the About commit-revision mechanism intact; run relevant gameplay tests plus the About version tests (`node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`). If you change a human-readable release version, get the appropriate lock/handoff and keep runtime About, HTML title, package metadata, documentation and tests consistent without changing the save file schema accidentally.

**After pushing:** read the **new latest** `dev` SHA, show it in your report together with the current bundle version, and confirm that the online About screen links to the newest `dev` commit when reopened (or clearly report if browser/API verification was not run). Avoid claims that a commit is "on Pages" until its deployment run succeeds. Because commits themselves alter the SHA, use **GitHub commit metadata** as the automatic monotonically changing identity rather than manually committing a version file that all agents would conflict over.

**For docs/test-only commits:** the Git SHA changes automatically even when the semantic bundle release version does not. Report the revision without rewriting the game release version. This minimizes conflicts between concurrent agents.

## Regression contract and gap

- `tests/about_revision.test.cjs` verifies the About UI's live SHA, unique `v<BUNDLE>+dev.<SHA>` label, on-revisit refresh, offline behavior and developer info.
- `tests/versioning_policy_contract.test.cjs` verifies all-agent governance pointers and enforces About's unique composite-version label + SHA retrieval contract. Both are picked up by the existing Node CI glob.
- Known gap: **exact deployed bundle SHA**, visible even offline, has not been built into the site by this policy-only change. This requires a coordinated `release-infra` + `ui-controls` feature, e.g., a deployment-time embedded revision manifest tested against GitHub Pages. Never bypass an active UI claim.

The agent instructions/CI cover compliant agents, not arbitrary external pushes. For hard enforcement of release tagging or actual deployed build IDs, protect `dev` and require checks/PR review.

## Tracked follow-ups

- [Issue #12](https://github.com/saeedsai/SuperMagicFootball/issues/12): add a deployment-embedded SHA to identify **the exact running build**, separately from remote dev HEAD, after release/UI claims are available.
- [Issue #13](https://github.com/saeedsai/SuperMagicFootball/issues/13): reconcile the pre-existing memory-agent identity test failure. The new version-policy tests pass; this separate failure kept the 2026-10-16 full Node CI run at 196/197.
