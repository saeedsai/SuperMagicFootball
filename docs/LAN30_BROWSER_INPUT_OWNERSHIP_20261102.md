# LAN30 real-browser ownership and transient recovery — 2 November 2026

The local two-client Chromium acceptance in [`tests/lan_auto_two_browser_qa.py`](../tests/lan_auto_two_browser_qa.py) asserts a real WebRTC guest control through the game bridge. After automatic room discovery and host approval, guest ArrowRight moves the away player slot controlled at input start in host-authoritative state. The matching slot reaches the guest snapshot, while the host-controlled home slot does not inherit the guest direction. Match clock, score, gameplay graphics, and browser exceptions remain checked.

The same test injects a short browser-observed `iceconnectionstatechange` to `disconnected` on each real `RTCPeerConnection`, restores the native getter to its observed `connected` or `completed` state, and dispatches the recovery event. It then confirms a new guest ArrowRight press moves the host-authoritative away slot and the resumed state reaches the guest. The app's readiness and guest input-cursor reset paths are exercised through real Chromium peer objects.

After the match is established, the test also shuts down the local discovery/signaling broker. Both browser peers remain in `connected` state and the live match continues to accept guest input and replicate the away player state over its existing direct WebRTC DataChannel. This verifies that a local signaling-service outage after match setup does not stop the match.

The DataChannels remain open and packets are not dropped during the synthetic ICE transition. Broker shutdown happens only after the direct peer match is established; it does not simulate loss of the peer transport. This is not packet-loss, physical-device, hosted Pages/broker, restrictive NAT, hardware permission, or malicious-client certification. Those LAN29/30 gates remain open.

The latest local run passed with signaling-broker shutdown, **154.6 field units** of away-slot movement during the first input, **7.4 units** of guest replication lag, and `LAN_SYNTHETIC_ICE_RECOVERY_PASS`; page-error checks passed. These are one run's diagnostics, not fixed performance targets.

Run with the project's portable browser runner:

```powershell
$env:PYTHONUTF8='1'
..\.qa-browser-venv\Scripts\python.exe tests/browser_runner_compat.py tests/lan_auto_two_browser_qa.py
```
