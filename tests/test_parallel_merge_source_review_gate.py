"""Opt-in source-review safety gate for three-way agent data merge."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MERGER = ROOT / 'scripts/parallel_data_merge.py'


class SourceReviewGateTests(unittest.TestCase):
    def run_case(self, rating, strict):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            rel = 'data/players/club26.json'
            base = {'club': [{'id': 'p1', 'name': 'Player', 'rating': 80}]}
            ours = {'club': [{'id': 'p1', 'name': 'Player', 'rating': rating}]}
            for side, value in (('base', base), ('ours', ours), ('theirs', base)):
                dest = root / side / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(json.dumps(value))
            out = root / 'merged'
            command = [sys.executable, str(MERGER), '--base', str(root / 'base'),
                       '--ours', str(root / 'ours'), '--theirs', str(root / 'theirs'),
                       '--out', str(out)]
            if strict:
                command.append('--require-source-review-clean')
            result = subprocess.run(command, capture_output=True, text=True)
            return result.returncode, json.loads(result.stdout), (out / rel).exists()

    def test_strict_mode_blocks_player_rating_change_without_writing(self):
        code, report, wrote = self.run_case(85, True)
        self.assertEqual(code, 1)
        self.assertEqual(report['status'], 'SOURCE_REVIEW_REQUIRED')
        self.assertEqual(report['conflictCount'], 0)
        self.assertEqual(report['sourceReview']['count'], 1)
        self.assertFalse(wrote)

    def test_default_mode_preserves_existing_merge_behavior(self):
        code, report, wrote = self.run_case(85, False)
        self.assertEqual(code, 0)
        self.assertEqual(report['status'], 'PASS')
        self.assertEqual(report['sourceReview']['count'], 1)
        self.assertTrue(wrote)

    def test_strict_mode_allows_unchanged_player(self):
        code, report, wrote = self.run_case(80, True)
        self.assertEqual(code, 0)
        self.assertEqual(report['status'], 'PASS')
        self.assertEqual(report['sourceReview']['count'], 0)
        self.assertTrue(wrote)


if __name__ == '__main__':
    unittest.main()
