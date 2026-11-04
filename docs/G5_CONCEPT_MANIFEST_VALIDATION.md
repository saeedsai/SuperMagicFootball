# G5 experimental character manifest validation

## Acceptance criteria

- Reject a manifest with an unsupported schema, missing/duplicate views, or an authoring view that is not declared.
- Require every authored layer to have a unique ID, a known authored view, source canvas, crop, trim offset, pivot, draw order, and explicit mirror policy.
- Resolve each source asset inside its character package; reject missing files and path traversal.
- Verify SVG dimensions and viewBox against that layer's source canvas. Layers in a given view must share one canvas; different views may use different projection canvases.
- Keep the manifest an authoring/package validation input only until the runtime package loader is implemented and reviewed.

## Validation

Run from the game root:

```powershell
python -X utf8 scripts/validate_concept_manifest.py
node --test tests/concept_manifest_validator.test.cjs
```

The current experimental `rig.json` passes with eight source layers across the front and rear canvases. Regression cases verify duplicate-ID/pivot rejection and asset-path escape rejection. Validation does not establish art quality, Studio reimport, runtime manifest consumption, game-renderer acceptance, or owner approval.
