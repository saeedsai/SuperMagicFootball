from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for ismobile in (False, True):
  ctx=browser.new_context(viewport={'width':845 if ismobile else 1440,'height':390 if ismobile else 900},is_mobile=ismobile,has_touch=ismobile)
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'play.html').read_text());page.wait_for_timeout(400)
  page.locator('[data-action=manager]').first.click()
  assert page.locator('#managerClub option').count() > 100
  # Test African team chosen from newly added participant list.
  index=page.evaluate('NekketsuHD.teams.find(t=>t.name==="Mamelodi Sundowns").index')
  page.locator('#managerClub').select_option(str(index))
  page.locator('[data-action=startManager]').click()
  assert page.evaluate('NekketsuHD.getCareer().club')==index,errors
  assert page.locator('[data-action=careerScout]').count()>=1
  page.locator('[data-action=careerScout]').first.click()
  page.locator('[data-action=careerScoutNew]').click()
  assert page.evaluate('NekketsuHD.getCareer().scouted.length')==1
  page.on('dialog',lambda d:d.accept('12') if d.type=='prompt' else d.accept())
  page.locator('[data-action=careerSign0]').click()
  assert page.evaluate('NekketsuHD.getCareer().roster.length')==12
  assert page.evaluate('NekketsuHD.getCareer().roster.some(p=>p.id.startsWith("youth_"))')
  page.locator('[data-action=manager]').first.click() if page.locator('[data-action=manager]').count() else None
  page.locator('[data-action=careerSquad]').first.click()
  page.locator('[data-careerrenew="0"]').click()
  assert page.evaluate('NekketsuHD.getCareer().roster[0].contractYears')>=2
  page.locator('[data-careerrecover="0"]').click()
  assert not errors, errors
  print('Manager recruiting and contracts', 'mobile' if ismobile else 'desktop','PASS')
  ctx.close()
 browser.close()
