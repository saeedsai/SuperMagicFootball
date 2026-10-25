#!/usr/bin/env python3
"""LAN acceptance smoke: real Chromium tabs, local WebSocket broker, real WebRTC.
Run after npm ci: python3 tests/lan_auto_two_browser_qa.py
A successful run is not a two-physical-device or hosted-Pages certification.
"""
import io
import os
import socket
import subprocess
import time
import urllib.request
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_http(url, proc):
    until = time.monotonic() + 25
    while time.monotonic() < until:
        if proc.poll() is not None:
            raise RuntimeError("LAN server terminated before accepting HTTP requests")
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(.2)
    raise TimeoutError("LAN server did not become ready")


def open_lan_menu(page, origin):
    page.goto(origin + "/", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_function("Boolean(window.NekketsuHD?.game)", timeout=90000)
    page.locator('[data-action="navQuick"]').first.click()
    page.locator('[data-action="navLan"]').first.click()
    page.locator("#autoStatus").wait_for(timeout=20000)


def has_gameplay(page):
    page.wait_for_function("""() => !!window.NekketsuHD &&
        document.querySelector('#menu')?.classList.contains('hidden') &&
        window.NekketsuHD.game?.matchState === 'play'""", timeout=90000)


def colorful_screenshot(page):
    shot = Image.open(io.BytesIO(page.screenshot(full_page=False))).convert("RGB")
    sample = shot.resize((100, 60))
    assert len(sample.getcolors(maxcolors=6000) or []) > 25, "LAN gameplay graphic is blank"


def main():
    port = free_port()
    origin = f"http://127.0.0.1:{port}"
    env = {**os.environ, "LAN_PORT": str(port), "LAN_BIND": "0.0.0.0",
           "SMF_SIGNAL_MODE": "lan"}
    proc = subprocess.Popen(["node", "scripts/lan-server.mjs"], cwd=ROOT, env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        wait_http(origin, proc)
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
            host_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
            guest_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
            host = host_ctx.new_page()
            guest = guest_ctx.new_page()
            try:
                open_lan_menu(host, origin)
                open_lan_menu(guest, origin)
                host.locator("#autoHost").click()
                host.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('Room registered')", timeout=20000)
                # The companion server must supply a shareable private address, never localhost.
                host.wait_for_function("document.querySelector('#autoHostInfo')?.textContent.includes('http://')", timeout=20000)
                guest.locator("#autoFind").click()
                join = guest.locator("#autoRooms button")
                join.first.wait_for(timeout=20000)
                assert "JOIN " in join.first.inner_text()
                join.first.click()
                host.locator("#autoApproval button").filter(has_text="ACCEPT GUEST").click(timeout=20000)
                has_gameplay(host)
                has_gameplay(guest)
                host.wait_for_function("window.NekketsuHD.game.clock > 0.2", timeout=30000)
                guest.wait_for_function("window.NekketsuHD.game.clock > 0.2", timeout=30000)
                guest.keyboard.down("ArrowRight")
                time.sleep(.4)
                guest.keyboard.up("ArrowRight")
                h = host.evaluate("({clock:window.NekketsuHD.game.clock,score:window.NekketsuHD.game.score})")
                g = guest.evaluate("({clock:window.NekketsuHD.game.clock,score:window.NekketsuHD.game.score})")
                assert abs(h["clock"] - g["clock"]) < 1.5, (h, g)
                assert h["score"] == g["score"], (h, g)
                colorful_screenshot(host)
                colorful_screenshot(guest)
                print("LAN REAL BROWSER PASS: auto discovery, approval, WebRTC, authoritative match and visible graphics")
            finally:
                host_ctx.close()
                guest_ctx.close()
                browser.close()
    finally:
        proc.terminate()
        try:
            proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.communicate(timeout=5)


if __name__ == "__main__":
    main()
