# Supermagic Football — v0.8.24.12 Alpha

Single-player and offline-capable original cartoon arcade football game. **Current authoritative source:** `src/`, `index.html`, `style.css`; `play.html` is a generated standalone file. All active development documentation is under `docs/`.

**Gameplay contract:** exactly four action buttons; five organized top-level menu sections; six approved formations; six BPW historical World Cup teams plus seventh BPW All-Time Legendary 12, with existing saves/roster IDs stable. Super Shot/Header/Bicycle controls, audio, quick match, career and competition implementations remain intact. Some menu entries are Coming Later and do not pretend to work.

**Build:** `npm run build` (requires Python 3). **Node regression:** `npm test` followed by `node tests/master_contracts.mjs`. **Browser regression:** use `python tests/run_master_suite.py --profile full --category browser`, or divide into eight `--shard-count 8 --shard-index N` groups to avoid process timeouts. Each group records honest PASS/FAIL/TIMEOUT/NOT EXECUTED results.

**Current addition:** optional `src/match_telemetry.js` release-context observations and 30 diverse scripted full-match fixtures alongside the earlier 45. See `docs/MATCH_RELEASE_CONTEXT_SPEC_v082412.md` and `docs/TEST_REPORT_v082412.md`. No goalkeeper or Super Shot power retuning in this release. Physical-device testing is open.

**Handover to another chat:** read `HANDOVER_README.md`, then paste `NEXT_CHAT_PROMPT.md`. Preserve the future Super Defense and Tricks backlog and delayed roster-correction work.
