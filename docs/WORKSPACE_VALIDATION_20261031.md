# Local workspace validation — 31 October 2026

**Game:** branch `dev`, source SHA `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`  
**Asset Studio:** branch `dev`, source SHA `3cc0ffa3feda851fce0bf59a4eb0ebbcf502687c`

| Check | Result |
|---|---|
| Football data validator (Python 3.12, UTF-8) | **PASS** — 223 teams, 2,676 players, 84 avatar presets, no errors |
| Football build fixture (Python 3.12, UTF-8) | **PASS** — generated test JS and HTML fixtures |
| Character-plan documentation verifier | **PASS** — 7 documents, 13 milestones, 17 customization families, 8 directions, 10 action groups |
| Python cross-shard auditor tests | **PASS** — 21/21 when called with the installed Python 3.12 executable |
| Football Node suite | **PASS — 1,259/1,259** with Windows Python override |
| Asset Studio unit tests | **PASS — 214/214** |
| Asset Studio contracts and requirement traceability | **PASS — 144/144** |
| Asset Studio browser tests | **BLOCKED** — Playwright is not installed |

Windows test-runner portability fixes were applied: the Python-backed Node wrappers accept `SMF_PYTHON` (Linux still defaults to `python3`), and source/YAML extraction tests normalize CRLF before matching. The entire game Node suite then passed.

The generated game fixtures are ignored test artifacts. Neither repo has been committed or pushed. This local run does not certify GitHub CI, protected promotion, Pages/Render deployment, physical devices or two-device LAN.
