# Supermagic Football — v0.8.24.12 Alpha changelog

- Added purely observational release-context snapshots (shot distance, defender pressure, goalkeeper position, fatigue, ball speed) in the optional match telemetry sidecar. No goalkeeper or shot physics retuned.
- Added six acceptance cases and two new Node suites covering snapshot validity/nonmutation and 30 varied seeded full-engine controller matches.
- Retained the existing 45-match historical replay data separately; output from the new cohort is `docs/HUMAN_CPU_CONTEXT_REPLAYS_v082412.json`.
- Rebuilt portable HTML and updated game version, PWA cache and save-export version; preserved all existing teams/modes/inputs/roster IDs.
- Cleaned generated test images, transient browser exports, caches and old current-run fragments from the release ZIP, while preserving historical specifications and QA evidence.
- The full regression record and device limitations are documented in `docs/TEST_REPORT_v082412.md`.
