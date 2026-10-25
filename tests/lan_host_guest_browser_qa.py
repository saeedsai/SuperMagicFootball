#!/usr/bin/env python3
"""Two real Chromium contexts: automatic discovery, host consent, WebRTC and live play.

Runs inside the browser-regression CI job after npm installs the ws dependency.
Physical phone/Wi-Fi certification must still be performed separately.
"""
import os
import socket
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
def reserve_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1',0))
        return s.getsockname()[1]

def main():
    port=reserve_port()
    url=f'http://127.0.0.1:{port}/'
    env={**os.environ,'LAN_PORT':str(port),'LAN_BIND':'127.0.0.1','SMF_SIGNAL_MODE':'lan'}
    server=subprocess.Popen(['node','scripts/lan-server.mjs'],cwd=ROOT,env=env,
                            stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
    try:
        for attempt in range(70):
            if server.poll() is not None:
                raise AssertionError('LAN server exited before HTTP was available')
            try:
                with urllib.request.urlopen(url+'healthz',timeout=1) as response:
                    if response.status==200: break
            except Exception:
                time.sleep(.1)
        else: raise AssertionError('LAN server failed health endpoint')

        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
            contexts=[]
            try:
                for role in ('host','guest'):
                    context=browser.new_context(
                        viewport={'width':844,'height':390},is_mobile=True,
                        has_touch=True,device_scale_factor=1)
                    contexts.append(context)
                host=contexts[0].new_page()
                guest=contexts[1].new_page()
                for page in (host,guest):
                    page.goto(url,wait_until='load',timeout=35000)
                    page.wait_for_function('!!window.SupermagicFootball?.game',timeout=35000)
                    page.locator('[data-action="navQuick"]').first.click(timeout=15000)
                    page.locator('[data-action="navLan"]').first.click(timeout=15000)
                    page.locator('#autoHost').wait_for(timeout=10000)
                host.locator('#autoHost').click()
                host.locator('#autoStatus').get_by_text('Room registered',exact=False).wait_for(timeout=10000)
                guest.locator('#autoFind').click()
                guest.locator('#autoRooms button').first.wait_for(timeout=12000)
                guest.locator('#autoRooms button').first.click()
                host.locator('#autoApproval button').first.wait_for(timeout=12000)
                host.locator('#autoApproval button').first.click()
                for page in (host,guest):
                    page.wait_for_function("window.SupermagicFootball?.game?.matchState==='play' && document.querySelector('#menu')?.classList.contains('hidden')",timeout=45000)
                first_host=host.evaluate("() => SupermagicFootball.game.clock")
                first_guest=guest.evaluate("() => SupermagicFootball.game.clock")
                host.wait_for_timeout(1800)
                second_host=host.evaluate("() => SupermagicFootball.game.clock")
                second_guest=guest.evaluate("() => SupermagicFootball.game.clock")
                assert second_host>first_host+0.2,('host clock frozen',first_host,second_host)
                assert second_guest>=first_guest,('guest clock regressed',first_guest,second_guest)
                assert abs(second_host-second_guest)<3.0,('desynchronized clock',second_host,second_guest)
                assert host.evaluate("() => document.querySelector('#field')?.width>0 && document.querySelector('#field')?.height>0"),'host canvas missing'
                assert guest.evaluate("() => document.querySelectorAll('#touchButtons button[data-act]').length===4"),'phone controls missing'
                # Exercise a real away-team input: the guest presses its own left key,
                # transmitted to the host and reflected in the guest snapshot stream.
                before=host.evaluate("() => {let g=SupermagicFootball.game;return g.controlledPlayer(1)?.x}")
                guest.keyboard.down('a')
                host.wait_for_timeout(850)
                guest.keyboard.up('a')
                after=host.evaluate("() => {let g=SupermagicFootball.game;return g.controlledPlayer(1)?.x}")
                assert isinstance(before,(float,int)) and isinstance(after,(float,int)),(before,after)
                assert after<before-0.05,('guest input did not steer host away player left',before,after)
                # Browser render smoke; visual/art QA still requires human screenshots.
                from PIL import Image
                import io
                image=Image.open(io.BytesIO(host.locator('#field').screenshot())).convert('RGB')
                assert image.width>=300 and image.height>=150,'gameplay canvas too small'
                assert len(image.getcolors(maxcolors=1000000) or [])>30,'blank/static canvas'
                print('LAN_TWO_BROWSER_PLAY_PASS',
                      {'host_clock':round(second_host,2),'guest_clock':round(second_guest,2),
                       'away_before':before,'away_after':after,'canvas':image.size},flush=True)
            finally:
                for context in contexts: context.close()
                browser.close()
    finally:
        server.terminate()
        try: server.wait(timeout=4)
        except subprocess.TimeoutExpired: server.kill()

if __name__=='__main__':
    main()
