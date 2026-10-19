# Automatic dev-to-main release — 2026-10-19

## Implemented
The existing `.github/workflows/full-regression-census.yml` runs on every `dev` push. A new `promote-dev-to-main` job depends on **preflight, node-regression (4 shards), browser-regression (4 shards)** and only runs on a `push` event to `refs/heads/dev`.

The job uses the trusted GitHub Actions workflow (no checkout or repository code executed with write permissions) to:
1. Compare the certified `github.sha` with the latest remote `dev` ref; skip stale results.
2. Check whether `main` is already at the certified SHA.
3. Compare `main...CERTIFIED_SHA` and require `status=ahead` (fast-forward only).
4. PATCH `refs/heads/main` with `force=false`; GitHub enforces fast-forward semantics.
5. Fail without merging if main diverged, write permissions are denied, or branch rules reject the update.

The workflow grants `contents: write` **only to the promotion job**, not to the test jobs. It never uses a PAT or exposes a secret to game code.

## Verification status
The GitHub connector confirmed commit `4a9b586cfbdc17da34b122f2bcfc375387b4b0c4` on `dev`. No successful end-to-end Actions promotion run has been observed yet. This cannot certify GitHub Actions permission policy or branch protection behavior. No manual merge to `main` has been performed.

**Release gate coverage:** all preflight/Node/Chromium regression jobs; not yet a separate hosted GitHub Pages production smoke test or physical phone test. A hosted smoke job should be added as another `needs` dependency if required for release.

## Important operational constraints
- Repository Settings → Actions → General → Workflow permissions may need **Read and write permissions**. GitHub may clamp `contents: write` even when declared in YAML.
- Branch protection/rulesets on `main` may reject GitHub Actions direct ref updates; a ruleset-approved bot or protected PR merge design may be required. Do not weaken protection just to make automatic promotion work.
- Main push starts its own census; promotion is disabled for main pushes.
- Every dev push triggers a full expensive census; stale runs skip release. `cancel-in-progress: false` preserves QA evidence.

## Next five bounded iterations
1. Observe a full census run on exact `dev` SHA and inspect promotion result. Fix any genuine QA failures.
2. Add deployment/preview smoke validation for desktop and touch to the pre-promotion dependency graph.
3. If branch rules block direct ref updates, switch to a policy-compliant auto-merge PR and required checks.
4. Add post-main GitHub Pages deployment verification and incident reporting.
5. Continue gameplay improvements after full QA is green; coordinate separate gameplay claim.

**Owner:** smf-auto-promotion-20261019; lock: release-infra; released after checkpoint.
