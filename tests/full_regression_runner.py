#!/usr/bin/env python3
"""Independent script-level regression census for the current modular game.

The legacy master runner assumes package.json has deprecated 'test' and 'qa'
scripts. This runner discovers executable tests directly, runs each in an
isolated process, and never calls an unexecuted case PASS.
"""
from __future__ import annotations
import argparse
import datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
TESTS = ROOT / "tests"
EXTRA_BROWSER = {
    "graphics_integration_v082522.py",
    "studio_eight_view_gallery_v082532.py",
    "beard_customization_v082528.py",
    "character_identity_persistence_v082529.py",
    "performance_loader_browser_v082531.py",
    "master_ui_contracts.py",
    "v060_qa.py",
}

def selected_scripts(category: str):
    if category == "node":
        return sorted(TESTS.glob("*.mjs")) + sorted(TESTS.glob("*.test.cjs"))
    return sorted(
        p for p in TESTS.glob("*.py")
        if "browser_qa" in p.name or p.name in EXTRA_BROWSER
    )

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--category", required=True, choices=("node", "browser"))
    ap.add_argument("--shard-index", type=int, default=0)
    ap.add_argument("--shard-count", type=int, default=1)
    ap.add_argument("--timeout-seconds", type=int, default=55)
    ap.add_argument("--out-dir", default="docs/qa_runs_full_regression")
    args = ap.parse_args()
    assert args.shard_count > 0 and 0 <= args.shard_index < args.shard_count
    all_scripts = selected_scripts(args.category)
    scripts = [p for i,p in enumerate(all_scripts) if i % args.shard_count == args.shard_index]
    out_dir = ROOT / args.out_dir
    out_dir.mkdir(parents=True,exist_ok=True)
    base = f"{args.category}_shard_{args.shard_index + 1}_of_{args.shard_count}"
    result_path = out_dir / (base + ".json")
    summary_path = out_dir / (base + ".md")
    result = {
        "category": args.category, "shard": args.shard_index,
        "shard_count": args.shard_count, "discovered": len(all_scripts),
        "requested": len(scripts), "run_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "commit": os.environ.get("GITHUB_SHA", "local"), "tests": []
    }
    def save():
        results = result["tests"]
        result["summary"] = {
            "PASS": sum(r["status"] == "PASS" for r in results),
            "FAIL": sum(r["status"] == "FAIL" for r in results),
            "TIMEOUT": sum(r["status"] == "TIMEOUT" for r in results),
            "ERROR": sum(r["status"] == "ERROR" for r in results),
            "NOT_RUN": len(scripts)-len(results),
        }
        result_path.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
        rows = [
            f"# Full regression — {args.category}, shard {args.shard_index + 1}/{args.shard_count}",
            f"Commit: {result['commit']}", "",
            "These are **script executions**, not certification of every historical QA catalog case.", "",
            "| Script | Status | Seconds | Evidence tail |",
            "|---|---|---:|---|"
        ]
        for test in results:
            tail = test["output_tail"].replace("\n", " ").replace("|", "\\|").replace("\r","")[-180:]
            rows.append(f"| {test['name']} | {test['status']} | {test['seconds']:.2f} | {tail} |")
        rows.append("")
        rows.append("Summary: " + json.dumps(result["summary"]))
        summary_path.write_text("\n".join(rows) + "\n")
    save()
    for file in scripts:
        command = ([sys.executable, str(file)] if args.category == "browser"
                   else ["node", "--test", str(file)] if file.name.endswith(".test.cjs")
                   else ["node", str(file)])
        begin = time.monotonic()
        try:
            p = subprocess.run(
                command, cwd=ROOT, capture_output=True, text=True,
                timeout=args.timeout_seconds,
                env={**os.environ,"PYTHONUNBUFFERED":"1"},
            )
            status = "PASS" if p.returncode == 0 else "FAIL"
            code = p.returncode
            tail = (p.stdout + "\n" + p.stderr)[-2500:]
        except subprocess.TimeoutExpired as exc:
            status, code = "TIMEOUT", None
            tail = str(exc)[-2500:]
        except Exception as exc:
            status, code = "ERROR", None
            tail = repr(exc)[-2500:]
        execution = {"name": file.name, "status": status,
                     "return_code": code, "seconds": round(time.monotonic()-begin,2),
                     "output_tail": tail}
        result["tests"].append(execution)
        save()
        print(f"{status:8} {file.name:52} {execution['seconds']:8.2f}s",flush=True)
        if status != "PASS":
            print("   " + tail[-300:].replace("\n"," "),flush=True)
    print("Final summary:", json.dumps(result["summary"]),flush=True)
    print("Report:", str(result_path),flush=True)
    if any(result["summary"][k] for k in ("FAIL","TIMEOUT","ERROR","NOT_RUN")):
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
