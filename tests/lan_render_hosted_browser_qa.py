#!/usr/bin/env python3
"""Release gate: REAL hosted Render WSS + public GitHub Pages two-mobile-browser LAN session.

Uses the currently published Pages bundle with a preloaded signaling endpoint
so a dev PR can certify hosted matchmaking before Pages is promoted. Once
main deploys, the endpoint is part of the released bundle itself.
"""
from playwright.sync_api import sync_playwright
import time

PAGES='https://saeedsai.github.io/SuperMagicFootball/'
SIGNAL='wss://supermagicfootball-lan-signal.onrender.com/lan-signal'

def main():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  contexts=[]
  try:
   for role in ('host','guest'):
    context=browser.new_context(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,ignore_https_errors=False)
    context.add_init_script("window.SMF_LAN_SIGNAL_URL="+repr(SIGNAL)+";")
    contexts.append(context)
   host=contexts[0].new_page()
   guest=contexts[1].new_page()
   for page in [host,guest]:
    page.goto(PAGES,wait_until='load',timeout=45000)
    page.wait_for_function("!!window.SupermagicFootball?.game",timeout=45000)
    page.locator('[data-action="navQuick"]').first.click(timeout=15000)
    page.locator('[data-action="navLan"]').first.click(timeout=15000)
   host.locator('#autoHost').click()
   host.locator('#autoStatus').filter(has_text='Room registered').wait_for(timeout=25000)
   guest.locator('#autoFind').click()
   guest.locator('#autoRooms button').first.wait_for(timeout=25000)
   guest.locator('#autoRooms button').first.click()
   host.locator('#autoApproval button').first.wait_for(timeout=15000)
   host.locator('#autoApproval button').first.click()
   for page in [host,guest]:
    page.wait_for_function("window.SupermagicFootball?.game?.matchState==='play' && document.querySelector('#menu')?.classList.contains('hidden')",timeout=45000)
   before=host.evaluate("() => SupermagicFootball.game.clock")
   host.wait_for_timeout(1800)
   after=host.evaluate("() => SupermagicFootball.game.clock")
   guest_clock=guest.evaluate("() => SupermagicFootball.game.clock")
   assert after>before+.2,('host clock frozen',before,after)
   assert abs(guest_clock-after)<3,('guest snapshot lag',guest_clock,after)
   assert guest.locator('#touchButtons button[data-act]').count()==4
   print('RENDER_PAGES_MOBILE_WEBRTC_PASS',round(after,2),round(guest_clock,2),flush=True)
  finally:
   for c in contexts: c.close()
   browser.close()

if __name__=='__main__':
 main()
