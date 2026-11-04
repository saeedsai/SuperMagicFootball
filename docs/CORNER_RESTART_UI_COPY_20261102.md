# Corner restart status copy — 2026-11-02

Updated the Team Command Center to state that corner kicks are playable and identify how the saved taker is used. It now describes the supported foul trigger: a successful grounded slide from behind on a moving carrier. The copy also states that other foul rules, cards and penalty handling are not implemented.

Validation: `node --test tests/corner_restart_ui_copy.test.cjs` — **1 passed, 0 failed**. The structural regression scopes its checks to the Team Command Center set-piece section, checks the limited trigger and remaining gaps, and rejects stale unavailable-restart claims.
