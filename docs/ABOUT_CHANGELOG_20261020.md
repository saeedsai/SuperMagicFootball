# About: automatically changing development version and recent changes (2026-10-20)

## Requirement
The user reported seeing the old constant **0.8.25.32** after many commits and requested **a newly identifiable version with a short change summary on every update**. The stable package/game bundle version was not designed to change per commit; replacing a shared SemVer number after every docs/roster/graphics commit is conflict-prone across agents. The previously implemented About page already fetched the latest development SHA, but that field was visually secondary and gave no change log, while normal menus still advertised 0.8.25.32 as if it were the latest update.

## Delivered UI behavior
- **CURRENT DEVELOPMENT VERSION** is the prominent About heading; it links to `v<BUNDLE>+dev.<12-character SHA>`. This revision is fetched from the latest public `dev` commit on every About visit using `cache:'no-store'`; each commit therefore visibly changes the identifier automatically, without competing agent edits to the bundle number.
- **Latest commit** displays the verified commit subject from that exact commit response (first line, bounded length); if no subject exists, explicitly states this. This includes documentation-only commits rather than inventing feature completions.
- **RECENT CHANGES** displays up to five verified GitHub commit subjects with commit links, excluding pure coordination locks and individual agent-memory checkpoints, to highlight gameplay, artwork, tests and other actual work. The history API uses no-store. Commit strings are rendered with `textContent`, not HTML.
- The home-screen/menus no longer headline the fixed old number as current development. They point to About for the live revision. The **GAME BUNDLE** is preserved separately for compatibility.
- If GitHub's API is unreachable or rate-limited, the About page remains usable, explains change history is unavailable offline and does **not** mislabel a remote dev SHA as deployed Pages code.

## Versioning limitation and next release work
The title/package/runtime bundle version remains `0.8.25.32` / `0.8.25.32-integrated`; this is intentionally a stable bundle, **not** a fresh build number. The commit-based development version changes per Git commit. To show **exact bytes running on GitHub Pages**, not merely latest remote dev, a separate `release-infra` + `ui-controls` scope must add an embedded deploy revision/build manifest and verify the hosted value (tracked in [Issue #12](https://github.com/saeedsai/SuperMagicFootball/issues/12)). Do not make a false "current installed version" claim based on remote HEAD.

## QA and change boundaries
Changed: `src/modules/ui.js`, `tests/about_revision.test.cjs`, `tests/about_revision_browser_qa.py`, this document. No gameplay, graphics, roster, saves, external accounts, GitHub workflows or service-worker changes.
- Node About tests: current link contract, updated subject, cache-busting per visit, recent meaningful history, safe text injection, offline fallbacks.
- Actual Chromium desktop and simulated-touch About QA: latest revision changes between visits, recent changes visible, bookkeeping filtered, 503 API offline fallback, game menus and four control buttons unaffected.
- Full integrated Node/Chromium census and Modular QA must **pass on the same final pushed SHA** before any `main` promotion. Physical phone or exact hosted build SHA is **not** certified by these tests.

## Future developer requirement
For every Git commit use a descriptive one-line commit subject (`feat(scope): …`, `fix(scope): …`, `art(scope): …`, `docs(scope): …` etc). A meaningful summary then appears automatically in About. Do not manually freeze/bump every development SHA or overwrite another agent's UI lock. If the stable playable bundle version is intentionally released as a new semantic version, coordinate all visible strings, package metadata, About tests and deployment metadata under the relevant claims.
