from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
    for mode,(w,h) in [('desktop',(1440,900)),('android',(940,438))]:
        page=browser.new_page(viewport={'width':w,'height':h},is_mobile=mode=='android',has_touch=mode=='android',device_scale_factor=1)
        errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(markup,wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'",timeout=25000)
        page.locator('[data-action="quick"]').first.click()
        page.locator('[data-action="kickoff"]').first.click()
        result=page.evaluate('''() => {
          const g=SupermagicFootball.game;
          const p=g.player(0,3);p.src={...p.src,superShotLevel:5};
          g.cooldown=0;g.take(p);g.shoot(p,true);
          const superOK=g.ball.shot!==null && p.fatigue>0 && g.ball.power>20;
          const highLevel=p.src.superShotLevel;
          const id=g.ball.shot?.id;
          // Existing 12-member roster remains intact.
          const quota=g.rosters.every(roster=>roster.length===12);
          const hud=document.querySelector('#playerTag')?.textContent || '';
          return {superOK,highLevel,id,quota,hud};
        }''')
        assert result['superOK'] and result['highLevel']==5 and result['quota'],result
        page.wait_for_timeout(120)
        assert 'LV5' in (page.locator('#playerTag').text_content() or ''),'In-match HUD should show the selected player special level'
        assert not errors,errors
        page.screenshot(path=str(root/'tests'/f'special_levels_{mode}.png'))
        print(mode.upper(),'PASS: shot level, active gameplay, preserved squad, no browser errors')
        page.close()
    browser.close()
