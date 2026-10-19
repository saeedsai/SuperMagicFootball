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


## 2026-10-19 follow-up — additional release gates

The full census now has a `preview-smoke` job which serves the **real modular root over HTTP** and uses Playwright Chromium to navigate Quick Match → On Device → Versus → Kickoff on desktop and simulated touch. It asserts playable state, two teams, canvas and exactly four action buttons, and fails on JavaScript page errors. Promotion now depends on this job in addition to preflight and all eight regression shards. Source commit: `e5c0943cdd2208e9570bc8ddab71ca38d9bd2eca`.

The `hosted-pages-smoke` job checks public GitHub Pages HTML, JS and CSS availability after a `main` workflow run, retrying for up to ~9 minutes. Source commit: `9a72c0be345f692adff3fb4288d8252e8b2324fb`. This check is **post-promotion**, not a pre-promotion gate, and checks availability rather than deployed commit provenance or full gameplay.

**Important GitHub behavior:** a ref update made with the default `GITHUB_TOKEN` does **not** normally trigger another workflow's `push` event. The promotion job therefore explicitly dispatches Full Regression Census on `main` with `actions: write` (commit `7ddb58cb0601024269be3b7ff618a62a18840dce`). This produces a main QA + hosted Pages check if GitHub permissions allow it. It does **not** guarantee a Pages branch build will be triggered by the token-originated ref update; a separate Pages deployment workflow or an approved GitHub App token may be needed.

**Still unverified:** native CI run result, real GitHub Pages release freshness, Actions write policy, protected-main update policy, physical phone. If any gate fails, the promotion job does not run. Do not claim end-to-end green until the exact SHA is independently observed in successful Actions jobs and hosted Pages.


## 2026-10-19 follow-up — repaired skipped post-release verification

**Issue found in workflow review:** The promotion job explicitly dispatches the workflow on `main` because the default `GITHUB_TOKEN` update does not fire ordinary push events, but `hosted-pages-smoke` previously had an `if` condition requiring `push` only. The dispatched verification run would therefore skip the hosted check.

**Fix:** `hosted-pages-smoke` now runs on either `push` or `workflow_dispatch` to `main`. It checks out the exact `main` commit and retries hosted HTML, `src/main.js`, and `style.css` until all three SHA-256 hashes match the checked-out release files. Merely serving an old working Pages version no longer passes.

**Limitation:** This is a **post-release** check, not a pre-release hosted gate. It can detect a stale deployment and fail the main workflow but cannot retroactively prevent the already-completed fast-forward. Full hosted gameplay on a physical phone remains unverified. GitHub Actions and Pages outcomes for this commit have not been observed; a real successful workflow run is still required.
