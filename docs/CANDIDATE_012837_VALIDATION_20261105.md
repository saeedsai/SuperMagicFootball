# Candidate 0.12.81.37 — local validation (5 November 2026)

## Scope

- The in-match ground scuff cue now pulses at the existing runner's alternating foot touchdowns and fades between contact phases. Its intensity follows the visual run-speed ratio.
- The online snapshot adapter preserves server-provided transformed-shot behavior, underground state, level, phase and transform duration, allowing the production renderer to show the same underground wake and shot tells as the authoritative simulation.
- Both changes affect presentation only. Player movement, ball physics and positions, scores/results, hitboxes and the existing four-action controls are unchanged. No new character art or menu artwork was created.

## Validation run

- `python -X utf8 scripts/build.py`: passed; generated fixture size **5,140,242 JavaScript / 5,263,254 HTML characters**.
- `node --test tests/online-match-renderer.test.cjs tests/run_gait_contact.test.cjs`: **10/10 passed**.
- `node --test tests/versioning_policy_contract.test.cjs tests/online-match-renderer.test.cjs tests/run_gait_contact.test.cjs`: **26/26 passed**, including release metadata, README version alignment and offline-cache rotation.
- Full tracked Node suite (`node --test` over tracked `tests/*.test.cjs`): **2,193/2,193 passed**.
- `python -X utf8 tests/run_gait_contact_browser_qa.py`: passed across **288 actual production-renderer frames** (eight headings × three speeds × twelve phases); no page errors or player/ball state changes.
- `python -X utf8 tests/online_account_ui_browser_qa.py`: passed, including the mocked online PVP rendering flow.
- `git diff --check`: passed.
- Exact-head `dev` Full Regression Census [41933058105](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41933058105) and Modular Game Dev QA [41933060494](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41933060494) passed; the SHA was promoted to `main`.
- Pages deployment [41934226266](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41934226266) and main full regression [41934226308](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41934226308) passed. The public page, service worker/cache and bundled .37 version have been verified, while `online-config.js` remains blank. Physical-device acceptance and owner visual approval remain open.

## Limits and remaining gates

The gait effect is procedural fallback presentation; these checks do not establish human visual approval. Online transformed-shot presentation is still validated against a mocked browser service, not a deployed backend or two live clients. Candidate .37 is promoted and deployed to Pages, and the main regression passed. The online API is not deployed because database and OIDC configuration are still missing. See [online server deployment handoff](ONLINE_SERVER_DEPLOYMENT.md) and [master backlog](MASTER_BACKLOG.md).
