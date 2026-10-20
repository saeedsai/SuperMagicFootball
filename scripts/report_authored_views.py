#!/usr/bin/env python3
"""Audit genuinely authored (manifest-registered) C01 art views, without runtime claims.

Exit codes: 0 = valid manifest, 2 = invalid/unsafe manifest or referenced SVG,
3 = valid manifest but incomplete view coverage when --require-eight is supplied.
"""
import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

DEFAULT_MANIFEST = (Path(__file__).resolve().parents[1]
                    / 'assets/characters/concept_modular_v1/manifests/rig.json')
SVG_NS = '{http://www.w3.org/2000/svg}svg'


class CoverageError(ValueError):
    """Unsafe or broken art manifest; never accept as valid coverage."""


def analyze(manifest_path: Path) -> dict:
    manifest_path = Path(manifest_path).resolve()
    try:
        manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as exc:
        raise CoverageError(f'unreadable/invalid manifest: {exc}') from exc
    if not isinstance(manifest, dict) or manifest.get('schema') != 'smf-concept-modular/1':
        raise CoverageError('unexpected concept manifest schema')
    view_ids = manifest.get('viewIds')
    authored = manifest.get('authoredViews')
    if (not isinstance(view_ids, list) or len(view_ids) != 8
            or any(not isinstance(v, str) or not v for v in view_ids)
            or len(set(view_ids)) != 8):
        raise CoverageError('exactly eight unique view IDs required')
    if (not isinstance(authored, list) or len(set(map(str, authored))) != len(authored)
            or any(v not in view_ids for v in authored)):
        raise CoverageError('authoredViews must be unique and belong to viewIds')
    layers = [manifest.get('runtimeLayer'), *(manifest.get('additionalLayers') or [])]
    if not layers or any(not isinstance(layer, dict) for layer in layers):
        raise CoverageError('malformed authored layers')
    root = manifest_path.parent.parent.resolve()
    by_view = {v: [] for v in view_ids}
    used_ids = set()
    for layer in layers:
        layer_id, view, asset = layer.get('id'), layer.get('view'), layer.get('asset')
        if (not isinstance(layer_id, str) or not layer_id or layer_id in used_ids
                or view not in by_view or not isinstance(asset, str) or not asset):
            raise CoverageError(f'invalid or duplicate art layer: {layer_id!r}')
        used_ids.add(layer_id)
        if layer.get('noMirroring') is not True:
            raise CoverageError(f'layer {layer_id} is not independently authored (mirroring permitted)')
        resolved = (manifest_path.parent / asset).resolve()
        if not resolved.is_relative_to(root) or resolved.suffix.lower() != '.svg':
            raise CoverageError(f'unsafe asset path for {layer_id}: {asset}')
        try:
            art = ET.parse(resolved).getroot()
        except (OSError, ET.ParseError) as exc:
            raise CoverageError(f'missing/invalid SVG for {layer_id}: {exc}') from exc
        if art.tag != SVG_NS:
            raise CoverageError(f'asset is not an SVG for {layer_id}')
        by_view[view].append({'id': layer_id, 'kind': layer.get('kind', 'unspecified')})
    missing = [v for v in view_ids if not by_view[v]]
    inaccurate = [v for v in authored if not by_view[v]]
    undeclared = [v for v in view_ids if by_view[v] and v not in authored]
    if inaccurate or undeclared:
        raise CoverageError(f'authoredViews does not match registered source layers: missing={inaccurate}, undeclared={undeclared}')
    return {
        'schema': 'smf-authored-views-report/1',
        'manifest': str(manifest_path),
        'registeredLayerCount': len(layers),
        'authoredViewCount': len(view_ids) - len(missing),
        'totalViews': len(view_ids),
        'missingViews': missing,
        'fallbackModel': manifest.get('fallbackModel'),
        'ownerArtApproval': manifest.get('ownerArtApproval', 'unknown'),
        'views': {view: {'layers': by_view[view], 'usesFallback': not bool(by_view[view])}
                  for view in view_ids},
        'completeEightViewSourceCoverage': not missing,
        'warning': 'Static art-source audit only; not proof of playable integration, animation completeness or owner approval.',
    }


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument('--require-eight', action='store_true',
                        help='fail if any of the eight views lack manifest-registered SVG source')
    args = parser.parse_args(argv)
    try:
        report = analyze(args.manifest)
    except CoverageError as exc:
        print(f'ART_COVERAGE_INVALID: {exc}', file=sys.stderr)
        return 2
    print(json.dumps(report, indent=2))
    return 3 if args.require_eight and not report['completeEightViewSourceCoverage'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
