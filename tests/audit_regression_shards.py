#!/usr/bin/env python3
"""Independently verify complete, non-overlapping full-regression shard reports.

Use on the downloaded JSON artifacts from *one* GitHub workflow run. This is an
opt-in post-run audit; it does not modify game code or the existing CI runner.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
import sys

NAME = re.compile(r"^(node|browser)_shard_([1-9][0-9]*)_of_([1-9][0-9]*)\.json$")
CATEGORIES = ("node", "browser")
STATUSES = ("PASS", "FAIL", "TIMEOUT", "ERROR", "NOT_RUN")
# Match the runner's exact top-level discovery rules; a fabricated report must
# not certify paths that were never runnable in the census.
EXTRA_BROWSER = frozenset({
    "graphics_integration_v082522.py", "studio_eight_view_gallery_v082532.py",
    "beard_customization_v082528.py", "character_identity_persistence_v082529.py",
    "performance_loader_browser_v082531.py", "master_ui_contracts.py", "v060_qa.py",
})
VALID_BASENAME = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_.-]*$")


def discoverable_script(name: str, category: str) -> bool:
    if not isinstance(name, str) or not VALID_BASENAME.fullmatch(name):
        return False
    if category == "node":
        return name.endswith(".mjs") or name.endswith(".test.cjs")
    return name.endswith(".py") and ("browser_qa" in name or name in EXTRA_BROWSER)



class AuditError(ValueError):
    """A regression census cannot be certified from the given artifacts."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AuditError(message)


def natural_count(value, description: str) -> int:
    require(type(value) is int and value >= 0, f"{description} must be a nonnegative integer")
    return value


