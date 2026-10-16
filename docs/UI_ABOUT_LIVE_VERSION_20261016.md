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
