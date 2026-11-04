# UX-27 real service-worker offline navigation acceptance

**Date:** 3 November 2026  
**Scope:** Local game source served over HTTP; Chromium desktop and simulated-touch contexts.

## Acceptance result

The browser test installs and controls the page with the actual service worker, then disconnects the browser from the network. Both the scope-root route and a query-string app route recover the cached game shell and initialize the game. A request for an uncached data file rejects instead of receiving the app HTML fallback. No page errors were observed.

## Commands and results

Run from the game repository root:

```powershell
python tests/browser_runner_compat.py tests/ux27_offline_service_worker_browser_qa.py
```

**PASS** — desktop and simulated-touch; root and query-string navigation recovered offline, and the missing data request failed closed.

```powershell
node --test tests/service_worker_offline_navigation.test.cjs
```

**PASS** — 3/3 tests: root fallback, query-string fallback, and no HTML fallback for non-navigation requests.

## Limits

These checks use a local HTTP origin and simulated touch. They do not verify hosted Pages bytes, another browser engine, physical devices, or long-term/power-loss persistence.
