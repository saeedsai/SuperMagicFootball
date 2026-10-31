"""Playable modular desktop and emulated-touch penalty event-to-audio bridge.

The Web Audio oscillator is intercepted after gameplay kickoff, so this checks
the real game's event plumbing without depending on speaker hardware.
"""
from pathlib import Path

from menu_test_routes import open_quick
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
JS = r"""() => {
  const game=SupermagicFootball.game, audio=SupermagicFootball.audio;
  const oldTone=audio.tone, oldCtx=audio.ctx, oldUnlocked=audio.unlocked;
  const sounds=[];
  try {
    audio.tone=(frequency,duration,kind='sfx')=>sounds.push({frequency,kind});
    audio.ctx={currentTime:15,state:'running'};
    audio.unlocked=true;
    audio.last.clear();
    audio.settings={...audio.settings,mute:false,master:75,ui:50,sfx:60};
    game.startPK();
    const start=sounds.splice(0).map(s=>s.frequency);
    audio.ctx.currentTime+=.4;
    game.emit('penaltyKick',{team:0,goal:true});
    const score=sounds.splice(0).map(s=>s.frequency);
    audio.ctx.currentTime+=.4;
    game.emit('penaltyKick',{team:1,goal:false});
    const save=sounds.splice(0).map(s=>s.frequency);
    audio.ctx.currentTime+=.4;
    game.emit('penaltyDive',{team:0});
    const dive=sounds.splice(0).map(s=>s.frequency);
    return {start,score,save,dive,matchState:game.matchState,
            buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
            delivered:game.events.filter(e=>['penaltyStart','penaltyKick','penaltyDive'].includes(e.type))
              .map(e=>({type:e.type,goal:e.goal}))};
  } finally {
    audio.tone=oldTone;audio.ctx=oldCtx;audio.unlocked=oldUnlocked;
    audio.last.clear();
  }
}"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox','--disable-dev-shm-usage'])
    for name, mobile in [('desktop', False), ('simulated-touch', True)]:
        ctx = browser.new_context(
            viewport={'width': 844 if mobile else 1280, 'height': 390 if mobile else 720},
            is_mobile=mobile, has_touch=mobile)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.set_content((ROOT / 'play.html').read_text(), wait_until='load')
        page.wait_for_function("!!window.SupermagicFootball?.game")
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        result=page.evaluate(JS)
        assert result['start'] == [330, 440], (name,result)
        assert result['score'] == [587, 740, 880], (name,result)
        assert result['save'] == [392, 294, 220], (name,result)
        assert result['dive'] == [165], (name,result)
        assert result['buttons'] == 4, (name,result)
        assert result['matchState'] == 'penalty', (name,result)
        assert [e['type'] for e in result['delivered'][-4:]] == [
            'penaltyStart','penaltyKick','penaltyKick','penaltyDive'], (name,result)
        assert not errors, (name,errors)
        print(name, 'PASS: playable penalty events route distinct procedural score/save/dive cues',flush=True)
        ctx.close()
    browser.close()
