from menu_test_routes import open_quick,open_settings,open_feature,home
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1] / 'tests' / '.generated' / 'play.html'
with sync_playwright() as pw:
 for device in ['desktop','mobile']:
  browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1400,'height':850} if device=='desktop' else {'width':390,'height':844},has_touch=device=='mobile',is_mobile=device=='mobile')
  page=context.new_page();errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(p.read_text(),wait_until='load');page.wait_for_function("!!window.SupermagicFootball?.game")
  open_feature(page,'manager')
  assert page.locator('#managerContinent').count()==1
  assert page.locator('#managerCountry').count()==1
  region=page.locator('#managerContinent').input_value(); print(device,'career region',region,'countries',page.locator('#managerCountry option').count())
  page.locator('#managerContinent').select_option('CONMEBOL'); assert page.locator('#managerCountry').count()==1
  choices=page.locator('#managerCountry option').all_text_contents();assert choices
  page.locator('#managerCountry').select_option(label='Brazil')
  assert page.locator('#managerClub option').count()>=1
  assert 'Flamengo' in page.locator('#managerClub').inner_text() or 'Palmeiras' in page.locator('#managerClub').inner_text()
  page.locator('[data-team-browse="managerClub"]').click()
  assert page.locator('#managerClubBrowse:not(.hidden)').count()==1
  assert page.locator('#managerClubResults .teamIdentity').count()>0
  first=page.locator('#managerClubResults [data-pick-team]').first
  picked=first.get_attribute('data-team-id');first.click()
  assert page.locator('#managerClub').input_value()==picked
  home(page)
  open_feature(page,'continents')
  page.locator('[data-action="continentPick_UEFA"]').first.click()
  assert page.locator('[data-team-browse="continentClub"]').count()==1
  page.locator('[data-team-browse="continentClub"]').click()
  assert page.locator('#continentClubResults .teamIdentity').count()>0
  open_feature(page,'continents')
  home(page)
  open_quick(page)
  page.locator('[data-team-browse="homeTeam"]').click()
  assert page.locator('#homeTeamResults .teamIdentity').count()>0
  page.locator('#homeTeamSearch').fill('Japan')
  assert page.locator('#homeTeamResults [data-pick-team]').count()>=1
  page.locator('#homeTeamResults [data-pick-team]').first.click()
  assert page.locator('#homeTeamIdentity .flagGraphic').count()>0
  page.locator('[data-action="setupTactics"]').click()
  page.locator('[data-action="prepHome"]').first.click()
  assert page.locator('.playerFaceCanvas').count()==12
  assert page.locator('.rosterCard').count()==12
  assert page.locator('.roster').evaluate('(e)=>getComputedStyle(e).overflowY==="auto"'),(device,'roster remains independently scrollable')
  page.locator('.twoCol').screenshot(path=str(p.parent / f'command_center_quality_{device}.png'))
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('#formation option[value="1-3-1"]').count()==1
  assert page.locator('#formation option[value="1-1-3"]').count()==1
  assert page.locator('#formation option[value="3-1-1"]').count()==1
  assert page.locator('#formation option[value="1-1-3-3-1-1"]').count()==0
  for formation in ['2-1-2','1-2-2','2-2-1','1-3-1','1-1-3','3-1-1']:
   page.locator('#formation').select_option(formation)
   assert page.locator('.formationSlot').count()==6,(device,formation,'six role markers')
   assert sorted(page.locator('.formationSlot').evaluate_all('(els)=>els.map(e=>e.dataset.role).sort()'))==sorted(page.locator('.lineupRow > strong').all_text_contents()),(device,formation,'role accents')
   assert page.locator('.formationSlot canvas[aria-label*="face,"]').count()==6,(device,formation,'accessible role names')
   assert page.locator('.formationSlot').evaluate_all('(els)=>els.every(e=>{const p=e.parentElement.getBoundingClientRect(),r=e.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1&&r.top>=p.top-1&&r.bottom<=p.bottom+1})'),(device,formation,'formation markers stay in pitch')
   label_metrics=page.locator('.formationSlot small').evaluate_all('(els)=>els.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),width:r.width,height:r.height,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,left:r.left,right:r.right,top:r.top,bottom:r.bottom}})')
   assert len(label_metrics)==6 and all(m['text'] and m['scrollWidth']<=m['clientWidth']+1 for m in label_metrics),(device,formation,'all surname labels are fully visible',label_metrics)
   assert all(m['left']>=page.locator('.formationPitch').evaluate('(e)=>e.getBoundingClientRect().left')-1 and m['right']<=page.locator('.formationPitch').evaluate('(e)=>e.getBoundingClientRect().right')+1 for m in label_metrics),(device,formation,'surname labels stay within pitch',label_metrics)
   for i,left in enumerate(label_metrics):
    for right in label_metrics[i+1:]:
     overlap_x=min(left['right'],right['right'])-max(left['left'],right['left'])
     overlap_y=min(left['bottom'],right['bottom'])-max(left['top'],right['top'])
     assert overlap_x<=0 or overlap_y<=0,(device,formation,'surname labels do not overlap',left,right)
   page.locator('.formationPitch').screenshot(path=str(p.parent / f'formation_labels_{device}_{formation.replace("-","_")}.png'))
  page.locator('#formation').select_option('1-1-3')
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('.lineupRow > strong').all_text_contents()==['GK','DF','MF','FW','FW','FW']
  page.locator('#formation').select_option('3-1-1')
  assert page.locator('.formationSlot canvas').count()==6
  assert page.locator('.lineupRow > strong').all_text_contents()==['GK','DF','DF','DF','MF','FW']
  page.locator('.formationPitch').screenshot(path=str(p.parent / f'formation_quality_{device}.png'))
  a=page.locator('.formationSlot canvas').first.evaluate('(c)=>Array.from(c.getContext("2d").getImageData(0,0,c.width,c.height).data).some((v,i)=>i%4===3 && v>0)')
  assert a,'formation faces drawn'
  assert page.locator('.playerFaceCanvas').first.evaluate('(e)=>e.getBoundingClientRect().left>=e.closest(".rosterCard").getBoundingClientRect().left'),'roster face remains inside its card'
  assert not errors,errors
  print(device,'PASS career filters, flag/crest browsing, six role-accented formations and formation portraits')
  browser.close()
