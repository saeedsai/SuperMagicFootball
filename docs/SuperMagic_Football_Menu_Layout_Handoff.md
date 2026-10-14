# SuperMagic Football — Menu Layout & Navigation Handoff

**Purpose:** Design and implement a simple, polished, responsive HTML main menu for SuperMagic Football, while preserving the existing game code and playable modes.

**Reference build:** `SuperMagic_Football_v0.8.24.5_Menu_Play.html` (use the latest source supplied to the development chat as authoritative).  
**Document type:** Proposed UI/UX and implementation specification; this document is **not** a claim that every listed screen or game mode already works.

## 1. Design goals

- Five clean **top-level** menu options: **Quick Match**, **Online**, **Career**, **Leagues & Cups**, **Settings**.
- No enormous dashboard of tiny actions on the home page. Show details only after entering a category.
- Cartoon/arcade football presentation consistent with the current game: deep navy/teal, football-pitch green, warm gold highlights, bold typography.
- Usable on **desktop, landscape mobile, touch, keyboard, and gamepad**.
- Distinguish implemented modes from **COMING LATER** items. A disabled or placeholder entry must never silently start the wrong mode.
- Keep the main menu fast to navigate, with predictable **Back** actions and no accidental loss of progress.

## 2. Main menu layout

### Desktop / tablet landscape — two-column recommendation

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ SUPERMAGIC FOOTBALL                                        v0.8.xx       │
│ Arcade Football • Super Shots • Your Football Universe                   │
├───────────────────────────────────┬──────────────────────────────────────┤
│                                   │                                      │
│  ▶  QUICK MATCH                   │   [football-pitch artwork / game     │
│                                   │    screenshot / animated preview]    │
│  🌐 ONLINE             LATER      │                                      │
│                                   │    Featured mode / small status      │
│  ★  CAREER                        │    controls hint                     │
│                                   │                                      │
│  🏆 LEAGUES & CUPS                │                                      │
│                                   │                                      │
│  ⚙  SETTINGS                     │                                      │
│                                   │                                      │
├───────────────────────────────────┴──────────────────────────────────────┤
│ [Continue, only if valid save exists]   [Fullscreen]   [Credits]         │
└──────────────────────────────────────────────────────────────────────────┘
```

Use large full-width buttons in the left column, each with an icon, label, subtle subtitle, and focus/hover state. The right panel is visual decoration and can hide on small screens. **Quick Match** is the default focused option; **Continue** is a conditional shortcut, not a sixth top-level category.

### Mobile portrait / narrow landscape — single column

```text
┌──────────────────────────┐
│  SUPERMAGIC FOOTBALL     │
│  v0.8.xx                 │
│                          │
│  ⚽ QUICK MATCH          │
│  🌐 ONLINE       LATER   │
│  ★  CAREER               │
│  🏆 LEAGUES & CUPS       │
│  ⚙  SETTINGS             │
│                          │
│  [Continue if save exists]│
│  [Fullscreen]  [Credits] │
└──────────────────────────┘
```

The menu must scroll vertically on constrained screens, maintain sufficiently large touch targets (roughly 44 CSS pixels minimum), respect device safe areas, and avoid horizontal scrolling.

## 3. Navigation tree — requested scope

```text
MAIN MENU
├─ QUICK MATCH
│  ├─ On Device                         [ACTIVE if local match available]
│  │  ├─ Single Player vs CPU
│  │  └─ Two Players on Same Device      [only if supported]
│  └─ Local Network                     [LATER until LAN multiplayer works]
│
├─ ONLINE                               [LATER — submenu may be browsable]
│  ├─ Online Match                      [LATER]
│  ├─ Ultimate Team                     [LATER]
│  ├─ Online Career                     [LATER]
│  └─ Online Cup / League               [LATER]
│
├─ CAREER
│  ├─ Continue Career                   [if compatible save exists]
│  ├─ New Career                        [if existing career workflow supports]
│  └─ Load / Manage Career              [LATER if not supported]
│
├─ LEAGUES & CUPS
│  ├─ International
│  │  ├─ World Cup                       [enable only with complete tournament flow]
│  │  ├─ Asian Cup                      [LATER]
│  │  ├─ Euro                           [LATER]
│  │  ├─ Copa América                   [LATER]
│  │  ├─ Africa Cup                     [LATER]
│  │  └─ CONCACAF Cup                   [LATER]
│  ├─ Clubs
│  │  ├─ Champions League               [enable only if corresponding competition works]
│  │  ├─ Europa League                  [LATER]
│  │  ├─ Premier League                 [LATER]
│  │  ├─ Serie A                        [LATER]
│  │  ├─ Bundesliga                     [LATER]
│  │  ├─ La Liga                        [LATER]
│  │  └─ Ligue 1 (France)               [requested; verify mode readiness]
│  ├─ Custom Cup                        [LATER until complete]
│  └─ Custom League                     [LATER until complete]
│
└─ SETTINGS
   ├─ Game Settings
   ├─ Graphics
   ├─ Sound
   ├─ Player & Team Customization
   └─ Input Settings
      ├─ Keyboard
      ├─ Gamepad
      └─ Touch
