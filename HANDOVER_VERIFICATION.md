# Clean Handover — Verification & Contents

**Baseline:** Supermagic Football v0.8.22.1 Alpha, 14 October 2026.  
**Purpose:** transfer the current project to a fresh chat without historical clutter.

## Verification performed on the cleaned copy
- `npm test`: **PASS, 54 active Node regression scripts** (rerun after stale-script pruning).
- `node tests/master_contracts.mjs`: **PASS** (222 teams, 2,664 player slots, six formations, four action buttons, GK Diving, 357 catalog cases, release cache metadata).
- `npm run build`: **PASS**. Clean source recreates the official v0.8.22.1 playable HTML byte-for-byte.
- `python tests/v08221_aerial_super_browser_qa.py`: **PASS** in desktop Chromium and simulated Android (9 focused scenarios each).
- Original v0.8.22.1 release had **34/34 distinct browser regression scripts** passing across six bounded shards; seven current-release JSON evidence records are retained in `docs/qa_runs`. All 34 were **not rerun** merely for handover packaging.
- **357 documented test cases are not 357 individually certified executions.** No actual phone, iPhone, gamepad, Safari or Firefox certification exists.

## Clean-up policy
- Removed all old release/checkpoint folders, historical changelogs and release manifests, root and test logs, generated screenshots, obsolete migration/generator scripts, duplicate test files, and stale roster-audit exports.
- Retained the active 54-script Node chain, 34-script browser runner inventory, required QA tooling, live source modules, stand-alone game, PWA assets, active requirements and future backlog, and current release QA evidence only.
- This ZIP intentionally does not contain other historical ZIPs or old source copies. All runtime roster data continues to live in the editable source.
- Older-dated *specifications that still define active gameplay or future requirements* are intentionally retained; they are not old checkpoints.

## Continuing from here
Open `HANDOVER_README.md` and paste `NEXT_CHAT_PROMPT.md` into a new conversation with this ZIP attached. Next implementation goal is v0.8.23 original/license-cleared music and SFX; broad roster repairs stay deferred.
