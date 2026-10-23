# SuperMagicFootball release/version policy — About-only 0.9.23.1

**Effective 21 October 2026; updated 23 October 2026 for release 0.9.23.1.** Replaces the historical `v<BUNDLE>+dev.<SHA>` player-facing development banner and the old remote-dev About implementation. The owner-approved release numbering is `x.y.z.a`: four nonnegative decimal integers.

## One authoritative player-facing release

`src/modules/release.js` exports the immutable `RELEASE` record containing `version`, `date` and short human-readable `notes`. **The exact installed/offline game bundle identifies itself as `0.9.23.1` in Settings → Credits / About only.** It must never fetch or show the remote development branch's newest commit as if that were the player's installed version. The browser title/home and other menus have no version number. Credits and developer information remain accessible. `package.json` contains the matching release number; the game runtime and save-export label read `RELEASE.version`, while imported older save files and historical storage keys remain compatible. Offline service-worker precache explicitly includes the release module and is rotated for changed game bytes.

The four-field numbering is advanced **once for every newly deployed player-facing game update**, including minor enhancements and bug fixes, not for independent documentation or test-only commits. Do not deploy additional game-code changes under the same version. For subsequent releases increment the highest applicable category: `x` complete owner-accepted product milestone (not before 1.0 acceptance); `y` a major feature, reset `z,a`; `z` an existing feature's enhancement, reset `a`; `a` a correction/re-release. Release notes must describe shipped, verified changes, never aspirational plans.

## Internal per-commit traceability, not a user-visible version

Every Git commit changes its immutable GitHub SHA. The **Full Regression Census and Modular Game Dev QA** record the exact tested SHA and run IDs. CI must run the complete 4 Node + 4 Chromium shards, preflight and HTTP preview on the exact `dev` head, and automatically fast-forward `main` only if green and unchanged. Main's dispatched workflow runs hosted **GitHub Pages** smoke; the hosted comparison checks SHA-256 hashes of the checked-out main's HTML, JS and CSS against the actual public response. Pages deployment success and main hosted smoke are independent release evidence. This is the authoritative way to identify **the exact deployed bundle SHA internally**; do not conflate the live `dev` SHA, the human `0.9.23.1` version, or an earlier successful Pages deployment.

The release metadata stays embedded and readable offline. Exact per-commit SHA is available internally in GitHub Actions logs, Git commit records, and QA artifacts rather than displayed to players. Issue #12 remains a candidate for a future *build-embedded immutable revision manifest* for offline developer diagnostics; no false claim of offline Git SHA embedding is made by this release.

## Mandatory README changelog on every game update

For **every player-facing game update**, in the same release increment update the root `README.md` with (1) the new four-part version in both the release banner and project heading, (2) the release date, (3) a clear concise summary of newly shipped features, improvements and fixes, (4) save/offline compatibility notes when relevant, and (5) a valid live-game link. Keep this aligned with `src/modules/release.js`, `package.json`, the rotated offline cache and About release notes. **Treat a missing/stale README version or update summary as a release blocker**, not optional documentation. Update the release-contract tests to enforce these README requirements. Documentation-only commits do not require a version bump.

## Every-commit protocol

1. Read AGENTS.md, shared memory and only your own registered developer checkpoint; read exact latest `dev` and `main` SHAs.
2. Preserve the canonical `RELEASE` import and About-only identity on **every commit**; do not silently bump the four-part bundle version for docs/tests.
3. Validate relevant gameplay, About and release contracts; run `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`, generated test-fixture, Modular QA and full 4+4 Census.
4. Do not publish red or incomplete CI, bypass GitHub security, overwrite concurrent changes or force-push. Verify Pages hosted byte hashes and playability before claiming a production release.
5. Update human-readable release notes only for truly integrated and verified features. The Spinning Bumper remains an opt-in prototype, not a generally equipped new ability.

## Compatibility and remaining verification

Saved data retains `legend_` storage keys, Career save vault, JSON sections and legacy import rules; `version` in downloaded backup metadata identifies the exporter and does not rewrite content schemas. Keep 223 team IDs, 2,676 player records, six formations, four gameplay buttons and offline service-worker support. Physical devices require separate real-device certification; simulated-touch browser QA alone is not that certification.
