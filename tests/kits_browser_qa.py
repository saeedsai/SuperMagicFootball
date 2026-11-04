from menu_test_routes import open_quick,open_settings,open_feature
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 print('Kit browser: Chromium launched',flush=True)
 for name,viewport,mobile in [('desktop',{'width':1366,'height':768},False),('mobile',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();issues=[]
  page.on('pageerror',lambda e:issues.append(str(e)))
  page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
  print('Kit browser '+name+': loading fixture',flush=True)
  page.set_content((root/'play.html').read_text(encoding='utf-8'),wait_until='load',timeout=45000)
  print('Kit browser '+name+': fixture loaded',flush=True)
  page.wait_for_function("!!window.SupermagicFootball?.game")
  print('Kit browser '+name+': game ready',flush=True)
  assert page.evaluate('NekketsuHD.teams.length')in (223,224,225)
  page.locator('.homeActionTiles [data-action="navCustomization"]').click()
  page.locator('.navScreen [data-action="squad"]').click()
  print('Kit browser '+name+': squad opened',flush=True)
  assert 'AGI' in page.locator('.rosterCard').first.inner_text(), 'Agility must be visible in squad'
  # Entering Squad from Customization returns to that actual parent menu.
  page.locator('button[data-action="navCustomization"]').last.click()
  assert page.locator('.navScreen .heading').inner_text()=='PLAYER & TEAM CUSTOMIZATION', (name,'customization parent')
  page.locator('.navScreen .navBack').click()
  page.locator('.arcadeHomeHeader [data-action="navSettings"]').click()
  assert page.locator('.navScreen .heading').inner_text()=='SETTINGS', (name,'settings parent')
  page.locator('[data-action="home"]').first.click()
  open_quick(page)
  page.locator('[data-action="setupAppearance"]').click()
  print('Kit browser '+name+': kit setup opened',flush=True)
  assert page.locator('#homeKit').count()==1
  assert page.locator('#awayKit').count()==1
  assert page.locator('#homeKit').input_value()=='home'
  assert page.locator('#awayKit').input_value()=='away'
  page.locator('[data-action=returnSetup]').last.click()
  clash=page.evaluate("""() => {const teams=NekketsuHD.teams,kits=t=>NekketsuHD.kitsFor(t),lum=h=>{const c=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]},ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};let best=null;for(let i=0;i<teams.length;i++)for(let j=0;j<teams.length;j++)if(i!==j){const r=ratio(kits(teams[i])[0].primary,kits(teams[j])[1].primary);if(r<2&&(!best||r<best.ratio))best={home:i,away:j,ratio:r}}return best}""")
  assert clash and clash['ratio']<2,('No default-color clash pair found',clash)
  page.locator('#homeTeam').select_option(str(clash['home']))
  page.locator('#awayTeam').select_option(str(clash['away']))
  page.locator('[data-action=setupAppearance]').click()
  status=page.locator('#kitContrastStatus')
  assert float(status.inner_text().split(':')[1].split(':')[0])<2,('Clash status should explain similar colors',status.inner_text())
  assert page.locator('[data-action=autoContrastKits]').count()==1
  page.locator('[data-action=autoContrastKits]').click()
  assert page.evaluate('document.activeElement.id')=='homeKit',('Recommendation should return focus to the first kit selector',page.evaluate('document.activeElement.outerHTML'))
  status_text=status.inner_text()
  assert float(status_text.split(':')[1].split(':')[0])>=2,('Recommendation did not resolve contrast',status_text)
  assert page.locator('[data-action=autoContrastKits]').count()==0
  before=page.evaluate("document.getElementById('homeKitDot').style.background")
  alternate='away' if page.locator('#homeKit').input_value()=='home' else 'home'
  page.locator('#homeKit').focus()
  page.locator('#homeKit').select_option(alternate)
  after=page.evaluate("document.getElementById('homeKitDot').style.background")
  assert before!=after,('Kit preview did not change',before,after)
  assert page.evaluate('document.activeElement.id')=='homeKit',('Manual kit changes should preserve selector focus',page.evaluate('document.activeElement.outerHTML'))
  page.locator('#homeKit').select_option('away')
  page.locator('#awayKit').focus()
  page.locator('#awayKit').select_option('home')
  assert page.evaluate('document.activeElement.id')=='awayKit',('Away kit changes should preserve selector focus',page.evaluate('document.activeElement.outerHTML'))
  assert page.evaluate("NekketsuHD.getKitChoices().join(',')")=='away,home'
  page.screenshot(path=str(root/'tests'/f'kits_setup_{name}.png'))
  page.locator('[data-action="returnSetup"]').last.click()
  assert page.locator('#homeKitCaption').inner_text().endswith('AWAY KIT')
  page.locator('[data-action="kickoff"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert page.evaluate('NekketsuHD.game.getTeam(0).kit')=='away'
  assert page.evaluate('NekketsuHD.game.getTeam(1).kit')=='home'
  page.screenshot(path=str(root/'tests'/f'kits_match_{name}.png'))
  print('Kit browser '+name+': match screenshot captured',flush=True)
  page.locator('#pauseBtn').click(force=True)
  assert page.evaluate('NekketsuHD.game.matchState')=='paused'
  page.locator('[data-action="resume"]').first.click()
  assert page.evaluate('NekketsuHD.game.matchState')=='play'
  assert not issues,issues
  print('Kit browser '+name+': PASS • 2 kits • live preview • selected game colors • pause/resume')
  ctx.close()
 browser.close()