def audit_reports(directory: Path, categories=CATEGORIES, expected_commit=None, expected_shards=None) -> dict:
    """Return validated coverage totals; raise on any missing/duplicate/stale report."""
    directory = Path(directory)
    require(directory.is_dir(), f"report directory not found: {directory}")
    all_paths = sorted(p for p in directory.rglob("*.json") if NAME.fullmatch(p.name))
    require(all_paths, f"no shard JSON reports found under {directory}")
    wanted = tuple(categories)
    require(wanted and len(set(wanted)) == len(wanted) and
            set(wanted).issubset(CATEGORIES), "invalid requested categories")
    grouped = {name: {} for name in wanted}

    for path in all_paths:
        match = NAME.fullmatch(path.name)
        category, shard_label, count_label = match.groups()
        if category not in grouped:
            continue
        label = str(path)
        try:
            report = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise AuditError(f"{label}: unreadable JSON ({exc})") from exc
        require(isinstance(report, dict), f"{label}: report must be a JSON object")
        index = natural_count(report.get("shard"), f"{label} shard")
        count = natural_count(report.get("shard_count"), f"{label} shard_count")
        require(count > 0 and index < count, f"{label}: invalid shard index/count")
        require(report.get("category") == category and index + 1 == int(shard_label)
                and count == int(count_label), f"{label}: filename and metadata disagree")
        require(index not in grouped[category],
                f"duplicate {category} shard {index + 1} in {label} and {grouped[category].get(index, ('',))[0]}")
        grouped[category][index] = (label, report)

    totals = {}
    commits = set()
    for category, shards in grouped.items():
        require(shards, f"missing all {category} shard reports")
        count = next(iter(shards.values()))[1]["shard_count"]
        if expected_shards is not None:
            require(count == expected_shards,
                    f"{category}: reported shard_count {count} differs from expected {expected_shards}")
        require(all(r["shard_count"] == count for _, r in shards.values()),
                f"{category}: inconsistent shard counts")
        missing = sorted(set(range(count)) - set(shards))
        require(not missing and len(shards) == count,
                f"{category}: missing shard(s) {[i + 1 for i in missing]} of {count}")
        reference = shards[0][1].get("discovered_scripts")
        require(isinstance(reference, list) and reference and
                all(isinstance(v, str) and v for v in reference) and
                len(set(reference)) == len(reference),
                f"{category}: discovered_scripts must contain unique nonempty names")
        require(all(discoverable_script(script, category) for script in reference),
                f"{category}: discovered_scripts contain undiscoverable or unsafe filenames")
        seen = set()
        for index, (label, report) in sorted(shards.items()):
            require(report.get("discovered_scripts") == reference,
                    f"{label}: inconsistent discovered_scripts manifest")
            require(natural_count(report.get("discovered"), f"{label} discovered") == len(reference),
                    f"{label}: discovered count mismatch")
            expected = [script for n, script in enumerate(reference) if n % count == index]
            selected = report.get("selected_scripts")
            require(selected == expected and expected,
                    f"{label}: selected_scripts differ from expected round-robin assignment")
            require(natural_count(report.get("requested"), f"{label} requested") == len(expected),
                    f"{label}: requested count mismatch")
            require(not seen.intersection(selected),
                    f"{label}: duplicated test execution across shards")
            seen.update(selected)
            executions = report.get("tests")
            require(isinstance(executions, list) and
                    [test.get("name") if isinstance(test, dict) else None for test in executions] == selected,
                    f"{label}: missing, duplicated or misordered executed scripts")
            require(all(test.get("status") == "PASS" and
                        type(test.get("return_code")) is int and test["return_code"] == 0
                        for test in executions),
                    f"{label}: a test failed, timed out or lacks successful exit evidence")
            # PASS is not auditable unless each execution has valid measured
            # duration and an actual output capture (which may be empty).
            require(all(
                type(test.get("seconds")) in (float, int) and
                math.isfinite(test["seconds"]) and test["seconds"] >= 0 and
                isinstance(test.get("output_tail"), str)
                for test in executions
            ), f"{label}: missing or invalid per-script duration/output evidence")
            summary = report.get("summary")
            require(isinstance(summary, dict) and
                    {k: summary.get(k) for k in STATUSES} ==
                    {"PASS": len(selected), "FAIL": 0, "TIMEOUT": 0,
                     "ERROR": 0, "NOT_RUN": 0},
                    f"{label}: misleading or incomplete status summary")
            commit = report.get("commit")
            require(isinstance(commit, str) and commit.strip(),
                    f"{label}: no commit identity")
            commits.add(commit)
        require(seen == set(reference),
                f"{category}: coverage gap in discovered test scripts")
        totals[category] = {"shards": count, "discovered": len(reference),
                            "executed": len(seen), "passed": len(seen)}
    require(len(commits) == 1,
            f"shard artifacts originate from multiple commits: {', '.join(sorted(commits))}")
    commit = next(iter(commits))
    if expected_commit is not None:
        require(commit == expected_commit,
                f"stale artifact commit {commit!r}; expected {expected_commit!r}")
    return {"status": "PASS", "commit": commit, "categories": totals,
            "total_scripts": sum(item["passed"] for item in totals.values())}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reports", type=Path, required=True,
                        help="Directory of downloaded full-regression JSON shard artifacts")
    parser.add_argument("--category", choices=(*CATEGORIES, "all"), default="all")
    parser.add_argument("--expected-commit", help="Exact commit SHA expected for all shards")
    parser.add_argument("--expected-shards", type=int, default=4,
                        help="Expected shard count per category (GitHub workflow default: 4)")
    parser.add_argument("--out", type=Path, help="Optional JSON acceptance report (only written on PASS)")
    args = parser.parse_args(argv)
    categories = CATEGORIES if args.category == "all" else (args.category,)
    try:
        require(args.expected_shards > 0, "--expected-shards must be positive")
        result = audit_reports(args.reports, categories, args.expected_commit, args.expected_shards)
        if args.out:
            args.out.parent.mkdir(parents=True, exist_ok=True)
            args.out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    except (AuditError, OSError) as exc:
        print(f"SHARD AUDIT FAIL: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
