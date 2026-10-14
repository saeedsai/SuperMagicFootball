# Browser regression evidence — v0.8.24.7

`BROWSER_EXECUTION_v08247.csv` lists the 40 distinct Chromium scripts executed during this iteration. Some inherited tests initially failed on obsolete direct-home navigation assertions; reruns passed after the tests followed the new menu paths. A single all-shard master runner invocation was interrupted in this environment, so the 40/40 status describes completed individually-run scripts and targeted reruns, not one uninterrupted batch. This is Chromium/headless and simulated touch, **not** physical hardware certification.

Temporary screenshots and per-run legacy outputs were not included in the cleaned release. The runnable test scripts are retained under `tests/`.
