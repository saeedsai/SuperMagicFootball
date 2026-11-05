#!/usr/bin/env python3
"""Desktop/touch smoke QA for the Store route, prices, collection ownership, and safe free choices."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import threading
from pathlib import Path
from urllib.parse import unquote
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
assert FIXTURE.exists(),'Build the current game fixture first'
FIXTURE_HTML=FIXTURE.read_bytes()
players=json.loads((ROOT/'data/players/arcade.json').read_text(encoding='utf-8'))['japan']
players[0].update({'statsVerified':True,**{key:95 for key in ['passing','crossing','dribbling','agility','stamina','speedRating']}})
seed={'wallet':{'schema':1,'tokens':2000,'unlocks':[],'receipts':[]},'edits':{'japan':players}}

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path in ('/','/index.html'):
            self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8')
            self.send_header('Content-Length',str(len(FIXTURE_HTML)));self.end_headers();self.wfile.write(FIXTURE_HTML);return
        super().do_GET()
    def log_message(self,*_args): pass

def wait_for_unlock_notice(page):
    page.wait_for_function("() => (document.querySelector('#tokenStoreNotice')?.textContent || '').toLowerCase().includes('unlocked')", timeout=5000)

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for device,touch,viewport in [('desktop',False,{'width':1440,'height':1000}),('touch',True,{'width':390,'height':844})]:
   context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch,accept_downloads=True)
   context.add_init_script(f"if(!sessionStorage.getItem('__tokenStoreSeeded')){{localStorage.setItem('legend_tokenWallet',JSON.stringify({json.dumps(seed['wallet'])}));localStorage.setItem('legend_edits',JSON.stringify({json.dumps(seed['edits'])}));sessionStorage.setItem('__tokenStoreSeeded','1');}}")
   page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(origin,wait_until='load')
   page.wait_for_timeout(500)
   store_route=page.locator('.homeActionTiles [data-action="navStore"]')
   wallet_shortcut=page.locator('.arcadeWallet[data-action="navStore"]')
   if store_route.count()!=1:
    raise AssertionError((device,'Store Home route missing',errors,page.locator('body').inner_text()[:1200]))
   assert wallet_shortcut.count()==1 and 'Token balance: 2,000' in wallet_shortcut.get_attribute('aria-label'),(device,'wallet shortcut must remain uniquely labelled')
   assert 'SHOP' in store_route.inner_text(),(device,'Shop shortcut should remain visible in the Home dock')
   store_route.click()
   assert page.locator('#tokenStoreBalance').inner_text()=='2,000 TOKENS'
   categories=['superShot','magicTrick','team','player','appearance','accessory']
   search_names={'superShot':'SUPER SHOTS','magicTrick':'MAGIC TRICKS','team':'TEAMS','player':'PLAYERS','appearance':'APPEARANCE','accessory':'ACCESSORIES'}
   assert page.locator('#storeCategory option').count()==6
   for category in categories:
    page.locator('#storeCategory').select_option(category)
    assert page.get_by_role('searchbox',name=f'SEARCH {search_names[category]}').count()==1,(device,category,'search input accessible name did not follow the selected category')
    assert page.locator('.tokenStoreCard').count()>0,(device,category,page.locator('#tokenStoreCards').inner_text(),errors)
   page.locator('#storeCategory').select_option('team');page.locator('#storeSearch').fill('Japan')
   team_card=page.locator('.tokenStoreCard').first
   assert '300 TOKENS' in team_card.inner_text() and 'playable for free' in page.locator('#menu').inner_text().lower()
   team_card.locator('button').click()
   wait_for_unlock_notice(page);
   assert 'unlocked' in page.locator('#tokenStoreNotice').inner_text().lower(),(device,page.locator('#tokenStoreNotice').inner_text(),errors)
   assert page.locator('#tokenStoreBalance').inner_text()=='1,700 TOKENS'
   page.locator('#storeOwnedOnly').check()
   assert page.locator('.tokenStoreCard button').inner_text()=='OWNED'
   page.locator('#storeOwnedOnly').uncheck()
   page.locator('#storeCategory').select_option('player');page.locator('#storeSearch').fill('Kunio')
   player_card=page.locator('.tokenStoreCard').first
   assert '250 TOKENS' in player_card.inner_text()
   player_card.locator('button').click()
   wait_for_unlock_notice(page);
   assert 'unlocked' in page.locator('#tokenStoreNotice').inner_text().lower()
   assert page.locator('#tokenStoreBalance').inner_text()=='1,450 TOKENS'
   page.goto(origin,wait_until='load');page.locator('[data-action="navQuick"]').click();page.locator('[data-action="navOnDevice"]').click();page.locator('[data-action="quick"]').click()
   assert sum('Japan' in label for label in page.locator('#homeTeam option').all_text_contents())>=1,'buying a team must not gate its existing quick-match selection'
   assert page.locator('#awayTeam option').count()>0,'existing teams remain available to opponents'
   page.goto(origin,wait_until='load');page.locator('.homeActionTiles [data-action="navStore"]').click()
   page.locator('#storeCategory').select_option('superShot')
   page.locator('#storeSearch').fill('Banana')
   card=page.locator('.tokenStoreCard').first
   assert '120 TOKENS' in card.inner_text()
   card.locator('button').click()
   wait_for_unlock_notice(page);
   assert 'unlocked' in page.locator('#tokenStoreNotice').inner_text().lower()
   assert page.locator('#tokenStoreBalance').inner_text()=='1,330 TOKENS'
   assert page.locator('.tokenStoreCard button').inner_text()=='OWNED',(page.locator('.tokenStoreCard button').inner_text(),page.locator('#tokenStoreNotice').inner_text(),page.locator('#tokenStoreBalance').inner_text(),errors)
   page.reload(wait_until='load');page.locator('.homeActionTiles [data-action="navStore"]').click()
   page.locator('#storeCategory').select_option('superShot');page.locator('#storeSearch').fill('Banana')
   assert page.locator('.tokenStoreCard button').inner_text()=='OWNED'
   page.locator('#storeCategory').select_option('magicTrick');page.locator('#storeSearch').fill('Banana Peel')
   trick_card=page.locator('.tokenStoreCard').first
   assert '160 TOKENS' in trick_card.inner_text()
   trick_card.locator('button').click()
   wait_for_unlock_notice(page);
   assert 'unlocked' in page.locator('#tokenStoreNotice').inner_text().lower()
   assert page.locator('#tokenStoreBalance').inner_text()=='1,170 TOKENS'
   page.goto(origin,wait_until='load');page.locator('[data-action="navCustomization"]').click();page.locator('[data-action="playerStudio"]').click()
   assert page.locator('#studioMagic option[value="banana"]').count()==1,'owned Trick should appear for a verified Star+ field player'
   page.locator('#customPlayer').select_option('1')
   assert page.locator('#studioMagic option[value="banana"]').count()==0,'purchase must not bypass another player’s tier gate'
   page.locator('#customPlayer').select_option('0')
   current_style=int(page.locator('#face_style').input_value())
   current_accessory=int(page.locator('#face_accessory').input_value())
   page.goto(origin,wait_until='load');page.locator('.homeActionTiles [data-action="navStore"]').click()
   page.locator('#storeCategory').select_option('appearance');page.locator('#storeSearch').fill('STYLE')
   appearance_action=None
   for _ in range(5):
    for card in page.locator('.tokenStoreCard').all():
     candidate=card.locator('button').get_attribute('data-action')
     index=int(unquote(candidate.rsplit('_',1)[-1]).split(':')[-1])
     if index!=current_style:
      appearance_action=candidate;card.locator('button').click();break
    if appearance_action:break
    if page.locator('#storePageNext').is_disabled():break
    page.locator('#storePageNext').click()
   assert appearance_action,(device,'could not find a non-current purchasable hairstyle')
   appearance_key=int(unquote(appearance_action.rsplit('_',1)[-1]).split(':')[-1])
   wait_for_unlock_notice(page);
   assert 'unlocked' in page.locator('#tokenStoreNotice').inner_text().lower(),(page.locator('#tokenStoreNotice').inner_text(),page.locator('#tokenStoreBalance').inner_text(),appearance_action,errors)
   page.goto(origin,wait_until='load')
   page.locator('[data-action="navCustomization"]').click()
   page.locator('[data-action="playerStudio"]').click()
   assert page.locator('#face_style option').count()>1
   assert page.locator(f'#face_style option[value="{appearance_key}"]').count()==1
   page.goto(origin,wait_until='load');page.locator('.homeActionTiles [data-action="navStore"]').click()
   page.locator('#storeCategory').select_option('accessory')
   page.locator('#storeSearch').fill('ACCESSORY')
   accessory_action=None
   for _ in range(5):
    for card in page.locator('.tokenStoreCard').all():
     candidate=card.locator('button').get_attribute('data-action')
     index=int(unquote(candidate.rsplit('_',1)[-1]).split(':')[-1])
     if index!=current_accessory:
      accessory_action=candidate;card.locator('button').click();break
    if accessory_action:break
    if page.locator('#storePageNext').is_disabled():break
    page.locator('#storePageNext').click()
   assert accessory_action,(device,'could not find a non-current accessory')
   accessory_key=int(unquote(accessory_action.rsplit('_',1)[-1]).split(':')[-1])
   wait_for_unlock_notice(page);
   assert 'unlocked' in page.locator('#tokenStoreNotice').inner_text().lower()
   page.goto(origin,wait_until='load');page.locator('[data-action="navCustomization"]').click();page.locator('[data-action="playerStudio"]').click()
   assert page.locator(f'#face_accessory option[value="{accessory_key}"]').count()==1
   page.goto(origin,wait_until='load');page.locator('.homeActionTiles [data-action="navStore"]').click()
   assert 'Online peer-match receipts are host-authoritative and pay each device\'s local soft-token wallet; they are not server-verified.' in page.locator('body').inner_text()
   assert 'No real-money purchases or token packs are available.' in page.locator('body').inner_text()
   assert not errors,(device,errors)
   print('TOKEN_STORE_BROWSER_PASS',device)
   context.close()
  browser.close()
finally:
 server.shutdown();server.server_close()
