# Three-module front-view pilot

This pilot tests the fallback requested by the owner: one complete body without the head, one bald face/head, and one hair module. It starts from the full front standing source image and cuts all three modules on the original 1024 × 1024 canvas through SuperMagicAssetStudio's `partitionImage` command.

## Result

- AssetStudio imports exactly three layers with one shared transform.
- Its partition check reports 0 uncovered visible pixels and 0 overlaps.
- `validate_front_stand_partition.mjs` confirms the assembled AssetStudio render has 0 changed RGBA channels versus the source.
- Visual review: the headless body is clean in this front standing frame. The hair cut still leaves a few temple pixels assigned to the face; the bald-head layer has a transparent scalp because the source hair hides that area. The source reconstruction is exact because the matching hair layer covers that scalp. This face/head is not ready to reuse with a different hairstyle until the hidden scalp is restored in style and the temple boundary is cleaned.
- The pilot covers only `front / stand / stand_1`. It does not establish animation or view reuse, and is not production-approved or integrated into the game.

## Files

- `source/alex_front_stand_source.png`: full-pose source, extracted from the supplied `SuperMagic_Alex_All_8_Views_Animation_Review.zip` standing front export.
- `front_stand_partition_commands.json`: reproducible mask and partition operation.
- `modules/`: the three full-canvas PNGs and Studio bundle manifest.
- `alex_front_stand_three_module_pilot.json`: official AssetStudio project with the three imported layers.
- `preview_module_commands.json` and `exports/`: full composite and isolated module renders for visual review.
- `validate_front_stand_partition.mjs`: exact pixel reconstruction and project-structure check.

## Reproduce

From the SuperMagicFootball repository root:

```powershell
node ..\SuperMagicAssetStudio\src\cli\agent-cli.mjs --project .\references\analysis\player_master_pilot\three_module_pilot\alex_front_stand_three_module_pilot.json --command-file .\references\analysis\player_master_pilot\three_module_pilot\front_stand_partition_commands.json
node ..\SuperMagicAssetStudio\src\cli\agent-cli.mjs --project .\references\analysis\player_master_pilot\three_module_pilot\alex_front_stand_three_module_pilot.json --command-file .\references\analysis\player_master_pilot\three_module_pilot\preview_module_commands.json
node .\references\analysis\player_master_pilot\three_module_pilot\validate_front_stand_partition.mjs
```

The partition validator proves source-pixel accounting and alignment. It does not approve anatomy, mask purity, or reuse.
