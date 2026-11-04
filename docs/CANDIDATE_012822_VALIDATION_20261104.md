# Candidate 0.12.81.22 validation — 4 November 2026

## Change

A guest now forgets the prior host match ID when its LAN transport session resets. When the host has restarted with a new match ID, the guest can save the restarted match's terminal result and send the matching durable receipt ACK. Repeated terminal snapshots remain idempotent through the existing wallet receipt ID. The wire format, offline gameplay and offline saves are unchanged.

## Validation

- `node --test tests/lan_live_match.test.cjs` — **41/41 passed**.
- `node --test tests/lan-token-result-ack.test.cjs tests/lan_live_match.test.cjs tests/lan-protocol-channel.test.cjs tests/lan_peer_connection.test.cjs` — **100/100 passed**, including a new reconnect regression: old match ID → transport reset → new host match at tick zero → guest receipt/ACK → duplicate snapshot without duplicate tokens.
- `python -X utf8 scripts/build.py` — passed; bundle contains 4,996,385 JavaScript characters and 5,117,964 HTML characters.
- `node --test tests/*.test.cjs` — **1,962/1,962 passed**.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs` — **21/21 passed**.
- Browser checks passed: real LAN auto-discovery/reconnect, two Chromium clients hosting/finding/approving and playing, result ACK, guest reload, disconnect, and storage-retry result receipt. Each ACK run persisted one 30-token host receipt and one 20-token guest receipt and confirmed the host before the three-second fallback.
- No full 229-script census was run on `.22`. The latest `.21` attempts selected all tests but were not clean; see [the census report](qa_runs_012821_browser_retry_20261104/README.md). No hosted deployment, physical-device acceptance, or real-network two-device certification is claimed.

## Remaining acceptance

The candidate is local. A clean candidate-wide browser census, exact-head CI, owner/device acceptance, hosted smoke and protected promotion remain open. Two-device real-network acceptance also remains open.
