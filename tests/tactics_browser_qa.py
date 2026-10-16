from menu_test_routes import open_quick,open_settings
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,viewport,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':844,'height':390},True)]:
   ctx=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.evaluate("""() => {let data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
   page.set_content((root/'play.html').read_text(),wait_until='load')
   page.wait_for_function("window.NekketsuHD?.version==='0.8.24.12-alpha'")
   assert page.evaluate('NekketsuHD.teams.length')in (223,224)
   open_quick(page)
   assert page.locator('.nationCard .teamIdentity').count()==2
   page.locator('#homeTeam').select_option('0')
   page.locator('[data-action="setupTactics"]').click()
   page.locator('[data-action="prepHome"]').click()
   assert page.locator('#role_captain').count()==1
   assert page.locator('#role_penalty').count()==1
   assert page.locator('#role_freeKick').count()==1
   assert page.locator('#role_corner').count()==1
   assert page.locator('#attackStyle').count()==1
   assert page.locator('#defenceStyle').count()==1
   page.locator('#formation').select_option('1-3-1')
   page.locator('#pos1').select_option('7')
   page.locator('#role_captain').select_option('0')
   page.locator('#role_penalty').select_option('0')
   page.locator('#attackStyle').select_option('Direct')
   page.locator('#defenceStyle').select_option('High Press')
   page.screenshot(path=str(root/'tests'/f'command_center_{name}.png'))
   page.locator('[data-action="saveSquad"]').click()
   assert page.locator('[data-action="kickoff"]').count()==1
   assert page.evaluate("NekketsuHD.getTeamPlan(0).formation")=='1-3-1'
   assert page.evaluate("NekketsuHD.getTeamPlan(0).lineup[1]")==7
   assert page.evaluate("NekketsuHD.getTeamPlan(0).attack")=='Direct'
   page.locator('[data-action="kickoff"]').click()
   assert page.evaluate('NekketsuHD.game.teamPlans[0].captain')==0
   assert page.evaluate('NekketsuHD.game.player(0,1).src.id')=='jp7'
   page.locator('#pauseBtn').click(force=True)
   assert page.evaluate('NekketsuHD.game.matchState')=='paused'
   page.locator('[data-action="tacticHome"]').click()
   page.locator('#pos1').select_option('3')
   page.locator('#role_captain').select_option('0')
   page.locator('#attackStyle').select_option('Possession')
   page.locator('[data-action="saveSquad"]').click()
   assert page.evaluate('NekketsuHD.game.matchState')=='paused'
   assert page.evaluate('NekketsuHD.game.teamPlans[0].attack')=='Possession'
   assert page.evaluate('NekketsuHD.game.player(0,1).src.id')=='jp3'
   page.screenshot(path=str(root/'tests'/f'tactics_pause_{name}.png'))
   page.locator('[data-action="resume"]').click()
   assert page.evaluate('NekketsuHD.game.matchState')=='play'
   assert page.evaluate("JSON.parse(localStorage.getItem('legend_teamPlans')).japan.attack")=='Possession' 
   assert page.evaluate('NekketsuHD.getTeamPlan(0).attack')=='Possession','save should persist'
   assert not errors,errors
   print('v0.7.0 tactical browser '+name+': PASS • menus/roles • pre-match • pause • saved team plans • visual badges')
   ctx.close()
 browser.close()

