# Candidate 0.12.81.48 — local validation (5 November 2026)

## Change

The production online-account HTTP bridge's exact-path allowlist now forwards the authenticated `/api/v1/ultimate-team/lineup` GET/PUT and `/api/v1/online-career/seasons` GET routes already handled by the account API. The adapter continues to reject unknown nested paths and retains its bounded streaming, authentication, timeout, request-header and response-header rules.

## Local validation

- Build: **5,178,925 bundled JS characters / 5,301,937 HTML characters**.
- Full `npm run test:node`: **2,245/2,245 Node tests passed**; Club26/FC27 executable passed (32 clubs / 384 slots, 2/3/4/3; FC27 editorial 12).
- Focused production HTTP adapter suite: **14/14 passed**, including lineup GET/PUT, Career archive GET, forwarded response/body and nested-path rejection.
- Release/version contract suites: **16/16 passed**.
- `git diff --check` passed.

## Exact-head and external gates

Candidate .48 is local and has not yet been committed or pushed. Its exact-head Full Regression Census, Modular QA, protected promotion, Pages deployment, main regression, and hosted byte smoke remain pending. Public OIDC/API configuration and live PostgreSQL are not configured; this route fix does not enable public online play by itself.

Previous candidate .47 was pushed as SHA `c14314ef9ce04709b4bbf7f3e6a77a8919e847ae`; dev Full Regression Census [41986894087](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41986894087), Modular QA [41986894241](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41986894241), current-player graphics QA [41986894077](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41986894077), protected promotion, and Pages deployment [41988039780](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41988039780) passed. Main Census [41988039900](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41988039900) is still running.
