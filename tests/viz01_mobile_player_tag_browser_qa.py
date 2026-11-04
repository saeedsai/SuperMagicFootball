#!/usr/bin/env python3
"""VIZ-01: keep the selected-player HUD readable at mobile sizes."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        executable_path=shutil.which('chromium') or None,
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    for device, viewport, touch in [
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('landscape-touch', {'width': 844, 'height': 390}, True),
        ('portrait-touch', {'width': 390, 'height': 844}, True),
        ('narrow-touch', {'width': 320, 'height': 640}, True),
    ]:
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(html, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        page.wait_for_function("SupermagicFootball.game.matchState==='play'", timeout=15000)
        if touch and viewport['height'] > viewport['width']:
            prompt = page.locator('#rotate')
            if 'hidden' not in (prompt.get_attribute('class') or ''):
                page.keyboard.press('Escape')
                page.wait_for_function("document.querySelector('#rotate').classList.contains('hidden')")
        page.wait_for_function("document.querySelector('#playerTag')?.textContent.length>10", timeout=10000)
        layout = page.evaluate("""() => {
          const tag=document.querySelector('#playerTag');
          const stamina=document.querySelector('#staminaHud');
          const t=tag.getBoundingClientRect(),s=stamina.getBoundingClientRect(),cs=getComputedStyle(tag);
          return {text:tag.textContent,title:tag.title,fontSize:parseFloat(cs.fontSize),
            whiteSpace:cs.whiteSpace,overflow:cs.overflow,textOverflow:cs.textOverflow,
            x:t.x,y:t.y,w:t.width,h:t.height,staminaY:s.y,tagClientWidth:tag.clientWidth,tagScrollWidth:tag.scrollWidth};
        }""")
        assert layout['title'] == layout['text'], (device, 'full details missing from hover title', layout)
        if touch and viewport['width'] <= 700:
            assert layout['fontSize'] >= 11, (device, 'mobile player tag is too small', layout)
            assert layout['whiteSpace'] == 'nowrap' and layout['textOverflow'] == 'ellipsis', (device, layout)
            assert layout['tagScrollWidth'] > layout['tagClientWidth'], (device, 'long player details should be visibly truncated with full title preserved', layout)
            assert layout['y'] + layout['h'] <= layout['staminaY'], (device, 'player tag overlaps stamina HUD', layout)
        assert not errors, (device, errors)
        if device in ('portrait-touch', 'narrow-touch'):
            page.screenshot(path=str(ROOT / 'tests/.generated' / f'viz01_player_tag_{device}.png'))
        print('VIZ01_MOBILE_PLAYER_TAG_PASS', device, layout)
        context.close()
    browser.close()
