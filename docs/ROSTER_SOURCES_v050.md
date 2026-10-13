# 2026 squad/club reference and editorial-data policy

## Sources used in v0.5

1. [FIFA October 2026 top 32 ranking summary](https://b-empiremagazine.com/en/classement-fifa/) (accessed October 13 2026 in this development session). Ranking identified: Spain, Argentina, France, England, Portugal, Brazil, Morocco, Belgium, Netherlands, Mexico, Colombia, Switzerland, Germany, Croatia, Italy, USA, Japan, Senegal, Norway, Uruguay, Denmark, Austria, Iran, Ecuador, Egypt, Australia, Canada, Algeria, Côte d'Ivoire, Nigeria, Turkey, South Korea.
2. [Opta ranking, top 30 clubs, dated 2026](https://nigeriasport.ng/news/top-30-football-teams-world-opta-rankings): 30 clubs were taken from the published list; AC Milan and Flamengo were added as editorial selections for 32.
3. [openfootball World Cup 2026 national squads](https://github.com/openfootball/worldcup.json/blob/master/2026/worldcup.squads.json) for international player-name sampling and club affiliations; the dataset has 48 nations, 26 members each. This is a community-maintained file, **not official licensing or certified live squads**.

## Interpretation

- All 83 teams have twelve **game-design roster slots**. Modern countries are **2026 editorial selections**, not necessarily a date-accurate starting XI, official World Cup squad or perfect top-12 representation.
- Clubs use real names found in the dataset where possible; insufficiently documented slots have explicitly fictional `Academy Prospect` names (see `fictional` fields). Real club players may have changed clubs since the sampled source.
- Iconic selections are time-window fantasy teams; they are NOT historical official 12-person match lineups.
- Face appearances are unique deterministic caricatures, seeded from **name** and partly curated for popular players. They are not verified facial likenesses or photorealistic portraits.
- Physical ratings, speed grades, age, transfer value, XP, signature shot and formation assignments for modern players are **fictional balancing values**.
- The original game and its copyrighted graphical and musical assets are not redistributed; art is generated in the Canvas renderer.
