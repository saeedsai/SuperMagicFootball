#!/usr/bin/env python3
"""STUDIO-103 Player Studio dribble preview/save/read-back in Chromium."""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
from threading import Thread

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
IDENTITY_FIELDS = ("id", "name", "role", "num")


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *_args: object) -> None:
        pass


def main() -> None:
    # Isolated browser profile data: synthetic verified inputs exist only in this
    # test origin's localStorage and are never written to canonical roster files.
    roster = json.loads((ROOT / "data/players/arcade.json").read_text(encoding="utf-8"))["japan"]
    fixture_roster = [dict(player) for player in roster]
    fixture_roster[0].update({
        "statsVerified": True,
        "passing": 85,
        "crossing": 85,
        "dribbling": 85,
        "agility": 85,
        "stamina": 85,
        "speedRating": 85,
    })
    seed = json.dumps({"japan": fixture_roster}, ensure_ascii=False, separators=(",", ":"))
    styles = json.loads((ROOT / "data/mechanics/gameplay.json").read_text(encoding="utf-8"))["dribbleStyles"]
    assert len(styles) == 10 and len({style["id"] for style in styles}) == 10
    expected_ids = [style["id"] for style in styles]
    expected_names = {style["id"]: style["name"] for style in styles}
    expected_identity = [[player.get(field) for field in IDENTITY_FIELDS] for player in fixture_roster]

    handler = partial(QuietHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(
                headless=True,
                executable_path=shutil.which("chromium") or None,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            for label, viewport, touch in [
                ("desktop", {"width": 1280, "height": 900}, False),
                ("simulated-touch", {"width": 844, "height": 390}, True),
            ]:
                context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch, service_workers="block")
                context.add_init_script(
                    "if(localStorage.getItem('legend_edits')===null)"
                    "localStorage.setItem('legend_edits', " + json.dumps(seed) + ");"
                )
                page = context.new_page()
                page.set_default_timeout(20000)
                errors: list[str] = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(origin + "/index.html", wait_until="domcontentloaded")
                page.wait_for_selector("#menu [data-action='navSettings']")

                def open_studio() -> None:
                    for action in ("navSettings", "navCustomization", "playerStudio"):
                        page.locator(f"#menu [data-action='{action}']").first.click()
                    page.wait_for_selector("#studioDribble")

                open_studio()
                options = page.locator("#studioDribble option").evaluate_all(
                    "nodes => nodes.map(option => ({value: option.value, disabled: option.disabled}))"
                )
                available = [option["value"] for option in options if option["value"] in expected_ids and not option["disabled"]]
                assert available == expected_ids, (label, "all styles should be selectable for synthetic verified-Gold fixture", available)

                for style_id in expected_ids:
                    page.locator("#studioDribble").select_option(style_id)
                    guide = page.locator("#studioDribbleGuide").inner_text()
                    icon_label = page.locator("#studioDribbleIcon [role='img']").get_attribute("aria-label")
                    assert expected_names[style_id] in guide and "Preview only" in guide, (label, style_id, guide)
                    assert icon_label == f"dribble · {style_id}", (label, style_id, icon_label)
                    save_button = page.locator("#menu [data-action='saveStudioTrick']")
                    assert save_button.is_enabled(), (label, style_id, "save should enable after a new selection")
                    if touch:
                        save_button.tap()
                    else:
                        save_button.click()

                    saved = page.evaluate("JSON.parse(localStorage.getItem('legend_edits'))")
                    saved_roster = saved["japan"]
                    assert saved_roster[0]["dribbleType"] == style_id, (label, style_id, "selection missing from persisted edit")
                    assert [[player.get(field) for field in IDENTITY_FIELDS] for player in saved_roster] == expected_identity, (
                        label, style_id, "save changed roster IDs, names, roles or shirt numbers"
                    )
                    # Re-enter the route without reloading: the player is read
                    # back from the editor's saved roster and KEEP CURRENT names it.
                    page.wait_for_selector("#studioDribble")
                    keep_label = page.locator("#studioDribble option[value='keep']").inner_text()
                    readback_icon = page.locator("#studioDribbleIcon [role='img']").get_attribute("aria-label")
                    assert expected_names[style_id] in keep_label, (label, style_id, keep_label)
                    assert readback_icon == f"dribble · {style_id}", (label, style_id, readback_icon)

                    page.reload(wait_until="domcontentloaded")
                    try:
                        page.wait_for_selector("#menu [data-action='navSettings']")
                    except PlaywrightTimeoutError:
                        print(
                            "STUDIO_103_RELOAD_DEBUG",
                            label,
                            style_id,
                            page.url,
                            page.locator("body").inner_text()[:1000],
                            page.locator("#menu").inner_html()[:1500],
                            flush=True,
                        )
                        page.screenshot(path=str(ROOT / "tests/.generated/studio_103_reload_failure.png"), full_page=True)
                        raise
                    open_studio()
                    persisted_icon = page.locator("#studioDribbleIcon [role='img']").get_attribute("aria-label")
                    persisted_label = page.locator("#studioDribble option[value='keep']").inner_text()
                    assert persisted_icon == f"dribble · {style_id}", (label, style_id, "reload did not preserve icon")
                    assert expected_names[style_id] in persisted_label, (label, style_id, "reload did not preserve saved style")

                assert page.evaluate("localStorage.getItem('legend_managerCareer')") is None, (label, "unrelated Career data was introduced")
                assert not errors, (label, "uncaught JavaScript errors", errors)
                print(f"STUDIO_103_DRIBBLE_STYLE_PASS {label}: {len(expected_ids)} styles, save/read-back/reload, identity preserved", flush=True)
                context.close()
            print("CHROMIUM_VERSION", browser.version, flush=True)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
