#!/usr/bin/env python3
"""SAVE-101/102: accessible names distinguish Career/Cup slot actions."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests" / ".generated" / "play.html"
assert FIXTURE.exists(), "Build the current modular browser fixture with scripts/build.py"

campaign = {
    "id": "cup_UEFA",
    "compId": "UEFA",
    "club": 0,
    "participants": [0, 1, 2, 3],
    "phase": "league",
    "roundIdx": 0,
    "history": [],
    "rounds": [[]],
    "groups": [],
    "table": {
        str(team): {"p": 0, "w": 0, "d": 0, "l": 0, "gf": 0, "ga": 0, "pts": 0}
        for team in range(4)
    },
    "earned": 0,
    "winner": None,
    "knockout": None,
    "label": "Seeded Cup",
}
boot = "localStorage.setItem('legend_continentalRun', CAMPAIGN);".replace(
    "CAMPAIGN", json.dumps(json.dumps(campaign, separators=(",", ":")))
)


class FixtureHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/index.html"):
            html = FIXTURE.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)
            return
        super().do_GET()

    def log_message(self, *_args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), partial(FixtureHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f"http://127.0.0.1:{server.server_port}/"


def verify_slot_names(page, kind, occupied_slots):
    cards = page.locator("#menu .scroll > .panel")
    assert cards.count() == 10, (kind, "ten save-slot cards", cards.count())
    names = []
    for card_index in range(cards.count()):
        card = cards.nth(card_index)
        buttons = card.locator("button")
        for button_index in range(buttons.count()):
            button = buttons.nth(button_index)
            accessible_name = button.get_attribute("aria-label")
            assert accessible_name, (kind, card_index + 1, "slot action is missing an accessible name")
            names.append(accessible_name)
            assert page.get_by_role("button", name=accessible_name, exact=True).count() == 1, (
                kind,
                accessible_name,
                "accessible name should identify exactly one slot action",
            )

    assert len(names) == len(set(names)), (kind, "slot action names must be unique", names)
    for slot in occupied_slots:
        expected_actions = [
            ("Overwrite", "OVERWRITE"),
            ("Load", "LOAD"),
            ("Copy", "COPY"),
            ("Delete", "DELETE"),
        ]
        if kind == "Career":
            expected_actions.insert(3, ("Rename", "RENAME"))
        for verb, visible in expected_actions:
            name = f"{verb} {kind} slot {slot}"
            button = page.get_by_role("button", name=name, exact=True)
            assert button.count() == 1, (kind, slot, name)
            assert button.inner_text().strip() == visible, (kind, slot, name, button.inner_text())
    assert page.get_by_role("button", name=f"Save to {kind} slot 3", exact=True).count() == 1, (
        kind,
        "empty slot save action identifies its destination",
    )
    for ambiguous in ("OVERWRITE", "SAVE HERE", "LOAD", "COPY", "RENAME", "DELETE"):
        assert page.get_by_role("button", name=ambiguous, exact=True).count() == 0, (
            kind,
            "visible repeated label must be replaced by a contextual accessible name",
            ambiguous,
        )
    return len(names)


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        for label, mobile, viewport in [
            ("desktop", False, {"width": 1360, "height": 800}),
            ("simulated-touch", True, {"width": 844, "height": 390}),
        ]:
            context = browser.new_context(
                viewport=viewport,
                is_mobile=mobile,
                has_touch=mobile,
                service_workers="block",
            )
            context.add_init_script(boot)
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(origin + "tests/.generated/play.html", wait_until="load")
            page.wait_for_function("!!window.SupermagicFootball?.game", timeout=60000)
            page.set_default_timeout(10000)

            # Starting a manager creates the first owned Career save; copy it to
            # another slot so every repeated occupied-row action is exercised.
            # The Home shortcut dock can visually overlap mode rows in this
            # candidate layout. Use the actual keyboard activation path so
            # this persistence test reaches Career without force-clicking
            # through another control.
            page.locator('[data-action="navCareer"]').first.press("Enter")
            page.locator('[data-action="manager"]').first.click()
            page.locator('[data-action="startManager"]').first.click()
            page.locator(".row.space button").first.click()
            page.locator('[data-action="navCareerSlots"]').first.click()
            page.locator('[data-action="careerSlotCopy_1"]').click()
            career_action_count = verify_slot_names(page, "Career", [1, 2])

            # Legacy Cup recovery creates slot 1 during startup; copy it to slot
            # 2 to verify row-specific names across multiple occupied records.
            page.locator(".row.space button").first.click()
            page.locator('[data-action="home"]').first.click()
            page.locator('[data-action="navCups"]').first.press("Enter")
            page.locator('[data-action="navCupSlots"]').first.click()
            page.locator('[data-action="cupSlotCopy_1"]').click()
            cup_action_count = verify_slot_names(page, "Cup", [1, 2])

            assert not errors, (label, errors)
            print(
                "CAREER_CUP_SLOT_ACTION_NAMES_BROWSER_PASS",
                label,
                f"{career_action_count} Career + {cup_action_count} Cup slot-card actions have unique contextual names",
                flush=True,
            )
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
