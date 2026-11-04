# Candidate 0.12.37.0 browser regression census — 2 November 2026

Source tree: `dev` at `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d` plus the current uncommitted candidate integration. Portable Chromium ran four independent browser shards across desktop and simulated-touch viewports: **154/154 scripts passed**, with zero failures, timeouts or runner errors. Raw JSON and Markdown shard results are retained here.

The separately focused Training Cross coach browser acceptance passed on desktop and simulated touch. General save export/import acceptance also passed on both: verifies the 13-key export envelope, cancel/no-write behavior, malformed and oversized input rejection without storage mutation, and successful restore after reload.

The broad census is local browser evidence. Exact-commit CI, hosted Pages, physical devices and owner visual review remain separate.
