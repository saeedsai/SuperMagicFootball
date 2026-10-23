# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019` · Updated 2026-10-24.

## Mission
Deliver one bounded, tested increment on existing `dev` every run even while CI/promotion waits. Fix blockers safely. Never create branches, force-push, bypass security or promote red code.

## Current checkpoint
- **LAN-010**: guest handshake/session gate and atomic DataChannel input sender (`13e281df`), three Node tests (`a9fafed1`), log `81435186`. Function-level V8 smoke passed: mock host+guest handshake, open-channel send and host queue/frame delivery, premature/closed/throwing channel atomicity. Not live LAN UI/signaling; no graphics work.
- LAN-009: `044b4300` host monotonic frame advance, `29f68d26` watermark preservation, `7e1a109f` tests. LAN-008: `4c148c1d` host handshake/queue bridge, `901a8c70` tests. LAN-007: `a7467a22` handshake gate, `992615ba` tests. LAN-006: `16426d20` transport, `92683b97` tests. LAN-005: `1940052f` guest packet builder, `b77edc65` tests. LAN-004: `164d23b8` neutral fallback, `14df7d2c` tests.
- Candidate About version `0.9.29.2` unchanged for non-player-facing LAN protocol. Preserve 223 teams/2676 players, six formations, four actions, 10 Career/Cup slots, SD09, offline/save compatibility.
- At run start `dev=759f7b1d`, `main=bfad8158`, ahead 13/behind 0. Exact final head and green release evidence must be rechecked.

## Next smallest action
1. Inspect exact `dev` Full Regression Census (preflight + 4 Node + 4 Chromium + preview) and Modular QA; fix failures on dev.
2. Advance genuine LAN transport with host/guest hello exchange and browser connection/signaling UI, bounded and tested.
3. Address open issue #38 keeper roll and #15 Concept Royals directional sprites with targeted gameplay/art QA.
4. Allow only protected exact-head green `dev`→`main` promotion; check resulting SHA and main CI.
5. Verify Pages hosted HTML/JS/CSS byte hashes and desktop/touch gameplay, record remaining visual limitations.

## Ownership and exclusions
Single developer. Read AGENTS.md, VERSIONING_POLICY.md, SHARED.md and this checkpoint; update central log. Do not edit other agents' memory. Two branches only: dev/main.

## Evidence
- CI discovery root cause: `fetch_commit_workflow_runs` filters PR-triggered runs and falsely looks empty for push commits. Query GitHub REST `/repos/saeedsai/SuperMagicFootball/actions/runs?branch=dev` instead.
- `759f7b1d`: Modular QA success run **40036907099**. Full Regression run **40036906913** was in progress: preflight, 4 Node, 3 Chromium, HTTP preview succeeded; browser shard 1 pending. New dev commits supersede this candidate. Check exact final SHA before promotion.
- Earlier CI 40031378895/40031378823 failed missing checkpoint identity, later repaired. No current Pages or Crown Royals visual certification claimed.

## Cleanup
Keep this checkpoint below 4 KiB; preserve headings. Continue hourly regardless of unreleased increments, without weakening QA.
