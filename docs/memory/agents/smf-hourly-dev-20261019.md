# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-26

## Mission
One bounded tested feature per hourly run on existing dev; green exact-head protected main promotion only. Preserve 223 teams/2676 players, six formations, exactly four buttons, 10 Career/Cup slots, SD09, offline/saves.

## Current checkpoint
- 0.11.2.0 dev candidate: role/build/session preview in manual LAN/Online P2P; delayed clipboard reads cannot overwrite reset sessions or manual input. Explicit Apply required. First CI #40374582676/#40374582811 failed 1/849 Node assertion: no-role paste lost prior sender-verification prompt. Fixed by preserving both sender verification and role choice. Retest exact-head.
- Prior 0.11.1.0 `e42233ecb887e0370a98800fa0863d42c0b6d5b8` passed dev Modular #40365269024, dev Full 4+4 #40365269002, main Full #40367360840 and Pages #40367361334. No physical two-device or cross-network acceptance.

## Next smallest action
1. Inspect exact-head Modular and Full 4 Node + 4 Chromium CI; repair failures on dev.
2. Verify protected exact-head promotion and main hosted Pages byte smoke.
3. Test two physical LAN clients and private Online P2P across networks; document TURN limits.
4. Continue counterable four-button Magic Tricks and Player Studio.
5. Improve directional character art with original authored action frames.

## Ownership and exclusions
Only dev/main; sole developer; no extra branches, force-push, security bypass or premature production claim. Other agents' private checkpoints untouched.

## Evidence
Baseline dev/main `e42233ecb887e0370a98800fa0863d42c0b6d5b8`. Preview tests added. First CI failed one legacy no-role guidance assertion; repaired, new exact-head CI pending.

## Cleanup
No roster, save-schema, physics, controls or offline compatibility changes. Hourly cadence continues regardless of pending release.
