# BPW — Best Players in the World Era Squads (backlog, not implemented)

## Request and exact structure

Replace the **six existing legend teams** with the six BPW era squads **1998, 2002, 2006, 2010, 2016 and 2020**, and add a **seventh** BPW team representing **2026**. Exactly **12 players each**: **2 GK + 3 DF + 4 MF + 3 FW**. Wingers may be classified as MF or FW, but must declare one primary broad role. That is **84 BPW roster slots** overall.

**Interpretation note:** 1998, 2002, 2006 and 2010 are World Cup years; **2016 and 2020 are not men's FIFA World Cup years**. Until clarified, label all teams *BPW [year]* as best-of-era selections rather than misleadingly branding 2016/2020 as official FIFA World Cup squads. The 2026 team is a distinct modern all-star squad.

## Identity and exclusivity rules

1. A real player has one **canonical global person ID**. The same club and national-team appearances reference the same identity, birth date, base caricature ID, and core stats. Team-specific kit, role, condition and current form are memberships, not duplicate people.
2. No player may appear in **more than one BPW year**. Eg if an athlete is included in 2010, they cannot be selected for 2016, 2020 or 2026 BPW. Test across all seven teams.
3. A BPW selection may **reuse an athlete already playing at club or national level**; create a distinct **BPW variant** with `variantOf` pointing to their canonical person ID. BPW may receive higher stats, era kit, and individualized super abilities. This is the sole authorized player-instance duplication.
4. Each of the **84 BPW slots** must have an exclusive, artist-reviewed, distinguishable cartoon face, and a player-specific super-shot or defensive move; goalkeepers may have keeper super abilities. Do not reuse reserved face presets in the ordinary player creator.
5. Before merging, run cross-era unique-person checks, exact role-count checks, and availability/era-source checks. Store the selection criteria (dominance or peak in that era), year, original role, supporting source and version.

## Non-goals for v0.8.9

No BPW lineup replacement, stat boosts, artwork, move assignments, transfers or save migration has been applied. The 6 existing historical teams remain available and unchanged. This is a staged, independently testable later content milestone, after the current four-button/UI work and prioritized roster verification.