```

**Important:** “ACTIVE” is not guaranteed by the naming alone. Inspect the current source and existing gameplay route before enabling an item. If a mode exists under a different name, connect the menu to that mode without deleting its logic. If it does not exist, show a clear **Coming Later** screen.

## 4. Screen-by-screen layout

### 4.1 Quick Match

```text
← BACK       QUICK MATCH

[ ⚽ ON DEVICE          > ]
  Play locally against CPU / another player if supported

[ 📡 LOCAL NETWORK      LATER ]
  Play with devices on the same network (future feature)
```

The On Device route should open the existing match setup: team selection, side/control assignment, kits (if available), match options, **Start Match**, and **Back**. Do not add a duplicate match engine.

### 4.2 Online

Show the four requested entries, all visibly marked **COMING LATER**. Optionally allow tapping an entry to view a concise feature description, but do not suggest multiplayer connectivity exists yet. Avoid collecting account details without a backend.

### 4.3 Career

Use an obvious **Continue Career** button when save data is present; otherwise highlight **New Career**. Reuse the existing career manager screens and data persistence. Warn before overwriting or resetting a current save.

### 4.4 Leagues & Cups

First-level page:

```text
← BACK         LEAGUES & CUPS

[ 🌍 INTERNATIONAL              > ]
[ 🏆 CLUBS                      > ]
[ ➕ CUSTOM CUP            LATER ]
[ ➕ CUSTOM LEAGUE         LATER ]
```

International and Clubs open simple vertical competition lists. Each option has a competition name and a single status indicator. When an enabled competition is selected, use a dedicated competition setup/overview screen with team selection, fixture schedule, standings or bracket, and progression where those systems actually exist. Do **not** relabel a generic friendly match as World Cup or Champions League.

### 4.5 Settings

```text
← BACK             SETTINGS

