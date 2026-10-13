# v0.8.11.1 validation
- `npm test`: PASS, all 21 Node suites (20 existing + new transformation reset).
- New `tests/super_shot_reset.mjs`: verifies transformation starts, expires mid-flight, trail clears, collection resets, second shot may transform again, and kickoff resets.
- `npm run build`: PASS; generated standalone offline HTML includes fix.
- Chromium inline-HTML smoke: PASS, two canvases, no page errors.
- Direct `file://` browser navigation: BLOCKED by test-environment policy.
- Full legacy browser QA suite, physical device/gamepad and long gameplay sessions: NOT rerun, not claimed.
