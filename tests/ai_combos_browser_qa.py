from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for kind,(w,h),mobile in [('desktop',(1366,800),False),('mobile',(844,390),True)]:
    ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
    page=ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("""()=>{let d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
    page.set_content((root/'play.html').read_text(),wait_until='load')
    page.wait_for_function("window.SupermagicFootball?.version==='0.8.22.1-alpha'")
    page.locator('[data-action="quick"]').first.click()
    page.locator('[data-action="kickoff"]').first.click()
    result=page.evaluate("""()=>{const g=SupermagicFootball.game;g.options.difficulty=4;g.cooldown=0;
      const p=g.player(1,3),a=g.player(1,4),b=g.ball;
      for(const q of g.players.filter(q=>q.t===1&&q!==p&&q!==a)){q.x=2900;q.y=1100;}
      p.x=1690;p.y=680;p.z=0;p.stun=0;p.cd=0;p.fatigue=0;p.comboCooldown=0;
      a.x=1748;a.y=675;a.z=0;a.stun=0;a.cd=0;a.fatigue=0;
      b.owner=null;b.x=1710;b.y=675;b.z=225;b.vx=b.vy=0;b.vz=70;b.canCollect=0;b.attacker=0;
      g.aiComboThink=[100,0];g.aiComboNext=[100,0];g.coordinateAiCombos(.016);
      const setup=g.events.find(e=>e.type==='aiComboSetup');
      return {setup,combo:g.player(1,3).comboActive,cd:g.player(1,3).comboCooldown};} """)
    assert result['setup'] and result['combo'] and result['cd']>0,(kind,result,errors)
    page.wait_for_timeout(80)
    page.screenshot(path=str(root/'tests'/f'ai_combo_setup_{kind}.png'))
    shot=page.evaluate("""()=>{const g=SupermagicFootball.game,p=g.player(1,3),b=g.ball;
      g.cooldown=0;p.z=225;p.vz=0;p.cd=0;p.comboWindow=.90;p.comboActive=true;p.specialCd=0;
      b.owner=null;b.attacker=0;b.x=p.x+20;b.y=p.y+2;b.z=244;b.vx=b.vy=b.vz=0;
      g.driveAI(p,.016);return {name:b.shot?.id,action:p.action,attacker:b.attacker};} """)
    assert shot['name'] and shot['attacker']==1 and shot['action']=='comboSuper',(kind,shot,errors)
    page.wait_for_timeout(60)
    page.screenshot(path=str(root/'tests'/f'ai_combo_super_{kind}.png'))
    assert not errors,(kind,errors)
    print(kind,'PASS AI teammate automatic combo and apex shot; no JavaScript errors')
    ctx.close()
  browser.close()
