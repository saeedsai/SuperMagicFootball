# Player abilities — canonical owner specification (2026-10-23)

**Four separate customization categories:**
1. **Super Shot** — exceptional offensive magic, only equipped by selected world-class/elite players; not automatically granted to every player. Existing shot ability levels 1–5 may apply.
2. **Super Defence** — exceptional defensive magic, only equipped by selected world-class/elite eligible defenders (and keeper-specific abilities where supported). Existing defence ability levels 1–5 may apply.
3. **Trick** — a separate rare funny, annoying, magical or disruptive superpower, e.g. banana peel trap, ice patch, bat strike, fireball, freeze, scream, hide ball, teleport. **Not** nutmeg, rainbow flick, roulette, etc. Most players have **no Trick**. **Tricks have no levels.** Individual trick mechanics, fair counterplay, cooldowns, fatigue, visuals and input mappings require implementation and QA before being marked playable. Do not label a selector as playable without gameplay integration.
4. **Dribble Style** — normal movement/ball skill, e.g. nutmeg, rainbow flick, roulette, among ten existing styles. Can be selected for ordinary outfield players. **Dribble styles have no levels.**

**Eligibility:** Rare superpowers (Super Shot, Super Defence, Trick) are opt-in, never automatically granted just by changing a dribble style or a rating. Existing elite equipment may be preserved. Ordinary players have none by default. Player Studio must distinguish **None**, **Keep current**, and permitted equipment choices. World-class/elite entitlement and editor override policy must be explicitly defined before expanding access; never silently equip every player.

**Controls:** Exactly Pass, Shoot, Dribble, Jump. Trick input must be distinct from normal dribble-style selection, preserve existing combinations and be counterable. **Compatibility:** retain old saves, tolerate obsolete `trickLevel` fields without using them, preserve player IDs and roster composition.

**Implementation status at this checkpoint:** Prior 0.9.13.1 incorrectly conflated Trick with Dribble Style and added an unwanted 1–5 Trick tier. Correct that UI and remove dribble tier gameplay modifier. A separate Trick category must be added; catalogue and gameplay mechanics can be released in small tested increments. Do not claim unimplemented magical moves are playable.
