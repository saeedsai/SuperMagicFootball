"""Verify identity data in actual packaged game on desktop and simulated Android."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
html=(Path(__file__).resolve().parents[1]/'play.html').read_text()
with sync_playwright() as pw:
 for mode in ('desktop','simulated Android'):
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1366,'height':800} if mode=='desktop' else {'width':720,'height':390},is_mobile=(mode!='desktop'),has_touch=(mode!='desktop'))
  page=context.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html,wait_until='load')
  page.wait_for_function("window.SupermagicFootball?.version === '0.8.22.1-alpha'",timeout=25000)
  data=page.evaluate('''() => {
    const teams=SupermagicFootball.teams;
    const bar=teams.find(t=>t.name==='Barcelona'&&t.id.startsWith('club26_'));
    const spain=teams.find(t=>t.name==='Spain'&&t.id.startsWith('national26_'));
    const lafc=teams.find(t=>t.name==='Los Angeles FC');
    const club=SupermagicFootball.rosterFor(bar.index);
    const national=SupermagicFootball.rosterFor(spain.index);
    const losAngeles=SupermagicFootball.rosterFor(lafc.index);
    return {bar:club.find(p=>p.name==='Dani Olmo'),spain:national.find(p=>p.name==='Dani Olmo'),
      rosterIds:club.map(p=>p.id),verified:club.filter(p=>p.canonicalId).length,
      lafc: {teamIndex:lafc.index,slots:losAngeles.map(p=>({id:p.id,name:p.name,role:p.role,num:p.num,age:p.age,canonicalId:p.canonicalId}))},
      actions:[...document.querySelectorAll('[data-act]')].map(x=>x.dataset.act).sort()};
  }''')
  assert data['bar']['canonicalId']=='person:dani-olmo:1998-05-07',(mode,data['bar'])
  assert not data['spain'].get('canonicalId'),(mode,data['spain'])
  assert len(data['rosterIds'])==len(set(data['rosterIds']))==12
  assert data['verified']==12,(mode,data['verified'])
  assert len(set(p['num'] for p in data['lafc']['slots']))==12
  assert next(p for p in data['lafc']['slots'] if p['name']=='Son Heung-min')['role']=='FW'
  assert next(p for p in data['lafc']['slots'] if p['name']=='Thomas Hasal')['role']=='GK'
  assert next(p for p in data['lafc']['slots'] if p['name']=='Hugo Lloris')['num']==1
  assert data['actions']==['dribble','jump','pass','shoot']
  assert not errors,(mode,errors)
  print('PASS',mode,'verified person IDs, conservative national-team link, four-button controls',flush=True)
  context.close();browser.close()
