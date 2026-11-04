#!/usr/bin/env python3
"""VIZ-01: normal-theme keyboard focus across live-match controls."""
from pathlib import Path

from playwright.sync_api import sync_playwright

from menu_test_routes import open_quick

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests" / ".generated" / "play.html"
assert FIXTURE.exists(), "Build the current modular browser fixture with scripts/build.py"
HTML = FIXTURE.read_text(encoding="utf-8")

EXPECTED = [
    ("fullscreenMatch", "Toggle fullscreen"),
    ("pauseBtn", "Pause game"),
    ("jump", "Jump or run"),
    ("pass", "Pass or tackle"),
    ("shoot", "Shoot or slide tackle"),
    ("dribble", "Dribble or switch player"),
]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=True,
        executable_path="/usr/bin/chromium",
        args=["--no-sandbox", "--disable-dev-shm-usage"],
    )
    context = browser.new_context(
        viewport={"width": 844, "height": 390}, is_mobile=True, has_touch=True
    )
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.set_content(HTML, wait_until="load")
    page.wait_for_function("!!window.SupermagicFootball?.game", timeout=60000)

    open_quick(page)
    page.locator('[data-action="kickoff"]').first.click()
    page.wait_for_function("SupermagicFootball.game.matchState === 'play'", timeout=15000)
    rotate_dismiss = page.locator("#dismissRotate")
    if rotate_dismiss.is_visible():
        rotate_dismiss.click()

    assert page.locator("#pauseBtn").get_attribute("aria-label") == "Pause game"
    assert page.locator("#fullscreenMatch").get_attribute("aria-label") == "Toggle fullscreen"
    for action, accessible_name in EXPECTED[2:]:
        button = page.locator(f'#touchButtons button[data-act="{action}"]')
        assert button.get_attribute("aria-label") == accessible_name, (action, "label attribute changed")
        assert page.get_by_role("button", name=accessible_name, exact=True).count() == 1, (
            action,
            "button does not expose the expected accessible name",
        )
    for control_id, accessible_name in EXPECTED[:2]:
        assert page.get_by_role("button", name=accessible_name, exact=True).count() == 1, (
            control_id,
            "button does not expose the expected accessible name",
        )

    # Clear the click's focus so the browser begins the normal forward Tab order.
    page.evaluate("document.activeElement?.blur()")
    observed = []
    for expected_id, accessible_name in EXPECTED:
        page.keyboard.press("Tab")
        active = page.evaluate("""() => {
          const element = document.activeElement;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            id: element.id || element.dataset.act || '',
            ariaLabel: element.getAttribute('aria-label'),
            role: element.getAttribute('role') || element.tagName.toLowerCase(),
            focusVisible: element.matches(':focus-visible'),
            outlineColor: style.outlineColor,
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            outlineOffset: style.outlineOffset,
            rect: {left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom},
            viewport: {width: innerWidth, height: innerHeight},
          };
        }""")
        assert active["id"] == expected_id, ("unexpected Tab order", expected_id, active)
        assert active["ariaLabel"] == accessible_name, ("focused control name mismatch", active)
        assert active["role"] == "button", ("focused control is not a button", active)
        assert active["focusVisible"], ("Tab focus did not match :focus-visible", active)
        assert active["outlineStyle"] == "solid" and active["outlineWidth"] == "3px", (
            "keyboard focus outline is not visible", active
        )
        assert active["outlineColor"] not in ("transparent", "rgba(0, 0, 0, 0)"), (
            "keyboard focus outline has no visible color", active
        )
        assert active["rect"]["left"] >= 0 and active["rect"]["top"] >= 0, (
            "focused control is outside the viewport", active
        )
        assert active["rect"]["right"] <= active["viewport"]["width"] and active["rect"]["bottom"] <= active["viewport"]["height"], (
            "focused control is clipped by the viewport", active
        )
        observed.append({"id": active["id"], "name": active["ariaLabel"], "outline": active["outlineColor"]})

    assert not errors, errors
    print("VIZ01_STANDARD_FOCUS_BROWSER_PASS", observed, flush=True)
    context.close()
    browser.close()
