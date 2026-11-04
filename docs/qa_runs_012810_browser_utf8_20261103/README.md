# Candidate 0.12.81 browser regression census — 3 November 2026

## Result: local Windows/Chromium pass

The complete four-shard browser census discovered, executed and passed **218/218** QA scripts before the final LAN broker rate-window-only patch in the same `.81` source candidate. Per-shard counts are 55, 55, 54 and 54; the independent shard auditor confirmed every script ran exactly once and no failures, timeouts, missing reports or duplicated assignments exist.

Run with Python 3.13, Playwright-managed Chromium and UTF-8 mode on Windows. Each browser context loads the generated candidate page. Reports and the independent audit are stored beside this file. The census includes the child-route menu icon/accessibility, responsive route, and two-browser LAN result-acknowledgement tests. After the later broker patch, the three LAN/WebRTC browser scripts (`lan_auto_two_browser_qa.py`, `lan_render_hosted_browser_qa.py`, `lan_two_client_browser_qa.py`) were rerun successfully; the broker patch does not alter browser game assets.

This is local browser evidence for the uncommitted 0.12.81 source tree, not CI for an exact commit. It does not establish physical-device or screen-reader acceptance, owner visual approval, hosted deployment, or independent-network service readiness.
