#!/usr/bin/env python3
"""Run one browser QA script with portable Chromium and no source-file edits."""
from __future__ import annotations

import os
from pathlib import Path
import sys


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: browser_runner_compat.py SCRIPT.py")
    script = Path(sys.argv[1]).resolve()
    if not script.is_file():
        raise SystemExit(f"Browser QA script not found: {script}")

    try:
        from playwright.sync_api import BrowserType
    except ModuleNotFoundError:
        BrowserType = None
    if BrowserType is not None:
        launch = BrowserType.launch

        def launch_portable(self, *args, **kwargs):
            requested = kwargs.get("executable_path")
            if os.name == "nt" and requested and str(requested).replace("\\", "/") == "/usr/bin/chromium":
                managed = os.environ.get("SMF_CHROMIUM_PATH") or self.executable_path
                if not Path(managed).is_file():
                    raise FileNotFoundError(f"Playwright Chromium executable not found: {managed}")
                kwargs["executable_path"] = managed
            return launch(self, *args, **kwargs)

        BrowserType.launch = launch_portable

    source = script.read_text(encoding="utf-8")
    expected_version = os.environ.get("SMF_BROWSER_GAME_VERSION")
    historical_version = "0.8.24.12-alpha"
    if expected_version and historical_version in source:
        source = source.replace(historical_version, expected_version)
        print(f"LEGACY_TEST_READINESS_MIGRATED in-memory {script.name}", flush=True)

    sys.argv = [str(script)]
    namespace = {"__file__": str(script), "__name__": "__main__", "__package__": None}
    exec(compile(source, str(script), "exec"), namespace)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
