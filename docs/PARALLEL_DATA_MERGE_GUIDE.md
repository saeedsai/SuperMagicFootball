# Parallel data editing and conflict resolution

**Applies to:** `dev` modular game, **all seven player shards**, `data/teams.json`, appearance and procedural graphics JSON, and `data/mechanics/gameplay.json`. Preserves the playable game; this is a developer-side dry run / staging tool.

## New command

```bash
python3 scripts/parallel_data_merge.py \
  --base /path/common-parent-checkout \
  --ours /path/agent-a-checkout \
  --theirs /path/agent-b-checkout \
  --check --report /tmp/smf-merge-report.json
```

The arguments must refer to **three full source trees**, each with a `data/` directory. The base MUST be the **common ancestor** used by both agents; using the current dev head as a substitute would conceal conflicts. JSON files in other folders are not considered. No Git history manipulation or network access is performed by the script.

After a clean dry run, stage merged JSON in a **separate empty directory**:

```bash
python3 scripts/parallel_data_merge.py \
  --base /path/common-parent-checkout \
  --ours /path/agent-a-checkout \
  --theirs /path/agent-b-checkout \
  --out /tmp/smf-merged-json
```

The tool never writes to any input tree, and refuses to overwrite a nonempty output. It writes **no data output at all** if there is a conflict. It prints machine-readable JSON containing `status`, `conflictCount`, precise paths and the competing values. `--report` is optional; exit code 0 = no merge conflicts, 1 = conflicts, 2 = incorrect invocation.

## Behavior

- Player and team records are compared by stable `id`, including nested player fields, not just raw file lines. It can merge a change to one player's rating with a concurrent change to their artwork, or separate edits to one player's different scalar fields.
- Conflicting edits to the **same** field (for example two different FC27 values, or opposing skin colors) are **reported and not auto-resolved**.
- Player/team **ID membership or array order changes**, duplicate IDs, missing rosters, and added/removed teams in a shard are blocked to protect team indices and saved-game identities. Changes to numbers and positions still require the game's normal roster-quota validation.
- Scalar option arrays are merged conservatively as atomic values. Independent keys in nested JSON merge recursively.
- A change conflicting with a deletion causes a conflict. Unchanged data is left intact.

## Mandatory quality gates before committing

1. Run the merge check and resolve every conflict by inspecting both agent changes; do not choose the latest timestamp automatically.
2. Copy reviewed output into a fresh checkout of current `dev`, **only if the latest `dev` SHA still matches your integration base**; otherwise repeat the integration against the new head.
3. Run `python3 scripts/validate_data.py`, `python3 scripts/build.py`, `node --test tests/*.test.cjs`, `node tests/club26_fc27_roster.mjs` and `python3 -m unittest discover -s tests -p 'test_parallel_data_merge.py'`.
4. Run the complete sharded Node/Chromium workflow and seeded matches; check the actual results and browser screenshots. Check for graphics appearance overrides with unknown player IDs.
5. Push to `dev` without `--force`; GitHub Actions must pass. Do not alter unrelated agents' graphics/rosters or the historical evidence folder during cleanup.

**Not a substitute for real-world verification:** labels such as `FC27 comparison verified` describe sources reported by other agents; the merge tool cannot verify player transfers, statistical provenance or real facial likenesses. Offline/PWA, real mobile, and browser-restart save certification remain owner-deferred.
## 16 October 2026 — safer numerical references and dry-run previews

The checker now **rejects a team numeric `index` change** even when an agent preserves the team's string `id` and its array position. This includes the case where both agents independently make the same invalid edit. Team index is used in saved progress and selection mappings; a deliberate migration requires a separately reviewed schema change, not an automatic data merge.

Every CLI JSON response and `--report` file now includes `changeSummary`. For each edited protected file it records separate `ours`, `theirs` and `merged` change **counts** and up to 25 precise stable-ID-based `paths`; `truncated: true` means further paths exist. Structural list changes appear as a single array path. The summary is informational, never permission to override `conflicts`; `--check` still writes no merged data. New Python regression tests cover unilateral/mutual index changes, independent edits, output immutability and preview truncation. These changes affect tooling only; no game or roster JSON was edited.

## 16 October 2026 — appearance-reference safety and report isolation

The complete three-way merge now cross-checks every merged `data/graphics/player_appearances.json` team/player key against the **merged** team catalog and all seven merged player shards. A dangling team or player appearance is a blocking conflict (with the exact artwork key path), even if the agents made independent, otherwise mergeable edits. Partial-file `compare_directories(..., paths=...)` calls skip this whole-dataset invariant; run the full default tool before staging any merged data. This complements, but does not replace, `scripts/validate_data.py`.

`--report` must be outside the three input source trees and outside `--out`. This closes an overwrite risk where a seemingly read-only `--check --report` could previously replace an existing source JSON with a QC report. A rejected report path exits with CLI usage error code 2 **before** reading or writing the merge result. New isolated Python regressions cover dangling graphic team/player references, a valid appearance update and source-report overwrite rejection. Keep the owner-prioritized goalkeeper diving work in the separate gameplay workstream.

## 16 October 2026 — sourced player field review flags (advisory)

The three-way tool now emits a **`sourceReview`** section next to `changeSummary` in every command-line response and optional `--report` JSON file. For any merged `data/players/*.json` record whose stable player ID exists in both base and result, it lists **sensitive field changes** requiring human source review, including name, role, shirt number, nationality, DOB/age, height, rating, FC27 ID/position/face statistics and the gameplay power/shoot/defense attributes.

Each review entry includes `path` (stable team and player IDs), `changedFields`, and `sourceMetadataChanged` (fields such as `source`, `ratingSource`, `sourceSnapshot`, `fc27OfficialCheckedAt` or verification annotations modified in the same record). The field `needsSourceReview: true` means **a reviewer should compare reliable FC27/club records**; it does **not** mean the supplied URL or changed metadata was checked or authenticated. Changes to presentation-only fields (e.g. `shotName`) do not themselves add review flags. The report counts all affected players but shows at most **25 entries**, with `truncated: true` when others remain.

Example informational response fragment:

```json
{
  "sourceReview": {
    "count": 1,
    "entries": [{
      "path": "data/players/club26.json/club26_0/id=club26_0_0",
      "changedFields": ["heightCm", "rating"],
      "sourceMetadataChanged": ["source"],
      "needsSourceReview": true
    }],
    "truncated": false
  }
}
```

**This is a review cue, not another merge blocker.** Existing conflicting edit detection, immutable team/player ID/ordering checks, graphics-reference validation, dry-run immutability and no-overwrite safeguards remain unchanged. No game or player data is automatically changed; editors must continue independently confirming FC27 values or trusted fallback sources. [Implementation and QA checkpoint](MERGE_SOURCE_REVIEW_HANDOVER_20261016.md).
