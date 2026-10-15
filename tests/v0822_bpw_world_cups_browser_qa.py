from menu_test_routes import open_quick,open_settings
"""Real standalone HTML: BPW category, portraits, home/away startup and save index compatibility.
Desktop Chromium and simulated Android context; not a physical hardware certificate.
"""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
markup=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for label,mobile in [('desktop',False),('simulated Android',True)]:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1400,'height':840} if not mobile else {'width':780,'height':410},is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(markup,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=25000)
  data=page.evaluate('''() => {
   const teams=SupermagicFootball.teams;
   const selected=teams.filter(t=>t.group==='bpw_worldcup');
   return {count:teams.length,ids:selected.map(t=>t.id),
    years:selected.map(t=>t.worldCupYear),
    counts:selected.map(t=>SupermagicFootball.rosterFor(t.index).length),
    flags:selected.map(t=>t.flag),actions:[...document.querySelectorAll('[data-act]')].map(x=>x.dataset.act).sort(),
    historical:teams.filter(t=>t.group==='legends').length};
  }''')
  assert data['count']==223,(label,data)
  assert data['years']==[1998,2002,2006,2010,2014,2018],(label,data)
  assert data['counts']==[12]*6 and data['historical']==6
  assert data['actions']==['dribble','jump','pass','shoot']
  open_quick(page)
  page.locator('#homeGroup').select_option('bpw_worldcup')
  home_names=page.locator('#homeTeam option').all_text_contents()
  assert len(home_names)==6 and any('1998' in s for s in home_names),(label,home_names)
  page.locator('#awayGroup').select_option('bpw_worldcup')
  away_names=page.locator('#awayTeam option').all_text_contents()
  assert len(away_names)==6
  page.locator('#homeTeam').select_option(str(teams_index:=page.evaluate("SupermagicFootball.teams.find(t=>t.id==='bpw_wc_2014').index")))
  page.locator('[data-action="setupTactics"]').click()
  page.locator('[data-action="prepHome"]').first.click()
  assert page.locator('.formationSlot canvas').count()==6,(label,'formation portrait count')
  assert page.locator('.playerFaceCanvas').count()==12,(label,'roster portrait count')
  assert 'Lionel Messi' in page.locator('body').inner_text(),(label,'BPW lineup text')
  live=page.evaluate('''() => {
   const api=SupermagicFootball;
   const year=api.teams.find(t=>t.id==='bpw_wc_2018').index;
   api.game.init({home:0,away:year,options:{...api.game.options,weather:'Clear'}});
   const away={names:api.game.rosters[1].map(p=>p.name),gk:api.game.players.filter(p=>p.t===1&&p.keeper).map(p=>p.src.name)};
   api.game.init({home:year,away:0,options:{...api.game.options,weather:'Clear'}});
   const home={names:api.game.rosters[0].map(p=>p.name),gk:api.game.players.filter(p=>p.t===0&&p.keeper).map(p=>p.src.name)};
   return {home,away,matchState:api.game.matchState};
  }''')
  assert len(live['home']['names'])==len(live['away']['names'])==12
  assert live['home']['gk'] and live['away']['gk'] and live['matchState']=='play'
  # Old user clubs must retain their numeric selection indexes. Seed one saved
  # custom club before app bootstrap using a localStorage mock; set_content has
  # no origin/storage privileges in this isolated QA environment.
  saved=context.new_page()
  saved.evaluate("""() => {
    const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
    const roles=['GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW','GK'];
    const club={id:'club_existing',name:'Saved FC',flag:'FR',primary:'#234567',secondary:'#abcdef',
      trim:'#ffddee',shot:'nuts',rank:75,customRoster:roles.map((role,i)=>({id:'saved_'+i,
      name:'Custom Player '+i,role,num:i+1,age:23,rating:75,power:55,shoot:25,
      defense:25,speed:'B',shot:'nuts',level:1,xp:0}))};
    data.legend_customClubs=JSON.stringify([club]);
  }""")
  saved.set_content(markup,wait_until='load')
  saved.wait_for_function("window.SupermagicFootball?.version==='0.8.24.12-alpha'",timeout=25000)
  positions=saved.evaluate("""() => {
    const teams=SupermagicFootball.teams;
    return {total:teams.length,saved:teams.find(t=>t.id==='club_existing')?.index,
      firstBPW:teams.find(t=>t.id==='bpw_wc_1998')?.index};
  }""")
  assert positions=={'total':224,'saved':216,'firstBPW':217},(label,positions)
  saved.close()
  assert not errors,(label,errors)
  print('PASS',label,'223 teams, six BPW historical mixed squads, home/away filters, player portraits and kickoff',flush=True)
  context.close();browser.close()
