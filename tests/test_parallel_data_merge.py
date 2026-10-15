"""Data merge safety regression; no external dependencies or network."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from parallel_data_merge import merge, compare_directories, DATA_FILES  # noqa: E402


class MergeContracts(unittest.TestCase):
    def reconcile(self, base, ours, theirs):
        conflicts = []
        value = merge(base, ours, theirs, 'data/players/club26.json/club26_1', conflicts)
        return value, conflicts

    def test_independent_player_attribute_edits_are_combined(self):
        original = [{'id': 'p1', 'name': 'Player', 'rating': 82, 'power': 55}]
        a = [dict(original[0], rating=84)]
        b = [dict(original[0], power=57)]
        out, errors = self.reconcile(original, a, b)
        self.assertEqual(errors, [])
        self.assertEqual(out[0]['rating'], 84)
        self.assertEqual(out[0]['power'], 57)

    def test_same_attribute_conflict_identifies_player_and_field(self):
        original = [{'id': 'p1', 'name': 'Player', 'rating': 82}]
        _, errors = self.reconcile(original, [dict(original[0], rating=84)], [dict(original[0], rating=86)])
        self.assertEqual(len(errors), 1)
        self.assertIn('/id=p1/rating', errors[0]['path'])

    def test_player_reorder_is_rejected(self):
        base = [{'id': 'one'}, {'id': 'two'}]
        _, errors = self.reconcile(base, base[::-1], base)
        # Single-agent ordering change must be separately guarded by ids_preserved.
        from parallel_data_merge import ids_preserved
        result, _ = self.reconcile(base, base[::-1], base)
        ids_preserved(base, result, 'players/club', errors)
        self.assertEqual(len(errors), 1)
        self.assertIn('ID membership/order', errors[0]['reason'])

    def test_deleting_one_player_is_rejected(self):
        from parallel_data_merge import ids_preserved
        base = [{'id': 'one'}, {'id': 'two'}]
        result, errors = self.reconcile(base, base[:1], base)
        ids_preserved(base, result, 'players/club', errors)
        self.assertTrue(errors)

    def test_protected_roster_missing_team_is_rejected(self):
        from parallel_data_merge import ids_preserved
        base = {'team1': [{'id': 'p1'}], 'team2': [{'id': 'p2'}]}
        ours = {'team1': [{'id': 'p1'}]}
        result, errs = self.reconcile(base, ours, base)
        self.assertNotIn('team2', result)
        # Top-level per-shard membership guard is checked by compare_directories.
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            for label, content in [('base', base), ('ours', ours), ('theirs', base)]:
                name = root / label / 'data/players/club26.json'
                name.parent.mkdir(parents=True, exist_ok=True)
                name.write_text(json.dumps(content))
            _, conflicts = compare_directories(root / 'base', root / 'ours', root / 'theirs',
                                               paths=('data/players/club26.json',))
            self.assertTrue(any('roster IDs' in c['reason'] for c in conflicts))

    def test_duplicate_player_id_is_rejected(self):
        from parallel_data_merge import ids_preserved
        base = [{'id': 'one'}, {'id': 'two'}]
        merged = [{'id': 'one'}, {'id': 'one'}]
        errors = []
        ids_preserved(base, merged, 'players/team', errors)
        self.assertEqual(len(errors), 1)

    def test_nested_graphics_disjoint_edits(self):
        before = {'club': {'p': {'appearance': {'skin': '#aaaaaa', 'hair': '#222222'}}}}
        a = {'club': {'p': {'appearance': {'skin': '#bbbbbb', 'hair': '#222222'}}}}
        b = {'club': {'p': {'appearance': {'skin': '#aaaaaa', 'hair': '#444444'}}}}
        result, errors = self.reconcile(before, a, b)
        self.assertEqual(errors, [])
        self.assertEqual(result['club']['p']['appearance'], {'skin': '#bbbbbb', 'hair': '#444444'})

    def test_delete_vs_edit_detected(self):
        base = {'p': {'skin': '#aaaaaa'}}
        ours = {}
        theirs = {'p': {'skin': '#bbbbbb'}}
        _, errors = self.reconcile(base, ours, theirs)
        self.assertEqual(len(errors), 1)
        self.assertIn('/p', errors[0]['path'])

    def test_equal_edit_not_conflicting(self):
        base = {'p': {'rating': 82}}
        end = {'p': {'rating': 88}}
        result, errors = self.reconcile(base, end, end)
        self.assertEqual(result, end)
        self.assertEqual(errors, [])

    def test_cli_writes_only_separate_output_and_prevents_overwrite(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            source = {'data/teams.json': [{'id': 'team1', 'index': 0, 'name': 'Old'}]}
            for rel in DATA_FILES:
                source.setdefault(rel, {'team1': [{'id': 'p1', 'name': 'Old'}]} if rel.startswith('data/players/') else {})
            for kind in ('base', 'ours', 'theirs'):
                for rel, obj in source.items():
                    path = root / kind / rel
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text(json.dumps(obj), encoding='utf-8')
            first = root / 'ours' / 'data/teams.json'
            first.write_text(json.dumps([{'id': 'team1', 'index': 0, 'name': 'Updated'}]), encoding='utf-8')
            cmd = [sys.executable, str(ROOT / 'scripts/parallel_data_merge.py'),
                   '--base', str(root / 'base'), '--ours', str(root / 'ours'),
                   '--theirs', str(root / 'theirs'), '--out', str(root / 'result')]
            result = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(json.loads((root / 'result/data/teams.json').read_text())[0]['name'], 'Updated')
            second = subprocess.run(cmd, capture_output=True, text=True)
            self.assertNotEqual(second.returncode, 0)
            self.assertEqual(json.loads((root / 'base/data/teams.json').read_text())[0]['name'], 'Old')

    def test_conflicts_prevent_any_output_writes(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            for side in ('base', 'ours', 'theirs'):
                for rel in DATA_FILES:
                    target = root / side / rel
                    target.parent.mkdir(parents=True, exist_ok=True)
                    obj = [{'id': 't', 'name': side}] if rel == 'data/teams.json' else {}
                    if side == 'base' and rel == 'data/teams.json': obj[0]['name'] = 'Base'
                    target.write_text(json.dumps(obj))
            report = root / 'conflict.json'
            cmd = [sys.executable, str(ROOT / 'scripts/parallel_data_merge.py'), '--base', str(root / 'base'),
                   '--ours', str(root / 'ours'), '--theirs', str(root / 'theirs'),
                   '--out', str(root / 'output'), '--report', str(report)]
            res = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(res.returncode, 1, res.stdout + res.stderr)
            self.assertFalse((root / 'output').exists())
            self.assertEqual(json.loads(report.read_text())['status'], 'CONFLICT')


if __name__ == '__main__':
    unittest.main()