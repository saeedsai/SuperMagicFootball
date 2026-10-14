# Regression test report — v0.8.23 Alpha

**Executed:** `npm test` 54/54 PASS; `node tests/master_contracts.mjs` PASS; `node tests/v0823_audio.mjs` PASS; dedicated browser audio desktop + simulated mobile PASS; master full browser **35/35 PASS** in six sequential bounded shards.

Shards: master_full_browser_s0of6_v0823: 6/6, master_full_browser_s1of6_v0823_retry: 6/6, master_full_browser_s2of6_v0823: 6/6, master_full_browser_s3of6_v0823_retry: 6/6, master_full_browser_s4of6_v0823_retry: 6/6, master_full_browser_s5of6_v0823: 5/5. Detailed machine-readable reports under `docs/qa_runs/`.

During implementation, a stale goalkeeper cache-version assertion, an older save-export version assertion and the release master-contract version were corrected for the new release. Earlier interrupted/failed intermediate runs are superseded by complete passing reruns; no gameplay engine defect was demonstrated by those version assertions.

**Limitations:** browser navigation to file or localhost origin is blocked in this execution environment, so normal-origin localStorage persistence and real-world audio output remain unverified. Chromium desktop and simulated touch do not certify physical devices, Bluetooth gamepads, Safari/Firefox or a single uninterrupted 35-script browser run. The 365 cataloged acceptance cases are not individually certified.

**Open audio gaps:** no true crossfade, crowd ambience slider reserved, hardware latency/Safari gesture recovery to test.
