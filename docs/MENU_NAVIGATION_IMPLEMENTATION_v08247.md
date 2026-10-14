# Supermagic Football — five-category menu implementation (v0.8.24.7)

**Basis:** `SuperMagic_Football_Menu_Layout_Handoff.md`, provided by the user.
**Scope:** navigation and accessibility only. Existing engine, seven BPW teams, formations, ability combinations, progress and settings storage are preserved.

## Five primary choices

1. **Quick Match** → On Device → Single Player vs CPU / Two Players on Same Device / Penalty Shootout / Training Arena. Local Network is visibly Coming Later.
2. **Online** → Online Match / Ultimate Team / Online Career / Online Cup or League. All four Coming Later. No network backend is claimed or used.
3. **Career** → Continue (when a career exists), New Career, Career Management, Save Management. New Career asks before replacing existing progress. Current career system is reused.
4. **Leagues & Cups** → International (World Cup, Asian Cup, Euro, Copa América, Africa Cup, CONCACAF; later), Clubs (existing six **Continental Championships** playable, named leagues/cups later), original playable World League, Custom Cup and Custom League (later). A generic match is never presented as World Cup or Champions League.
5. **Settings** → Game Settings, Graphics, Sound, Player & Team Customization, Input Settings, Save Management, How to Play. Existing functional settings and editors are reused.

## Navigation behavior

- Home has precisely five large categories in the specified order. Continue Career, Fullscreen and About appear only as secondary shortcuts.
- Responsive desktop dual-column / narrow single-column with safe vertical scroll; no extra remote assets.
- Visible Back links and Escape/Backspace go to the parent menu. Keyboard arrows/Enter/Space and gamepad D-pad/A/B are supported in menus. Gamepad behavior tested with simulated Gamepad API only, not physical hardware.
- Keyboard focus on home defaults to Quick Match, and restores previously selected category on return.
- Planned modes display a clear Coming Later information view; they never launch another mode.
- Pause supports Resume, Restart (with confirmation), live sound settings, live tactics and Return to Main Menu (with confirmation). Canceling exit preserves paused match.
- The only in-match actions remain **Pass, Shoot, Dribble and Jump**. No fifth football control is added.

## Existing feature placement mapping

| Former home item | New route |
|---|---|
| Quick Match | Quick Match → On Device → Single Player vs CPU |
| Two-player Versus / Penalty Challenge / Training Arena | Quick Match → On Device |
| Continental Cups | Leagues & Cups → Clubs → Continental Championships |
| Manager Career | Career → Career Management / Continue Career |
| World League | Leagues & Cups → World League · Arcade |
| Squad / Tactics | Settings → Player & Team Customization → Squad & Tactics; also existing match setup/pause |
| Player Studio / Create Club / Roster Editor / Shot Encyclopedia | Settings → Player & Team Customization |
| Sound, difficulty and controls | Settings → respective functional categories |
| Save import/export | Settings → Save Management; Career → Save Management |
| How to Play | Settings → How to Play |

## Limitations

- Real-origin storage persistence and physical gamepad/mobile hardware require external device validation; synthetic storage and controller-browser checks passed.
- Named licensed competition structures and online/local-network multiplayer are not yet implemented; they remain clearly labelled Coming Later.
- The user-requested Super Defense and Tricks backlog remains deferred; routine 2026 roster corrections remain postponed.
