# SuperMagicFootball local Chromium QA

**Date:** 1 November 2026  
**Package candidate:** 0.12.24.0  
**Source:** same local uncommitted tree as the Node report in `../qa_runs_01224_node_20261102/README.md`

The Chromium regression census passed **132/132** scripts across four shards with no failures, timeouts, errors or unrun cases. It used the test-only pinned Playwright environment documented in [`BROWSER_QA_WINDOWS.md`](../BROWSER_QA_WINDOWS.md) with Playwright-managed Chromium and `--portable-browser`. Per-shard JSON and Markdown reports are alongside this README.

These browser results validate the local tree. They do not certify Android/iOS devices, real controller hardware, hosted deployment, two-device LAN hardware or owner visual approval of player artwork.
