from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature
root=Path(__file__).resolve().parents[1]
fixture=root/'tests/.generated/play.html'
assert fixture.exists(),'Build modular QA fixture first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=['--no-sandbox'])
 for label,viewport,mobile in [('desktop',{'width':1400,'height':850},False),('mobile',{'width':390,'height':844},True)]:
  context=browser.new_context(viewport=viewport,is_mobile=mobile,has_touch=mobile)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game')
  open_feature(page,'playerStudio')
  groups=page.locator('.studioControlGroup')
  assert groups.count()==4,(label,'four native customization groups')
  assert groups.locator('legend').all_text_contents()==['SKIN & HAIR COLOR','FACE & HAIR','BODY','PERSONAL DETAILS']
  fields=page.locator('.avatarControls select[id^="face_"]')
  assert fields.count()==17,(label,'two palette selectors and all fifteen original appearance selectors retained')
  for field in fields.all():
   box=field.bounding_box();host=field.locator('xpath=ancestor::fieldset[1]').bounding_box()
   assert box and host and box['x']>=host['x'] and box['x']+box['width']<=host['x']+host['width']+1,(label,field.get_attribute('id'),'control overflow')
  assert page.locator('#face_skin').count()==1 and page.locator('#face_hair').count()==1
  page.locator('.studioControlGroup').first.scroll_into_view_if_needed()
  page.locator('.avatarControls').first.screenshot(path=str(root/'tests/.generated'/f'player_studio_groups_{label}.png'))
  if mobile:
   for index,slug in enumerate(['palette','face_hair','body','details']):
    page.locator('.studioControlGroup').nth(index).screenshot(path=str(root/'tests/.generated'/f'player_studio_group_{slug}_mobile.png'))
  page.screenshot(path=str(root/'tests/.generated'/f'player_studio_groups_screen_{label}.png'))
  assert page.locator('.menubox').evaluate('(e)=>e.scrollWidth<=e.clientWidth+2'),(label,'screen has no horizontal overflow')
  assert not errors,(label,errors)
  print(label,'PASS four grouped fieldsets, 15 appearance selectors plus 2 palettes, no horizontal overflow or page errors')
  context.close()
 browser.close()
