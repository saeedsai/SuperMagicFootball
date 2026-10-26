#!/usr/bin/env python3
"""Two real Chromium contexts, local WebSocket discovery and WebRTC Quick Match.

This is a browser/LAN integration check, not proof of two physical devices or
internet NAT traversal. Network-scoped internet P2P is tested separately.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os, socket, subprocess, time, urllib.request

ROOT = Path(__file__).resolve().parents[1]

def pick_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]

port = pick_port()
url = f'http://127.0.0.1:{port}/'
env = {**os.environ,'LAN_PORT':str(port),'LAN_BIND':'127.0.0.1','SMF_SIGNAL_MODE':'lan'}
server = subprocess.Popen(['node','scripts/lan-server.mjs'],cwd=ROOT,
                          stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT,env=env)
try:
    for _ in range(80):
        if server.poll() is not None:
            raise RuntimeError('LAN companion server stopped during startup')
        try:
            with urllib.request.urlopen(url+'healthz',timeout=1) as response:
                if response.status==200:
                    break
        except Exception:
            time.sleep(.15)
    else:
        raise AssertionError('LAN companion did not start')
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
        contexts=[browser.new_context(viewport={'width':1280,'height':720}) for _ in range(2)]
        host,guest=[context.new_page() for context in contexts]
        errors=[[],[]]
        host.on('pageerror',lambda error:errors[0].append(str(error)))
        guest.on('pageerror',lambda error:errors[1].append(str(error)))
        for page in (host,guest):
            response=page.goto(url,wait_until='load',timeout=45000)
            assert response and response.status==200
            page.wait_for_function('!!window.SupermagicFootball?.game',timeout=45000)
            page.locator('[data-action="navQuick"]').first.click()
            page.locator('[data-action="navLan"]').first.click()
            page.wait_for_selector('#autoHost',timeout=10000)
        host.locator('#autoHost').click()
        host.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('registered')",timeout=18000)
        guest.locator('#autoFind').click()
        guest.wait_for_function("document.querySelector('#autoRooms')?.querySelector('button')!==null",timeout=18000)
        guest.locator('#autoRooms button').first.click()
        host.wait_for_selector('#autoApproval button',timeout=20000)
        assert host.locator('#autoApproval button').count()==2
        host.locator('#autoApproval button').first.click()
        for name,page in [('host',host),('guest',guest)]:
            page.wait_for_function("window.SupermagicFootball?.game?.matchState==='play' && document.querySelector('#menu')?.classList.contains('hidden')",timeout=45000)
            assert page.locator('#touchButtons button[data-act]').count()==4,name
        host.wait_for_timeout(600)
        state_host=host.evaluate("() => ({clock:SupermagicFootball.game.clock,score:SupermagicFootball.game.score})")
        state_guest=guest.evaluate("() => ({clock:SupermagicFootball.game.clock,score:SupermagicFootball.game.score})")
        assert state_host['clock']>0.1,('host physics must advance',state_host)
        assert abs(state_host['clock']-state_guest['clock'])<1.2,(state_host,state_guest)
        assert state_host['score']==state_guest['score'],(state_host,state_guest)
        assert not any(errors),errors
        print('PASS LAN_REAL_TWO_CHROMIUM_CLIENTS_HOST_FIND_APPROVE_WEBRTC_MATCH',state_host,state_guest,flush=True)
        for context in contexts:
            context.close()
        browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
