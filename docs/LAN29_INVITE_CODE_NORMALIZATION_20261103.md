# LAN29 invite-code normalization — 3 November 2026

## Change

The Online P2P invite-code field now trims surrounding whitespace and normalizes the code to lowercase before validation and submission. Generated room IDs are lowercase hexadecimal and the signaling broker compares room IDs exactly; previously, a pasted uppercase code passed the case-insensitive UI check but could not resolve to its canonical room. The join still goes through normal discovery connection checks and explicit host approval.

## Validation

- `node --test tests/p2p_auto_discovery.test.cjs tests/lan_auto_lobby_flow.test.cjs`: passed. The two-client P2P test submits the generated room code in uppercase with surrounding spaces, verifies the broker receives the canonical lowercase ID, confirms host approval is required, and completes the same match handoff.
- `python -X utf8 tests/p2p_invite_copy_browser_qa.py`: simulated-touch browser verifies invite display, copy action and accessible labeling.
- `python -X utf8 tests/p2p_hosted_discovery_browser_qa.py`: local broker privacy, direct-code routing, host approval and relay acceptance passed. This uses simulated client IPs and is not physical-device or hosted-service acceptance.

## Remaining

Physical two-device and hosted operational acceptance remain separate.
