from menu_test_routes import open_quick,open_settings,home
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for mobile in (False,True):
  ctx=b.new_context(accept_downloads=True,viewport={'width':844 if mobile else 1360,'height':390 if mobile else 850},is_mobile=mobile,has_touch=mobile)
  p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content((root/'play.html').read_text(), wait_until='load')
  p.wait_for_timeout(300)
  assert p.locator('[data-action="navQuick"]').count()==1
  open_quick(p)
  assert p.locator('#homeTeam option').count()==223
  p.locator('#homeGroup').select_option('CAF')
  assert p.locator('#homeTeam option').count()==16, p.locator('#homeTeam').inner_text()
  p.locator('#awayGroup').select_option('OFC')
  assert p.locator('#awayTeam option').count()==8
  home(p)
  open_settings(p,'save')
  assert p.locator('[data-action="exportSave"]').count()==1
  with p.expect_download() as info:
   p.locator('[data-action="exportSave"]').click()
  download=info.value
  json_file=root/'tests'/('browser_export_mobile.json' if mobile else 'browser_export_desktop.json')
  download.save_as(str(json_file))
  data=json.loads(json_file.read_text())
  assert data['version']=='0.8.24.12' and data['product']=='Supermagic Football'
  p.locator('[data-action="importSave"]').click()
  dialogs=[]
  p.on('dialog',lambda d: (dialogs.append(d.message),d.accept()))
  # File input is hidden, but Chromium set_input_files() bypasses the picker and triggers change.
  p.locator('#saveImportFile').set_input_files(str(json_file))
  p.wait_for_timeout(750)
  assert any('Save imported' in x for x in dialogs), dialogs
  assert errors==[],errors
  print('v0.6 offline Quick Match filters + JSON roundtrip', 'MOBILE' if mobile else 'DESKTOP','PASS')
  ctx.close()
 b.close()
