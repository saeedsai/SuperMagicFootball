# Browser regression setup on Windows

The bounded browser census uses Python Playwright and a Playwright-managed Chromium. Install its test-only dependencies in an isolated virtual environment; these are not game runtime dependencies.

```powershell
$qaVenv = Join-Path $env:LOCALAPPDATA 'SuperMagicFootball\browser-qa-venv'
python -m venv $qaVenv
& "$qaVenv\Scripts\python.exe" -m pip install -r .\requirements-browser.txt
& "$qaVenv\Scripts\python.exe" -m playwright install chromium
$env:PYTHONUTF8 = '1'
python .\scripts\build.py
Copy-Item .\tests\.generated\play.html .\play.html
```

Run one or more of the four browser shards from the repository root:

```powershell
for ($shard = 0; $shard -lt 4; $shard++) {
  & "$qaVenv\Scripts\python.exe" .\tests\full_regression_runner.py `
    --category browser --shard-index $shard --shard-count 4 --timeout-seconds 75 `
    --portable-browser `
    --out-dir docs/qa_runs_full_regression_windows
  if ($LASTEXITCODE -ne 0) { throw "Browser shard $shard failed" }
}
```

`full_regression_runner.py` routes each suite through `browser_runner_compat.py`. On Windows the bootstrap translates legacy `/usr/bin/chromium` arguments to Playwright's installed executable; on other systems it leaves launch paths unchanged. Legacy readiness version expectations are adjusted in memory to the package version, so local QA does not rewrite the browser test files. Set `SMF_CHROMIUM_PATH` only when using a specific compatible Chromium build.

The census runner forces UTF-8 mode in each child interpreter and decodes captured output as UTF-8 (replacing malformed bytes rather than crashing). It also writes its JSON and Markdown shard reports explicitly as UTF-8. This matters for the generated `play.html`, which contains Unicode art/code points that Windows' legacy code page cannot decode.

The report directory contains per-shard JSON and Markdown evidence. A complete bounded census requires all four shards to pass on the same source tree; this does not certify physical devices, hosted deployment or human visual approval.
