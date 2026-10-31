"""Menu-specific keyboard, simulated gamepad, pause, and save safety regression."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 p=b.new_page(viewport={'width':1360,'height':850});errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((root/'play.html').read_text(),wait_until='load')
 p.wait_for_function("!!window.SupermagicFootball?.game")
 assert p.evaluate("document.activeElement?.dataset.action")=='navQuick'
 p.keyboard.press('ArrowDown')
 assert p.evaluate("document.activeElement?.dataset.action")=='navOnline'
 p.keyboard.press('Enter')
 assert p.locator('[data-action=laterOnlineMatch]').count()==1
 p.keyboard.press('Backspace')
 assert p.locator('.navMainList').count()==1
 assert p.evaluate("document.activeElement?.dataset.action")=='navOnline'
 # The gamepad API is simulated; no physical-controller claim.
 p.evaluate('''() => {window.__qaButtons=Array.from({length:17},()=>({pressed:false}));
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[{buttons:window.__qaButtons,axes:[0,0]}]});}''')
 p.evaluate('window.__qaButtons[0].pressed=true')
 p.wait_for_timeout(100)
 assert p.locator('[data-action=laterOnlineMatch]').count()==1
 p.evaluate('window.__qaButtons[0].pressed=false');p.wait_for_timeout(120)
 p.evaluate('window.__qaButtons[1].pressed=true');p.wait_for_timeout(110)
 assert p.locator('.navMainList').count()==1
 p.evaluate('window.__qaButtons[1].pressed=false')
 p.locator('[data-action=navQuick]').click();p.locator('[data-action=navOnDevice]').click()
 p.locator('[data-action=quick]').click();p.locator('[data-action=kickoff]').click()
 assert p.evaluate("SupermagicFootball.game.matchState")=='play'
 p.locator('#pauseBtn').click(force=True)
 assert p.locator('[data-action=confirmQuit]').count()==1
 p.on('dialog',lambda d:d.dismiss())
 p.locator('[data-action=confirmQuit]').click()
 assert p.locator('[data-action=resume]').count()==1,'Dismissing quit confirmation must preserve paused match'
 p.locator('[data-action=navSound]').click()
 assert p.locator('#audio_master').count()==1
 p.locator('[data-action=saveSettings]').click()
 assert p.locator('[data-action=resume]').count()==1
 p.locator('[data-action=resume]').click()
 assert p.evaluate("SupermagicFootball.game.matchState")=='play'
 assert len(errors)==0,errors
 print('PASS menu keyboard Back / focus, simulated gamepad A/B, match quit confirmation, pause->sound->resume')
 b.close()
