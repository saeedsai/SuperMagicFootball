# Candidate 0.12.81.44 — local validation (5 November 2026)

## Scope

- Unexpected synchronous exceptions in an authoritative online-match `engine.step()` or the post-step snapshot getter are caught within that match session and return the bounded `engine-error` result.
- Matchmaking stops and removes only the failed match, clears its interval and pending input buffers, releases the participants' active-account slots, and does not settle a match result or reward. Online Career fixtures return to the reserved state for a later retry.
- This avoids an engine fault escaping the shared Node timer callback and taking down every online room. It does not introduce a client-facing error message.

## Focused validation

- `node --test tests/online-match-session.test.cjs tests/online-matchmaking.test.cjs`: **33/33 passed**, including thrown `step()` and snapshot getter failures, match cleanup and account-slot release.
- After updating all release/version/cache metadata to .44, `npm run test:node` passed: build **5,172,130 JS / 5,295,142 HTML characters**, tracked Node suite **2,222/2,222**, and the Club26/FC27 executable passed. Release/version contracts passed **22/22** and `git diff --check` passed.

## Limits

No live host crash/fault-injection drill or client notification behavior was tested in .44; candidate .45 now adds typed notification to both clients. No result or reward is written when a match fault occurs; on a production host this behavior still needs an operator-visible health/error signal. Exact-head dev Census [41977662466](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41977662466) and Modular QA [41977662471](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41977662471) passed, followed by Pages deployment [41978664030](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41978664030) and main Census [41978663515](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41978663515). No authenticated-user live match or on-host fault drill is evidenced.
