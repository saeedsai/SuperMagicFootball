"""Chromium regression: production Breath ownership follows the local human seat.

Uses the generated playable HTML and actual game selection, not a duplicated
visibility formula. The renderer predicate is extracted verbatim and executed
inside Chromium against the live game object.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick

root = Path(__file__).resolve().parents[1]
source = (root / 'src/modules/render.js').read_text(encoding='utf-8')
match = re.search(r'function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}', source)
assert match, 'production Breath ring predicate missing'
predicate = match.group(0)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for label, mobile in [('desktop', False), ('touch', True)]:
        context = browser.new_context(viewport={'width': 844 if mobile else 1280,
                                                 'height': 390 if mobile else 720},
                                      is_mobile=mobile, has_touch=mobile)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content((root / 'play.html').read_text(encoding='utf-8'), wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        assert page.locator('#touchButtons button[data-act]').count() == 4
        results = page.evaluate("""(predicate) => {
          const g = SupermagicFootball.game;
          const visible = new Function(predicate + ';return shouldShowBreathRing')();
          const originalSide = g.localBreathSide, originalHumans = g.humans;
          const originalControlled = [...g.controlled];
          const selected = t => g.controlledPlayer(t);
          const rings = () => g.players.filter(p => visible(p,g,true));
          const checks = [];
          try {
            g.humans = 2;
            for (const seat of [0,1,0,1]) {
              g.localBreathSide = seat;
              const p = selected(seat);
              if (!p) throw Error('missing selected player');
              if (rings().length !== 1 || rings()[0] !== p)
                throw Error('wrong initial local ring at seat ' + seat);
              checks.push('seat' + seat);
              const next = g.players.find(q => q.t === seat && q !== p && !q.preview);
              if (!next) throw Error('missing alternate player');
              g.controlled[seat] = next.i;
              if (rings().length !== 1 || rings()[0] !== next)
                throw Error('selection handoff retained stale ring');
              checks.push('switch' + seat);
              const clone = {...next};
              if (visible(clone,g,true)) throw Error('cloned identity inherited ring');
              const previous = g.controlled[seat];
              g.controlled[seat] = -999999;
              if (rings().length !== 0) throw Error('missing selection retained ring');
              g.controlled[seat] = previous;
              if (rings().length !== 1 || rings()[0] !== next)
                throw Error('ring did not recover after missing selection');
              checks.push('identity-and-missing' + seat);
              g.controlled[seat] = p.i;
            }
            g.localBreathSide = 1; g.humans = 1;
            if (rings().length !== 0) throw Error('CPU ring visible');
            if (g.players.some(p => visible(p,g,false)))
              throw Error('outside-match ring visible');
            checks.push('cpu-and-menu-hidden');
          } finally {
            g.localBreathSide = originalSide;
            g.humans = originalHumans;
            g.controlled.splice(0, g.controlled.length, ...originalControlled);
          }
          return {checks, buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
        }""", predicate)
        assert len(results['checks']) == 13 and results['buttons'] == 4, (label, results)
        assert not errors, (label, errors)
        print('BREATH_CHROMIUM_PASS', label, results, flush=True)
        context.close()
    browser.close()
