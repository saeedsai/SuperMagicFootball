#!/usr/bin/env python3
"""Verify that app menus allow browser pinch zoom without releasing game gestures."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build the current game fixture first'
HTML = FIXTURE.read_text(encoding='utf-8')

CHECK_PARENTS = r'''(targetSelector)=>{
  const target=document.querySelector(targetSelector);
  if(!target)throw Error('missing '+targetSelector);
  const ancestors=[];
  for(let node=target;node;node=node.parentElement){
    const action=getComputedStyle(node).touchAction;
    ancestors.push({node:node.id||node.className||node.tagName,action});
  }
  const permitsPinch=action=>['auto','manipulation','pinch-zoom'].includes(action)||action.split(/\s+/).includes('pinch-zoom');
  return {target:targetSelector,ancestors,pinchAllowed:ancestors.every(row=>permitsPinch(row.action))};
}'''

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage'])
    for device, viewport in [('narrow-touch', {'width': 320, 'height': 568}), ('landscape-touch', {'width': 844, 'height': 390})]:
        context = browser.new_context(viewport=viewport, is_mobile=True, has_touch=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(HTML, wait_until='load')

        menu = page.evaluate(CHECK_PARENTS, '.menu .heading')
        assert menu['pinchAllowed'], (device, 'menu ancestor intersection blocks pinch zoom', menu)
        assert all('pan-y' in row['action'] for row in menu['ancestors'] if row['node'] in ['menu','menubox']), (device, menu)

        joy = page.evaluate(CHECK_PARENTS, '#joyZone')
        buttons = page.evaluate(CHECK_PARENTS, '#touchButtons button')
        assert not joy['pinchAllowed'] and not buttons['pinchAllowed'], (device, 'game action targets must retain touch capture', joy, buttons)

        page.locator('[data-action="navCustomization"]').click()
        page.locator('[data-action="playerStudio"]').click()
        portrait = page.evaluate(CHECK_PARENTS, '#customPortrait')
        assert not portrait['pinchAllowed'], (device, 'drag-to-rotate canvas must retain pointer capture', portrait)
        assert not errors, (device, errors)
        print('UX102_PINCH_ZOOM_PASS', device, 'menu ancestor intersection permits pinch; game controls and portrait remain captured')
        context.close()
    browser.close()
