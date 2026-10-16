"""Safety contracts for the independent full-regression cross-shard auditor."""
from __future__ import annotations

import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest

import audit_regression_shards as auditor


class ShardAuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.commit = "a" * 40
        self.create_category("node", ("one.test.cjs", "two.test.cjs", "three.mjs"))
        self.create_category("browser", ("alpha_browser_qa.py", "beta_browser_qa.py"))

    def create_category(self, category, names):
        for i in range(2):
            selected = list(names[i::2])
            data = {"category": category, "shard": i, "shard_count": 2,
                    "discovered": len(names), "requested": len(selected),
                    "discovered_scripts": list(names), "selected_scripts": selected,
                    "commit": self.commit,
                    "tests": [{"name": n, "status": "PASS", "return_code": 0,
                               "seconds": 0.01, "output_tail": ""} for n in selected],
                    "summary": {"PASS": len(selected), "FAIL": 0, "TIMEOUT": 0,
                                "ERROR": 0, "NOT_RUN": 0}}
            self.write(category, i, data)

    def path(self, category, shard):
        return self.root / f"{category}_shard_{shard + 1}_of_2.json"

    def write(self, category, index, data):
        self.path(category, index).write_text(json.dumps(data), encoding="utf8")

    def mutate(self, category, index, callback):
        file = self.path(category, index)
        data = json.loads(file.read_text())
        callback(data)
        file.write_text(json.dumps(data))

    def assert_rejected(self, error):
        with self.assertRaisesRegex(auditor.AuditError, error):
            auditor.audit_reports(self.root)

    def test_complete_two_category_shards_are_accepted(self):
        result = auditor.audit_reports(self.root, expected_commit=self.commit)
        self.assertEqual(result["total_scripts"], 5)
        self.assertEqual(result["categories"]["node"]["passed"], 3)
        self.assertEqual(result["categories"]["browser"]["passed"], 2)

    def test_wrong_expected_shard_count_is_rejected(self):
        with self.assertRaisesRegex(auditor.AuditError, "differs from expected"):
            auditor.audit_reports(self.root, expected_shards=4)

    def test_missing_shard_is_not_green(self):
        self.path("browser", 1).unlink()
        self.assert_rejected("missing shard")

    def test_duplicate_artifacts_across_directories_are_rejected(self):
        alternate = self.root / "rerun"
        alternate.mkdir()
        alternate.joinpath(self.path("node", 0).name).write_bytes(self.path("node", 0).read_bytes())
        self.assert_rejected("duplicate node shard")

    def test_inconsistent_discovery_manifest_is_rejected(self):
        self.mutate("node", 1, lambda d: d["discovered_scripts"].reverse())
        self.assert_rejected("inconsistent discovered_scripts")

    def test_duplicate_execution_in_same_shard_is_rejected(self):
        self.mutate("node", 0, lambda d: d["tests"].append(dict(d["tests"][0])))
        self.assert_rejected("missing, duplicated or misordered")

    def test_unsafe_relative_script_path_cannot_be_certified(self):
        for name in ("../outside.test.cjs", "nested/test.test.cjs", r"nested\\test.test.cjs"):
            with self.subTest(name=name):
                self.create_category("node", (name, "two.test.cjs", "three.mjs"))
                self.assert_rejected("undiscoverable or unsafe filenames")

    def test_wrong_node_script_extension_cannot_be_certified(self):
        self.create_category("node", ("fake.js", "two.test.cjs", "three.mjs"))
        self.assert_rejected("undiscoverable or unsafe filenames")

    def test_python_script_not_selected_by_browser_discovery_is_rejected(self):
        self.create_category("browser", ("unrelated.py", "beta_browser_qa.py"))
        self.assert_rejected("undiscoverable or unsafe filenames")

    def test_wrong_round_robin_assignment_is_rejected(self):
        self.mutate("node", 1, lambda d: d["selected_scripts"].append("one.test.cjs"))
        self.assert_rejected("selected_scripts differ")

    def test_missing_seconds_refuses_false_green(self):
        self.mutate("node", 0, lambda d: d["tests"][0].pop("seconds"))
        self.assert_rejected("duration/output evidence")

    def test_negative_or_nan_seconds_refuse_false_green(self):
        for value in (-1, float("nan"), float("inf"), True, "0.0"):
            with self.subTest(value=value):
                self.create_category("node", ("one.test.cjs", "two.test.cjs", "three.mjs"))
                self.mutate("node", 0, lambda d: d["tests"][0].update(seconds=value))
                self.assert_rejected("duration/output evidence")

    def test_missing_output_tail_refuses_false_green(self):
        self.mutate("browser", 0, lambda d: d["tests"][0].pop("output_tail"))
        self.assert_rejected("duration/output evidence")

    def test_nonstring_output_tail_refuses_false_green(self):
        self.mutate("browser", 1, lambda d: d["tests"][0].update(output_tail=["fake"]))
        self.assert_rejected("duration/output evidence")

    def test_failed_execution_cannot_be_certified(self):
        self.mutate("browser", 0, lambda d: d["tests"][0].update(status="FAIL", return_code=1))
        self.assert_rejected("test failed")

    def test_false_pass_summary_is_rejected(self):
        self.mutate("browser", 0, lambda d: d["summary"].update(NOT_RUN=1))
        self.assert_rejected("misleading")

    def test_cross_shard_commits_must_agree(self):
        self.mutate("node", 0, lambda d: d.update(commit="b" * 40))
        self.assert_rejected("multiple commits")

    def test_expected_commit_rejects_stale_artifacts(self):
        with self.assertRaisesRegex(auditor.AuditError, "stale artifact"):
            auditor.audit_reports(self.root, expected_commit="c" * 40)

    def test_cli_writes_pass_report_only_after_full_validation(self):
        out = self.root / "result" / "audit.json"
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(auditor.main(["--reports", str(self.root),
                                           "--expected-commit", self.commit,
                                           "--expected-shards", "2",
                                           "--out", str(out)]), 0)
        self.assertEqual(json.loads(out.read_text())["status"], "PASS")
        out.unlink()
        self.path("node", 1).unlink()
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(auditor.main(["--reports", str(self.root),
                                           "--expected-shards", "2",
                                           "--out", str(out)]), 1)
        self.assertFalse(out.exists())

    def test_category_specific_audit_skips_other_category(self):
        self.path("browser", 1).unlink()
        result = auditor.audit_reports(self.root, ("node",))
        self.assertEqual(result["total_scripts"], 3)

    def test_filename_metadata_mismatch_is_rejected(self):
        self.mutate("node", 0, lambda d: d.update(shard=1))
        self.assert_rejected("filename and metadata disagree")


if __name__ == "__main__":
    unittest.main()
