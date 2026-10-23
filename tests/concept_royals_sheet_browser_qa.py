#!/usr/bin/env python3
"""Capture genuine Concept Royals sprite sheets with Chromium and the game renderer.

No mock graphics, AI illustrations, or screenshots of a different build.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright
import hashlib
import json
import base64

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/qa_runs_concept_hero'
OUT.mkdir(parents=True, exist_ok=True)
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
result = {}
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                     args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width': 1650, 'height': 920}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/concept-royals-visual-qa.html',
                  wait_until='load', timeout=30000)
        page.wait_for_function("document.querySelector('#status').textContent.includes('Rendered from the game atlas')",
                               timeout=30000)
        assert page.locator('#sheet').count() == 1
        assert page.locator('#sheet').get_attribute('width') == '1560'
        idle = OUT / 'concept_royals_12_players_5_views_idle.png'
        timeline = OUT / 'concept_royals_12_players_5_views_running_timeline.png'
        idle.write_bytes(base64.b64decode(page.evaluate("document.querySelector('#sheet').toDataURL('image/png')").split(',', 1)[1]))
        page.locator('#timeline').click()
        page.wait_for_function("document.querySelector('#status').textContent.includes('300 actual renderer calls')",
                               timeout=30000)
        timeline.write_bytes(base64.b64decode(page.evaluate("document.querySelector('#sheet').toDataURL('image/png')").split(',', 1)[1]))
        with Image.open(idle) as a, Image.open(timeline) as b:
            assert a.size == b.size == (1560, 2440), (a.size, b.size)
            assert ImageChops.difference(a.convert('RGB'), b.convert('RGB')).getbbox(), 'Idle and running sheet are identical'
        # Check each row contains actual pixels in the five view cells.
        with Image.open(idle) as image:
            for i in range(12):
                for j in range(5):
                    x, y = 35+j*256, 60+i*197
                    tile = image.crop((x+15, y+25, x+175, y+150)).convert('RGB')
                    colors = tile.getcolors(tile.width*tile.height)
                    assert colors is not None and len(colors) > 35, f'Blank or flat render: player={i}, view={j}'
        assert not errors, errors
        result = {
            'status': 'PASS', 'source': 'src/modules/concepthero.js + assets/concept_hero/hero_atlas.webp',
            'players': 12, 'directions': 5, 'idle_samples': 60, 'running_samples': 300,
            'action_animations_verified': ['experimental running stride'],
            'not_yet_verified': ['jump', 'tackle', 'shoot', 'super actions'],
            'pngs': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (idle, timeline)},
            'browser_errors': errors
        }
        browser.close()
finally:
    server.shutdown()
    server.server_close()
(OUT / 'concept_royals_sheet_report.json').write_text(json.dumps(result, indent=2))
print('CONCEPT ROYALS 12x5 REAL RENDERER SHEET QA', json.dumps(result))
