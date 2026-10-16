# About developer credit and per-commit dev revision

Date: 2026-10-16 · Feature: `UI-ABOUT-LIVE-REVISION-DEVELOPER`
Owner: `ui-about-live-version-saeed-20261016-gpt6-s15` · Exclusive lock: `ui-controls`

## Player-visible requirements implemented

The in-game **Settings → CREDITS / ABOUT** entry displays:
- Developer **Saeed** and the user-requested **saeedmsalehi1990@gmail.com** as a clickable email link.
- The **game bundle version** already exported by the live runtime (currently `0.8.25.32-integrated`), without changing its save/export schema or compatibility.
- **Latest GitHub development commit:** the actual 40-character SHA from the public `dev` branch of `saeedsai/SuperMagicFootball`, with a clickable GitHub commit link and first twelve hex digits. The query uses `cache:'no-store'` on **every About entry**, so new commits become visible even when the human-readable alpha version has not yet been incremented.
- An explicit distinction: the latest `dev` commit identifies *repository development*, **not necessarily the deployed Pages build revision**, because GitHub Pages may lag. Offline or rate-limited API requests gracefully display "unavailable offline" while retaining developer credit, bundle version and all playable modes. The response SHA is strictly validated before creating links, and asynchronous responses never update a menu that the player closed.

A SHA is a distinct code revision for every Git commit, including documentation-only commits; this avoids misleading manually synchronized semantic versions across concurrently working agents. A future release-infra iteration could stamp the **exact deployed SHA** at build time rather than depending on live GitHub API access, but that requires separate `release-infra` ownership and deployment workflow changes.

## Bounded source changes and tests

- `src/modules/ui.js`: only the About menu and its read-only live commit lookup; no engine/input/rosters/graphics changes.
- `tests/about_revision.test.cjs`: six VM runtime checks for developer credit, valid SHA link, new commit on revisit, offline/API failure, invalid SHA injection, and stale navigation.
- `tests/about_revision_browser_qa.py`: actual modular browser with desktop and simulated-touch layout; intercepts GitHub API calls with deterministic first SHA, second SHA and 503 error, and checks main-menu navigation and the unchanged four controls.
- Roadmap addendum in `docs/NEXT_MILESTONES.md`.

No service worker cache, data shards, save formats, CI workflows or shared harness changes. Do not delete historical player/artwork/QA files without proof they are unused.

## Quality gate

Run Node tests and complete standard source/data, Python merge, agent coordination, four Node + four Chromium historical shards. Confirm both new browser scenarios and GitHub Pages desktop/touch generic smoke. Record exact tested SHA and known limitations before claim release.

## Next five bounded iterations

1. Certify the About desktop/touch flow and hosted Pages entry, with final evidence on a descendant SHA.
2. Implement deployment-time **exact built revision** manifest in a separately claimed release-infra batch, retaining offline fallback; optionally formalize sequential release tags (do not rewrite Git history).
3. Implement genuine human goalkeeper control in penalty shootouts after owning engine and input/UI without changing the four-button semantics.
4. Stabilize rapid touch dribble skill detection and add device/frame-rate regression.
5. Improve save-compatible first-touch handling and career/tactical coaching with isolated gameplay claims; then certify physical iOS/Android and offline upgrades.

**Commit and CI results:** checkpoint after integration.

## Delivery and exact-source verification checkpoint

**Source and tests pushed to `dev` as individual SHA-checked commits:**
- [`0deb9ac93449`](https://github.com/saeedsai/SuperMagicFootball/commit/0deb9ac93449670c41ddf7263f78cb06fff5be78) — actual About UI credits and GitHub-dev commit lookup with strict SHA verification, offline fallback, navigation race guard.
- [`f3a1ea98651e`](https://github.com/saeedsai/SuperMagicFootball/commit/f3a1ea98651e5e540beb9ba13cacfbb60b125ea6) — six executable Node tests for name/email, online link, new commit on revisit, offline/403, malformed SHA, detached menu.
- [`093006498551`](https://github.com/saeedsai/SuperMagicFootball/commit/0930064985519a88345ae51e1783a32d81044035) — real desktop/simulated-touch Chromium browser acceptance, intercepted two successive GitHub SHA responses and simulated 503; the browser test is committed but **not yet executed in a green full census**.
- [`d93317c823db`](https://github.com/saeedsai/SuperMagicFootball/commit/d93317c823db10a9c813aa934252bab94147f208) — owner-scoped next milestones and five future iterations.

**Node test results:** [Modular Game Dev QA #38945669755](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38945669755), descendant `c13a2b47`, confirmed **all six new About tests PASS** and 20 Python merge / 10 coordination checks PASS. The entire Node suite was **187 PASS / 1 FAIL** because another chat's memory registration violates `tests/project_memory_contract.test.cjs` (`wrong identity for gameplay-pk-20261016`). This issue is entirely outside this UI feature and predates the source/test completion. See [issue #9](https://github.com/saeedsai/SuperMagicFootball/issues/9), assigned to that chat or authorized project-context owner. It is **incorrect** to report the overall QA as successful until its exact-source validation is rerun and green.

**Eight-shard Full Regression Census:** [#38945490219](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38945490219) launched automatically from the About-source edit, but its **preflight failed** on the same unrelated memory-ID contract, so Node/Chromium shards were never certified. A fresh 4 Node + 4 Chromium run including `about_revision_browser_qa.py` is an explicit next-session gate. Do not weaken the contract or edit another chat's memory to hide the failure.

**Hosted deployment and gameplay smoke:** A later descendant containing the About source successfully deployed via [Pages #38945844215](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38945844215); [live hosted PC+simulated-touch smoke #38891468528 attempt 13](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **SUCCESS**: HTTP 200, 224 teams, initial menus, team selection, kickoff and active match for both browser layouts. Public URL: https://saeedsai.github.io/SuperMagicFootball/. The smoke certifies general hosted game playability, **not** the new About DOM/online API directly. Dedicated actual About browser test awaits a green Chromium run; physical phone, offline/PWA upgrade and every-new-commit exact *deployed build* fingerprint are still follow-up certifications.

**Exclusive ownership:** Gameplay-engine is currently active on `GAMEPLAY-PK-HUMAN-GOALKEEPER`, so this UI agent intentionally did **not** change penalty input, gameplay AI, keeper physics or action buttons. No old files deleted because tracked historical QA, sprites and roster provenance were not shown unused. Version-as-Git-SHA is per-commit, available online and labeled as source revision; the runtime semantic version remains `0.8.25.32-integrated`. For offline exact *deployed* SHA, introduce a separate deployment-time manifest under `release-infra` (and UI owner only if needed).
