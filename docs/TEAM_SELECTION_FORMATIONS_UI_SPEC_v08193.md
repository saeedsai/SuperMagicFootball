# v0.8.19.3 — Team Selection and Formation UI Specification
**Date:** 14 October 2026. **Status:** Implemented in playable build; physical-device QA remains open.

## Career: continent → country → club
- Before creating a career, select **continent**, then **country**, then a **club filtered to that country**. Filter lists refresh without changing saved careers; the club chosen when pressing Start Manager Career is respected.
- Geography follows the installed 2026 clubs' country flags and six confederation associations. Unknown/unmapped clubs can fall back to OTHER; missing data must not silently classify an unrelated nation as UEFA.
- The filtering covers 165 existing manager-eligible `club26` and `continental` clubs; no fictional additional selectable clubs were invented for this UI task.
- Existing saved careers, domestic fixtures, budget, scouting, transfers and contracts are not rewritten by this screen change.

## Team flags/crests while browsing
- Quick, Versus, Penalty, Training and League share the match selector. The selector retains a native accessible select **plus** a visual **Browse Flags / Crests** list with search and team names.
- Continental Cup club selection, new Manager Career selection, transfer market, player customization and roster editor also expose the visual picker.
- Selectable browse rows display the existing original generated club crest and stylized national flag; no external logos or copyrighted photography are required. SVG graphics are embedded and work offline.
- The visible flag/crest next to the selected native dropdown updates when selections change. Visual browser search is deliberately limited to 60 displayed matches at a time; typing searches the entire currently available list. Keyboard users can continue using native selectors.

## Team Command Center player faces and formations
- Display procedural cartoon faces from each player's actual appearance data on the roster cards and every active slot of an interactive formation-board preview. Update the board when the formation or a starter changes; the face is a canvas portrait, not a football emoji.
- Every formation has **six playing positions**, first slot reserved for a goalkeeper, matching the actual six-per-side arcade engine. Existing **1-3-1** is retained.
- The requested **1-1-3** formation contains 1 defender, 1 midfielder and 3 forwards (plus 1 goalkeeper). The requested **3-1-1** formation contains 3 defenders, 1 midfielder and 1 forward (plus 1 goalkeeper). The previously invented 1-1-3-3-1-1 adaptation has been removed.
- Positional labels beside the six starter dropdowns update immediately when the formation changes. Saves continue to use the existing `teamPlans` format.

## QA requirements
- Navigation: all six confederations; country partitions do not drop/duplicate club options; choose Brazil/Flamengo, South Africa/Mamelodi Sundowns, etc.
- Icons: visible while scrolling and searching team choices in quick match and cups; correct flag/crest and the native current selection agree after choosing.
- Formation board: six portraits, including keeper; renders non-empty pixels, remains in card bounds, updates on formation change and has no ball-emoji placeholders in the roster.
- Regression: career creation, recruiting and contracts; save import/export, match setup and kick-off, four-button input; all full Node tests and inherited browser suites, plus new desktop/simulated mobile UI checks. Actual device confirmation remains open.


## Formation correction — 14 October 2026
A prior release misread the request as `1-1-3-3-1-1` and invented a scaled preset. That was not intended and has been removed. The correct additions are **1-1-3 (1 DF, 1 MF, 3 FW)** and **3-1-1 (3 DF, 1 MF, 1 FW)**, each plus GK. The existing 1-3-1 remains. No additional gameplay mechanism or team-size mode has been created.


### v0.8.19.5 calculated OVR addendum

Formation labels include each player's calculated OVR for the assigned GK/DF/MF/FW slot, recomputed whenever the chosen formation or starter changes. The adjacent roster displays natural-position OVR; Career/market/scout lists use natural roles. Portrait labels/OVR are stacked under the face rather than obscured by global canvas positioning. Six canonical formations remain unchanged. See `POSITION_OVR_SPEC_v08195.md`.
