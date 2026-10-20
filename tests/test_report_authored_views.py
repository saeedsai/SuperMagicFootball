"""Fixtures for C01 authored-view reporting; no browser/renderer claims."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TOOL = Path(__file__).resolve().parents[1] / 'scripts/report_authored_views.py'
spec = importlib.util.spec_from_file_location('report_authored_views', TOOL)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
VIEWS = ['front', 'frontRight', 'right', 'backRight', 'back', 'backLeft', 'left', 'frontLeft']


def fixture(directory: Path, authored=('front', 'back')) -> Path:
    root = directory / 'concept_modular_v1'
    manifests, sources = root / 'manifests', root / 'source'
    manifests.mkdir(parents=True)
    sources.mkdir()
    layers = []
    for name in authored:
        file = sources / f'{name}.svg'
        file.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0"/></svg>', encoding='utf8')
        layers.append({'id': f'layer_{name}', 'kind': 'torso', 'view': name,
                       'asset': f'../source/{name}.svg', 'noMirroring': True})
    manifest = {'schema': 'smf-concept-modular/1', 'viewIds': VIEWS,
                'authoredViews': list(authored), 'runtimeLayer': layers[0],
                'additionalLayers': layers[1:], 'fallbackModel': 'concept_hero',
                'ownerArtApproval': 'pending'}
    file = manifests / 'rig.json'
    file.write_text(json.dumps(manifest), encoding='utf8')
    return file


class ViewCoverageTests(unittest.TestCase):
    def test_incomplete_status_is_honest(self):
        with tempfile.TemporaryDirectory() as d:
            result = module.analyze(fixture(Path(d)))
            self.assertEqual(result['authoredViewCount'], 2)
            self.assertEqual(result['registeredLayerCount'], 2)
            self.assertEqual(result['missingViews'], [v for v in VIEWS if v not in ('front', 'back')])
            self.assertTrue(result['views']['right']['usesFallback'])
            self.assertFalse(result['completeEightViewSourceCoverage'])

    def test_complete_eight_view_source_coverage(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = fixture(Path(d), VIEWS)
            result = module.analyze(manifest)
            self.assertTrue(result['completeEightViewSourceCoverage'])
            self.assertEqual(result['authoredViewCount'], 8)
            self.assertIn('not proof', result['warning'])

    def test_missing_asset_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = fixture(Path(d))
            (manifest.parent.parent / 'source/back.svg').unlink()
            with self.assertRaisesRegex(module.CoverageError, 'missing/invalid SVG'):
                module.analyze(manifest)

    def test_directory_traversal_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = fixture(Path(d))
            data = json.loads(manifest.read_text())
            data['runtimeLayer']['asset'] = '../../../outside.svg'
            manifest.write_text(json.dumps(data))
            with self.assertRaisesRegex(module.CoverageError, 'unsafe asset path'):
                module.analyze(manifest)

    def test_inaccurate_authored_list_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = fixture(Path(d))
            data = json.loads(manifest.read_text())
            data['authoredViews'] = ['front']
            manifest.write_text(json.dumps(data))
            with self.assertRaisesRegex(module.CoverageError, 'does not match'):
                module.analyze(manifest)

    def test_mirroring_is_not_counted_as_authored(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = fixture(Path(d))
            data = json.loads(manifest.read_text())
            data['runtimeLayer']['noMirroring'] = False
            manifest.write_text(json.dumps(data))
            with self.assertRaisesRegex(module.CoverageError, 'mirroring permitted'):
                module.analyze(manifest)

    def test_strict_exit_status_is_distinct_from_invalid(self):
        with tempfile.TemporaryDirectory() as d:
            manifest = fixture(Path(d))
            result = subprocess.run([sys.executable, str(TOOL), '--manifest', str(manifest), '--require-eight'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 3)
            self.assertEqual(json.loads(result.stdout)['authoredViewCount'], 2)


if __name__ == '__main__':
    unittest.main()
