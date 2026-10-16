#!/usr/bin/env python3
"""Real playable modular UI: fatigue guidance is read-only across desktop/touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
fixture = root / 'tests/.generated/play.html'
if not fixture.exists():
    fixture = root / 'play.html'
assert fixture.exists(), 'Build QA fixture first with python3 scripts/build.py'

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for name, viewport, mobile in (
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True)
    ):
        ctx = browser.new_context(viewport=viewport, has_touch=mobile, is_mobile=mobile)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.evaluate("""() => {
          const data = new Map();
          Object.defineProperty(window, 'localStorage', {
            configurable:true,
            value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
                   removeItem:k=>data.delete(k),clear:()=>data.clear()}
          });
        }""")
        page.set_content(fixture.read_text(encoding='utf-8'), wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        page.locator('[data-action="navQuick"]').first.click()
        page.locator('[data-action="navOnDevice"]').first.click()
        page.locator('[data-action="quick"]').first.click()
        page.locator('[data-action="kickoff"]').first.click()
        assert page.evaluate("SupermagicFootball.game.matchState") == 'play'
        expected = page.evaluate("""() => {
          const g=SupermagicFootball.game,side=0,plan=g.teamPlans[side];
          const slot=1,starter=g.rosters[side][plan.lineup[slot]];
          const bench=g.rosters[side].findIndex((p,i)=>
            p.role===starter.role&&!plan.lineup.includes(i));
          if(bench<0)throw Error('Expected reserve defender');
          const reserve=g.rosters[side][bench];
          for(const p of g.rosters[side])g.fatigueLedger[side][p.id]=.1;
          g.fatigueLedger[side][starter.id]=.84;
          g.fatigueLedger[side][reserve.id]=.04;
          g.player(side,slot).fatigue=.84;
          g.substitutionsUsed[side]=0;
          g.subbedOut[side].clear();
          return {starter:starter.name,reserve:reserve.name,
                  lineup:JSON.stringify(plan.lineup),
                  stored:localStorage.getItem('legend_teamPlans')};
        }""")
        page.locator('#pauseBtn').click(force=True)
        page.locator('[data-action="tacticHome"]').click()
        notice = page.locator('#substitutionAdvice')
        assert notice.count() == 1, (name, 'advice absent')
        message = notice.inner_text()
        assert 'Suggested swap' in message, (name, message)
        assert expected['starter'] in message and expected['reserve'] in message, (name, message)
        assert 'FIT 16%' in message and 'FIT 96%' in message, (name, message)
        assert page.evaluate("JSON.stringify(SupermagicFootball.game.teamPlans[0].lineup)") == expected['lineup']
        assert page.evaluate("localStorage.getItem('legend_teamPlans')") == expected['stored']
        # A fully used substitution quota cannot suggest an additional replacement.
        page.evaluate("""() => {
          const g=SupermagicFootball.game;
          g.substitutionsUsed[0]=g.maxSubstitutions;
        }""")
        page.locator('[data-action="returnPause"]').click()
        page.locator('[data-action="tacticHome"]').click()
        assert 'All substitutions have been used' in page.locator('#substitutionAdvice').inner_text()
        assert page.evaluate("JSON.stringify(SupermagicFootball.game.teamPlans[0].lineup)") == expected['lineup']
        assert not errors, (name, errors)
        print('SUBSTITUTION_ADVICE_PASS', name, 'suggestion, limits, unchanged lineup and save', flush=True)
        ctx.close()
    browser.close()
