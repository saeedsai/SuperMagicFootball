#!/usr/bin/env python3
"""Playable modular halftime coaching: desktop/simulated touch, no state changes."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
if not fixture.exists():
    fixture = ROOT / 'play.html'
assert fixture.exists(), 'Build modular QA fixture first'
html = fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for device, viewport, mobile in [
        ('desktop', {'width':1280, 'height':720}, False),
        ('simulated-touch', {'width':844, 'height':390}, True)
    ]:
        ctx = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.evaluate("""() => {
          const data=new Map();
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
            removeItem:k=>data.delete(k),clear:()=>data.clear()
          }});
        }""")
        page.set_content(html, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        page.locator('[data-action="navQuick"]').first.click()
        page.locator('[data-action="navOnDevice"]').first.click()
        page.locator('[data-action="quick"]').first.click()
        page.locator('[data-action="kickoff"]').first.click()
        assert page.evaluate("SupermagicFootball.game.matchState") == 'play'
        before = page.evaluate("""() => {
          const g=SupermagicFootball.game;
          const starter=g.rosters[0][g.lineups[0][1]];
          g.score[0]=0;g.score[1]=2;
          g.fatigueLedger[0][starter.id]=.85;
          for(const p of g.players)if(p.t===0)p.morale=25;
          g.substitutionsUsed[0]=1;
          return {plans:JSON.stringify(g.teamPlans),
                  lineups:JSON.stringify(g.lineups),
                  used:JSON.stringify(g.substitutionsUsed),
                  store:localStorage.getItem('legend_teamPlans'),
                  actions:document.querySelectorAll('#touchButtons button[data-act]').length};
        }""")
        assert before['actions']==4, (device, before)
        page.evaluate("SupermagicFootball.game.onEvent({type:'halftime'})")
        panel = page.locator('#halftimeCoachHome')
        assert panel.count()==1,(device,'missing halftime coaching advice')
        assert panel.get_attribute('role')=='status'
        assert panel.get_attribute('aria-live')=='polite', (device, 'accessible live guidance')
        text = panel.inner_text()
        assert 'TRAILING' in text and 'Direct attack' in text, (device,text)
        assert 'LOW FITNESS' in text and '1 starter' in text, (device,text)
        assert '2 substitutions left' in text, (device,text)
        assert 'LOW MORALE' in text and 'Advice only' in text, (device,text)
        assert page.locator('#halfTalkHome').count()==1, (device,'preserve existing team talk')
        assert page.locator('[data-action="tacticHome"]').count()==1
        def snapshot():
            return page.evaluate("""() => ({
              plans:JSON.stringify(SupermagicFootball.game.teamPlans),
              lineups:JSON.stringify(SupermagicFootball.game.lineups),
              used:JSON.stringify(SupermagicFootball.game.substitutionsUsed),
              store:localStorage.getItem('legend_teamPlans'),
              actions:document.querySelectorAll('#touchButtons button[data-act]').length
            })""")
        assert snapshot()==before,(device,'advice must not change tactical state or save',before,snapshot())
        page.evaluate("""() => {
          const g=SupermagicFootball.game;
          g.score[0]=2;g.score[1]=1;
          g.substitutionsUsed[0]=g.maxSubstitutions;
          g.onEvent({type:'halftime'});
        }""")
        text = page.locator('#halftimeCoachHome').inner_text()
        assert 'LEADING' in text and 'NO SUBSTITUTIONS LEFT' in text,(device,text)
        assert 'SPEAK TO HOME TEAM' in page.locator('.menubox').inner_text()
        page.locator('[data-action="resume"]').first.click()
        assert page.evaluate("SupermagicFootball.game.matchState") == 'play'
        assert not errors,(device,errors)
        print('HALFTIME_COACH_PASS', device,
              'score, starter fitness, morale, substitution limits, no tactical or save mutation',
              flush=True)
        ctx.close()
    browser.close()
