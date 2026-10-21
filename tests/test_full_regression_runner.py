"""Isolated contract tests for the script-level full regression runner.

These tests run in temporary repositories and do not need Chromium, Node or an
installed game. They assert that missing script coverage can never produce PASS.
"""
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

RUNNER_FILE = Path(__file__).resolve().with_name("full_regression_runner.py")
SPEC = importlib.util.spec_from_file_location("smf_full_regression_runner", RUNNER_FILE)
runner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(runner)


class RegressionRunnerSafetyTests(unittest.TestCase):
    def setUp(self):
        self.sandbox = tempfile.TemporaryDirectory()
        self.addCleanup(self.sandbox.cleanup)
        self.root = Path(self.sandbox.name)
        (self.root / "tests").mkdir()
        (self.root / "package.json").write_text('{"version":"0.9.0.0"}', encoding="utf8")
        self.root_patch = mock.patch.object(runner, "ROOT", self.root)
        self.tests_patch = mock.patch.object(runner, "TESTS", self.root / "tests")
        self.root_patch.start()
        self.tests_patch.start()
        self.addCleanup(self.tests_patch.stop)
        self.addCleanup(self.root_patch.stop)

    def run_runner(self, category, *options):
        stdout, stderr = io.StringIO(), io.StringIO()
        args = ["full_regression_runner.py", "--category", category,
                "--out-dir", "artifacts", *options]
        with mock.patch.object(sys, "argv", args), contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            try:
                exit_code = runner.main()
            except SystemExit as exc:
                exit_code = exc.code
        return exit_code, stdout.getvalue(), stderr.getvalue()

    def new_script(self, name, contents="print('CASE_OK')\n"):
        file = self.root / "tests" / name
        file.write_text(contents, encoding="utf8")
        return file

    def test_zero_discovered_browser_scripts_fail_without_green_report(self):
        code, out, err = self.run_runner("browser")
        self.assertEqual(code, 2)
        self.assertIn("no browser scripts discovered", err)
        self.assertFalse((self.root / "artifacts").exists())

    def test_zero_discovered_node_scripts_fail_without_green_report(self):
        code, _, err = self.run_runner("node")
        self.assertEqual(code, 2)
        self.assertIn("no node scripts discovered", err)
        self.assertFalse((self.root / "artifacts").exists())

    def test_more_shards_than_scripts_are_rejected_not_marked_pass(self):
        self.new_script("qa_test_browser_qa.py")
        code, _, err = self.run_runner("browser", "--shard-index", "2", "--shard-count", "4")
        self.assertEqual(code, 2)
        self.assertIn("empty shards are not certifiable", err)
        self.assertFalse((self.root / "artifacts").exists())

    def test_invalid_shard_and_timeout_args_are_explicit_errors(self):
        self.new_script("qa_test_browser_qa.py")
        for options, expected in [
            (("--shard-count", "0"), "--shard-count must be positive"),
            (("--shard-index", "-1"), "--shard-index must be within"),
            (("--shard-index", "1"), "--shard-index must be within"),
            (("--timeout-seconds", "0"), "--timeout-seconds must be positive"),
        ]:
            with self.subTest(options=options):
                code, _, err = self.run_runner("browser", *options)
                self.assertEqual(code, 2)
                self.assertIn(expected, err)

    def test_nonempty_single_shard_writes_actual_pass_not_empty_pass(self):
        self.new_script("a_browser_qa.py")
        code, output, err = self.run_runner("browser")
        self.assertEqual(code, 0, err)
        data = json.loads((self.root / "artifacts" / "browser_shard_1_of_1.json").read_text())
        self.assertEqual(data["discovered"], 1)
        self.assertEqual(data["requested"], 1)
        self.assertEqual(data["discovered_scripts"], ["a_browser_qa.py"])
        self.assertEqual(data["selected_scripts"], ["a_browser_qa.py"])
        self.assertEqual(data["summary"], {
            "PASS": 1, "FAIL": 0, "TIMEOUT": 0, "ERROR": 0, "NOT_RUN": 0
        })
        self.assertEqual(data["tests"][0]["name"], "a_browser_qa.py")
        self.assertIn("PASS", output)

    def test_failing_script_is_never_marked_pass(self):
        self.new_script("broken_browser_qa.py", "import sys; print('EXPECTED_FAILURE'); sys.exit(17)\n")
        code, out, err = self.run_runner("browser")
        self.assertEqual(code, 1, err)
        data = json.loads((self.root / "artifacts" / "browser_shard_1_of_1.json").read_text())
        self.assertEqual(data["requested"], 1)
        self.assertEqual(data["summary"]["PASS"], 0)
        self.assertEqual(data["summary"]["FAIL"], 1)
        self.assertEqual(data["summary"]["NOT_RUN"], 0)
        self.assertEqual(data["tests"][0]["return_code"], 17)
        self.assertIn("FAIL", out)

    def test_browser_migration_changes_only_assigned_shard(self):
        (self.root / "package.json").write_text('{"version":"0.9.0.0"}')
        a = self.new_script("a_browser_qa.py", "# 0.8.24.12-alpha\nprint('ONE')\n")
        b = self.new_script("b_browser_qa.py", "# 0.8.24.12-alpha\nprint('TWO')\n")
        code, out, err = self.run_runner("browser", "--shard-index", "0", "--shard-count", "2")
        self.assertEqual(code, 0, err)
        self.assertIn("LEGACY_TEST_READINESS_MIGRATED 1 a_browser_qa.py", out)
        self.assertIn("0.9.0.0", a.read_text())
        self.assertIn("0.8.24.12-alpha", b.read_text(),
                      "the other runner's shard must never rewrite this file")
        report = json.loads((self.root / "artifacts" / "browser_shard_1_of_2.json").read_text())
        self.assertEqual(report["discovered"], 2)
        self.assertEqual(report["requested"], 1)
        self.assertEqual(report["discovered_scripts"], ["a_browser_qa.py", "b_browser_qa.py"])
        self.assertEqual(report["selected_scripts"], ["a_browser_qa.py"])
        self.assertEqual(report["summary"]["PASS"], 1)


if __name__ == "__main__":
    unittest.main()
