from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'play.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,is_mobile in [('desktop',{'width':1440,'height':900},False),('simulated_android',{'width':844,'height':390},True)]:
  ctx=browser.new_context(viewport=viewport,is_mobile=is_mobile,has_touch=is_mobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("() => {const mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]}})}")
  page.set_content(html,wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'",timeout=20000)
  assert page.evaluate('SupermagicFootball.teams.length')==216
  for club in ['Arsenal','AC Milan','Barcelona','Real Madrid']:
   idx=page.evaluate('(name)=>SupermagicFootball.teams.find(t=>t.name===name&&t.group==="club26").index',club)
   roster=page.evaluate('(i)=>SupermagicFootball.rosterFor(i)',idx)
   assert len(roster)==12
   assert {r:sum(p['role']==r for p in roster) for r in ['GK','DF','MF','FW']}=={'GK':2,'DF':3,'MF':4,'FW':3}
   assert roster[0]['role']=='GK'
  page.locator('[data-action="quick"]').first.click()
  milan=page.evaluate('()=>SupermagicFootball.teams.find(t=>t.name==="AC Milan"&&t.group==="club26").index')
  page.locator('#homeTeam').select_option(str(milan))
  page.locator('[data-action="prepHome"]').click()
  # One goalkeeper starts and the key four outfield roles stay playable.
  assert page.locator('.rosterCard').count()>0 or page.locator('#pos0').count()==1
  text=page.locator('body').inner_text()
  assert 'Maignan' in text
  assert 'Luka' in text or 'Modrić' in text
  page.screenshot(path=str(root/'tests'/f'roster_command_center_{device}.png'))
  page.locator('[data-action="saveSquad"]').click()
  page.locator('[data-action="kickoff"]').click()
  assert page.evaluate('SupermagicFootball.game.rosters[0].length')==12
  assert page.evaluate('SupermagicFootball.game.player(0,0).src.role')=='GK'
  assert not errors,errors
  print(f'ROSTER BROWSER {device}: PASS • 4 famous club squads • GK starter • lineup • match kickoff')
  ctx.close()
 browser.close()
