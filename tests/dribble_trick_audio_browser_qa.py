"""Desktop and simulated-mobile playable engine/UI audio wiring for skill moves."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests' / '.generated' / 'play.html'
assert FIXTURE.exists(), 'Build the portable test fixture with python3 scripts/build.py'
HTML = FIXTURE.read_text(encoding='utf-8')

CHECK = r"""() => {
  const g=SupermagicFootball.game, a=SupermagicFootball.audio;
  const tones=[], oldTone=a.tone, oldCtx=a.ctx, oldUnlocked=a.unlocked;
  const oldSettings=a.settings, oldLast=a.last;
  try {
    a.tone=(frequency,duration,kind='sfx')=>tones.push({frequency,kind});
    a.ctx={currentTime:21,state:'running'};a.unlocked=true;
    a.last=new Map();a.settings={...oldSettings,mute:false,master:80,sfx:60};
    g.emit('dribbleTrick',{team:0,player:'Starter',style:'rainbow',name:'Rainbow',success:true,ai:false});
    const success=tones.splice(0).map(e=>e.frequency);
    a.ctx.currentTime+=.23;
    g.emit('dribbleTrick',{team:0,player:'Starter',style:'spin',name:'Spin',success:false,ai:false});
    const miss=tones.splice(0).map(e=>e.frequency);
    a.ctx.currentTime+=.23;
    g.emit('dribbleTrick',{team:1,player:'Rival',style:'rainbow',name:'Rainbow',success:true,ai:true});
    const ai=tones.splice(0).map(e=>e.frequency);
    const events=g.events.filter(e=>e.type==='dribbleTrick');
    return {success,miss,ai,events:events.slice(-3).map(e=>({ai:e.ai,success:e.success})),
      buttons:document.querySelectorAll('#touchButtons [data-act]').length,
      state:g.matchState};
  }finally {
    a.tone=oldTone;a.ctx=oldCtx;a.unlocked=oldUnlocked;a.settings=oldSettings;a.last=oldLast;
  }
}"""

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for name,mobile in [('desktop',False),('simulated-mobile',True)]:
        context=browser.new_context(
            viewport={'width':844 if mobile else 1280,'height':390 if mobile else 720},
            is_mobile=mobile,has_touch=mobile)
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML,wait_until='load')
        page.wait_for_function("!!window.SupermagicFootball?.game",timeout=60000)
        for action in ('navQuick','navOnDevice','quick','kickoff'):
            page.locator(f'[data-action="{action}"]').first.click()
        result=page.evaluate(CHECK)
        assert result['state']=='play',(name,result)
        assert result['success']==[440,659],(name,'human success',result)
        assert result['miss']==[175],(name,'human failed',result)
        assert result['ai']==[],(name,'silent AI',result)
        assert result['events']==[
            {'ai':False,'success':True},
            {'ai':False,'success':False},
            {'ai':True,'success':True}],(name,'real event bridge',result)
        assert result['buttons']==4,(name,'button contract',result)
        assert not errors,(name,errors)
        print('SKILL_AUDIO_BROWSER_PASS',name,'human success/failure and AI silence',flush=True)
        context.close()
    browser.close()
