#!/usr/bin/env python3
"""Actual split-module Chromium checks for performance HUD and startup recovery."""
from pathlib import Path
import json, mimetypes
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
checks = []

def verify(label, okay, detail=''):
    checks.append({'case': label, 'status':'PASS' if okay else 'FAIL', 'detail': detail})
    print(('PASS ' if okay else 'FAIL ')+label+(' '+detail if not okay else ''), flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    for touch in (False,True):
        ctx=browser.new_context(viewport={'width':844 if touch else 1300,'height':390 if touch else 720},is_mobile=touch,has_touch=touch)
        page=ctx.new_page(); errors=[]
        page.on('pageerror',lambda err:errors.append(str(err)))
        def files(route):
            path=route.request.url.partition('https://supermagic.test/')[2].split('?')[0]
            file=ROOT/path
            if not file.is_file(): return route.fulfill(status=404,body='missing')
            return route.fulfill(status=200,body=file.read_bytes(),content_type=mimetypes.guess_type(str(file))[0] or 'text/plain',headers={'access-control-allow-origin':'*'})
        page.route('https://supermagic.test/**', files)
        page.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="https://supermagic.test/">'))
        page.wait_for_function('!!window.SupermagicFootball',timeout=30000)
        mode='mobile-touch' if touch else 'desktop'
        state=page.evaluate('''()=>({off:SupermagicFootball.game.options.showPerformance===false,hidden:document.querySelector('#perfHud').classList.contains('hidden'),actions:document.querySelectorAll('[data-act]').length})''')
        verify(mode+' default OFF; exactly four actions',state['off'] and state['hidden'] and state['actions']==4,str(state))
        page.locator('[data-action="navSettings"]').click();page.locator('[data-action="navGraphics"]').click()
        verify(mode+' FPS option exists',page.locator('#showPerformance').count()==1)
        page.select_option('#showPerformance','true');page.locator('[data-action="saveSettings"]').click()
        page.evaluate('''()=>{const g=SupermagicFootball.game;g.init({home:0,away:9,mode:'quick',humans:0,options:g.options});g.matchState='play';document.querySelector('#menu').classList.add('hidden');}''')
        page.wait_for_function("document.querySelector('#perfHud').textContent.includes('FPS')",timeout=6000)
        telemetry=page.evaluate('''()=>({visible:!document.querySelector('#perfHud').classList.contains('hidden'),text:document.querySelector('#perfHud').textContent,actions:document.querySelectorAll('[data-act]').length})''')
        verify(mode+' live FPS and ms/frame while playing',telemetry['visible'] and telemetry['actions']==4 and ' ms' in telemetry['text'],str(telemetry))
        page.evaluate("()=>{SupermagicFootball.game.matchState='paused';document.querySelector('#menu').classList.remove('hidden')}")
        page.wait_for_timeout(180)
        verify(mode+' performance overlay hidden when paused',page.evaluate("document.querySelector('#perfHud').classList.contains('hidden')"))
        verify(mode+' no uncaught errors',not errors,str(errors))
        ctx.close()
    ctx=browser.new_context();page=ctx.new_page()
    def broken(route):
        path=route.request.url.partition('https://supermagic.test/')[2].split('?')[0]
        file=ROOT/path
        if path=='data/teams.json' or not file.is_file():return route.fulfill(status=404,body='missing')
        return route.fulfill(status=200,body=file.read_bytes(),content_type=mimetypes.guess_type(str(file))[0] or 'text/plain',headers={'access-control-allow-origin':'*'})
    page.route('https://supermagic.test/**',broken)
    page.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="https://supermagic.test/">'))
    page.wait_for_selector('#retryLoad',timeout=15000)
    verify('broken JSON offers retry button and cause',page.locator('#retryLoad').count()==1 and 'GAME FILES UNAVAILABLE' in page.locator('#menu').inner_text())
    ctx.close();browser.close()
summary={'PASS':sum(t['status']=='PASS' for t in checks),'FAIL':sum(t['status']=='FAIL' for t in checks)}
print('SUMMARY',summary,flush=True)
(ROOT/'docs/QA_PERFORMANCE_BROWSER_v082531.json').write_text(json.dumps({'summary':summary,'checks':checks},indent=2))
if summary['FAIL']:raise SystemExit(1)
