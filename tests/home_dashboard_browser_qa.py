from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
from menu_test_routes import home,open_quick
root=Path(__file__).resolve().parents[1]
hero_asset=root/'assets/ui/home-hero-player.webp'
markup=(root/'tests/.generated/play.html').read_text().replace('<head>','<head><base href="http://127.0.0.1:8000/">',1)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 for label,config in [('reference',{'viewport':{'width':1680,'height':945}}),('desktop',{'viewport':{'width':1400,'height':850}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
  page=browser.new_page(**config);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/assets/ui/home-hero-player.webp',lambda route:route.fulfill(path=str(hero_asset)))
  page.set_content(markup,wait_until='load')
  page.wait_for_function("!!window.SupermagicFootball?.game",timeout=12000)
  page.wait_for_function("document.querySelector('.homeHeroPlayer')?.naturalWidth>0",timeout=10000)
  assert page.locator('.navMainList>.navChoice').count()==5
  assert page.locator('.navMainList .navCopy strong').all_text_contents()==['Quick Match','Online','Career','Leagues & Cups','Training']
  assert page.locator('.navMainList>.navChoice').evaluate_all('(els)=>els.every(e=>getComputedStyle(e,"::after").backgroundImage.includes("linear-gradient"))'),(label,'category accents render')
  assert page.locator('.homeKickoff[data-action="quick"]').count()==1,(label,'single Kick Off hero action')
  assert page.locator('[data-action="squad"]').count()==1
  assert page.locator('[data-action="navCustomization"]').count()==1
  assert page.locator('[data-action="navStore"]').count()>=2,'wallet shortcut and Shop dock tile'
  assert page.locator('[data-action="playerStudio"]').count()==1
  assert page.locator('[data-action="navSettings"]').count()>=1
  assert page.locator('#posterCanvas').count()==1
  assert page.locator('.homeEventCopy strong').inner_text()=='MAGIC CUP'
  assert page.locator('.homeNextMatch small').inner_text()=='NEXT MATCH'
  assert page.locator('[data-action="navCups"]').count()==1
  assert page.locator('.arcadeWallet').count()==1
  assert page.locator('.arcadeProfile').count()==1
  hero=page.locator('.homeHeroPlayer')
  assert hero.evaluate('(img)=>img.naturalWidth>0 && img.naturalHeight>0'),(label,'generated hero cutout loaded')
  hero_box=hero.bounding_box()
  assert hero_box and hero_box['width']>100 and hero_box['height']>100,(label,'hero has visible layout bounds',hero_box)
  for action,label_text in [('squad','SQUAD'),('navCustomization','CUSTOMIZE'),('navStore','SHOP'),('playerStudio','PLAYER STUDIO'),('navSettings','SETTINGS')]:
   nodes=page.locator(f'[data-action="{action}"]')
   assert nodes.count()>=1,(label,action,'dock destination exists')
   assert nodes.evaluate_all('(els,label)=>els.some(e=>e.innerText.toUpperCase().replace(/\\s+/g," ").includes(label))',label_text),(label,action,label_text)
  page.screenshot(path=str(root/'tests/.generated'/f'home_dashboard_{label}.png'))
  for name,route in [('Quick Match','navQuick'),('Online','navOnline'),('Career','navCareer'),('Leagues & Cups','navCups'),('Shop','navStore'),('Settings','navSettings')]:
   page.locator(f'[data-action={route}]').first.click()
   if route=='navStore':assert page.locator('.heading').inner_text()=='STORE & TOKENS',(label,name)
   else:assert page.locator('.navScreen').count()==1,(label,name)
   home(page)
  open_quick(page)
  assert page.locator('#homeTeam').count()==1
  home(page)
  home(page)
  page.locator('[data-action="navSettings"]').first.click()
  page.locator('[data-action="navSound"]').click()
  assert page.locator('#audio_master').count()==1
  assert page.locator('.menubox').evaluate('(e)=>e.scrollWidth<=e.clientWidth+3')
  assert not errors,errors
  print(label,'PASS five primary categories, dock actions, navigation, Quick Match, Store and Settings, no overflow/errors')
  page.close()
 browser.close()
