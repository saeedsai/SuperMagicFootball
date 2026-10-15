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