[ GAME SETTINGS                 > ]
[ GRAPHICS                      > ]
[ SOUND                         > ]
[ PLAYER & TEAM CUSTOMIZATION   > ]
[ INPUT SETTINGS                > ]
```

Suggested subcontrols (implement only when the underlying feature exists):

| Category | Suggested controls |
|---|---|
| Game Settings | Match duration, difficulty, camera, game speed, arcade assists |
| Graphics | Quality/performance preset, effects, fullscreen, animation quality |
| Sound | Master volume, music, SFX, crowd/ambience, mute |
| Player & Team Customization | Player appearance, kits/colors, names, roster edits; preserve data compatibility |
| Input Settings | Keyboard bindings, gamepad mappings, touch layout/sensitivity, controls reference |

Do not present decorative sliders as functioning settings. Changes should persist safely and, where possible, apply immediately. Include **Restore Defaults** confirmation on destructive resets.

## 5. Visual system

| Element | Recommendation |
|---|---|
| Background | Deep blue/teal gradient with subtle football pitch lines |
| Primary buttons | Dark teal panels with clear icon and large white label |
| Highlight | Gold/yellow for currently selected action; cyan for focus outlines |
| Status | Neutral **COMING LATER** text for unfinished modes, no misleading active state |
| Fonts | Bold, readable system sans-serif; avoid tiny all-caps on phones |
| Animation | Light 120–200ms transitions; honor `prefers-reduced-motion` |
| Responsive | Two columns for roomy landscape; one column for phones |
| Accessibility | Contrast, semantic buttons, visible focus, screen-reader labels |

Prefer CSS/vector pitch illustration or existing game artwork; do not require remote image assets or internet connectivity.

## 6. Navigation / input behavior

1. **Enter / Space / gamepad A / touch**: activate focused item.
2. **Arrow keys / D-pad**: move selection; keep focus in the current menu.
3. **Escape / Backspace / gamepad B**: go back one level; from match/pause follow the game's existing confirmation rules.
4. Each child menu includes a visible **← Back** control and its parent title.
5. Store menu history in a small stack or explicit parent mapping; avoid string-based ad hoc back navigation.
6. Focus the selected menu item after returning from a child screen.
7. In-game **Pause** should include **Resume**, **Restart** (confirmation), **Settings** (if safe), and **Return to Main Menu** (confirmation).
8. Avoid conflicts with movement/action keys while a menu is open.

## 7. Technical implementation notes

- **Preserve the single-file playable HTML architecture** if that is the delivery requirement. Keep all required assets inline or offline-compatible.
- Build menu screens with reusable rendering helpers, e.g., `showMainMenu()`, `showQuickMatchMenu()`, `showOnlineMenu()`, `showCompetitionsMenu(section)`, `showSettingsMenu()`; adapt names to existing conventions.
- Reuse current functions for match setup, manager career, clubs/continental campaigns, player editors, audio and fullscreen. Do not create competing state stores.
- Prefer an explicit action registry with fields such as `id`, `label`, `route`, `availability`, and `description`.
- Treat `availability: 'later'` as **non-playable**, even if its card is visible/clickable for information.
- Keep user saves, roster IDs, settings keys, gameplay mechanics, and input mappings backward compatible.
- Check that returning from match/career restores the menu and does not leave invisible interactive overlays.
- For new modes, create **separate tasks**; this specification is primarily a **menu/navigation change**, not an instruction to implement full network multiplayer or new tournaments.

## 8. Acceptance criteria and regression checklist

- [ ] Exactly five primary categories, in the requested order.
- [ ] Every listed submenu appears with correct name and hierarchy.
- [ ] All unfinished items are clearly **COMING LATER** and cannot accidentally start another mode.
- [ ] Quick Match → On Device → existing setup → playable game works.
- [ ] Career entry opens existing career screen without save loss.
- [ ] Existing functioning competition entry points are preserved.
- [ ] Settings opens actual settings/customization functions without breaking persistence.
- [ ] Back navigation works at every nesting level.
- [ ] Mouse, touch, keyboard, and gamepad navigation tested (where supported).
- [ ] Desktop, mobile portrait, and mobile landscape checked for overflow and touch targets.
- [ ] Pause → Return to Main Menu → Quick Match works repeatedly.
- [ ] Existing audio, fullscreen, HUD, gameplay, team selection, and saves pass regression tests.
- [ ] No console errors or unexpected network dependencies in offline mode.
- [ ] Deliver updated standalone playable `.html`, change summary, and test results.

## 9. Suggested future additions (not part of the required five options)

- **Training / Practice**: controls, combinations, special shots and penalty practice.
- **Continue** smart shortcut: available only when saved match/career state can be resumed.
- **Penalty Shootout** as an On Device quick match variant, once fully implemented.
- **Tournament Hub**: brackets, group tables, fixtures, results, scorers and trophies.
- **Save Management**: multiple career slots, backup, import/export.
- **Accessibility & Languages**: scalable UI text, color-blind-friendly markers, localization.
- **Credits / About / Version** in a small footer or secondary panel, not as new top-level menu entries.

## 10. Suggested development-chat handoff prompt

> Use the attached `SuperMagic_Football_Menu_Layout_Handoff.md` as the authoritative **menu layout and navigation specification**. Apply it to the latest SuperMagic Football HTML source. Keep the game playable and all existing features, input systems, saves, and gameplay mechanics intact. Verify which underlying modes work before making them active. Mark missing modes Coming Later, with no fake gameplay. Implement responsive mouse/touch/keyboard/gamepad-friendly navigation and test it along with existing Quick Match, Career, competitions, Settings, pause/resume, fullscreen, and save behavior. Deliver an updated single-file playable HTML, the implemented-vs-pending list, and a concise regression test report.
