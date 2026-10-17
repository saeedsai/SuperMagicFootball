"""Playable Chromium pass-reception audio from actual GameEngine.take() events."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/.generated/play.html'
assert FIXTURE.exists(), 'Build disposable fixture with python3 scripts/build.py'
HTML = FIXTURE.read_text(encoding='utf-8')

SCRIPT = r"""() => {
 const g=SupermagicFootball.game,a=SupermagicFootball.audio;
 const oldTone=a.tone,oldCtx=a.ctx,oldUnlocked=a.unlocked,
       oldSettings=a.settings,oldLast=a.last;
 const sounds=[],original=JSON.stringify({score:g.score,teamIds:g.teamIds,
   rosters:g.rosters.map(side=>side.map(p=>p.id))});
 try {
   a.tone=(f)=>sounds.push(f);a.ctx={currentTime:11,state:'running'};
   a.unlocked=true;a.last=new Map();
   a.settings={...a.settings,mute:false,master:80,sfx:75};
   // This test invokes GameEngine.take directly; transient stun is unrelated
   // to the reception audio contract and must not race frame-to-frame.
   const side0=g.players.filter(p=>p.t===0&&!p.keeper);
   const rival=g.players.find(p=>p.t===1&&!p.keeper);
   if(side0.length<2||!rival)throw Error('Game players unavailable');
   const [target,teammate]=side0;
   const collect=(recipient)=>{
     const b=g.ball;b.owner=null;b.shot=null;b.strike=null;b.pass=true;
     b.passFrom=teammate.src.id;b.passTeam=0;b.passTarget=target.src.id;
     b.vx=420;b.vy=110;b.age=.24;b.canCollect=0;
     g.take(recipient);
     a.ctx.currentTime+=.35;
     return sounds.splice(0);
   };
   const good=collect(target);
   const extra=collect(teammate); // same team but NOT pass target: silence
   const intercepted=collect(rival);
   const outcomes=g.events.filter(e=>e.type==='passReceived').slice(-3)
       .map(e=>({friendly:e.friendly,accurate:e.accurate}));
   return {good,extra,intercepted,outcomes,
     unchanged:original===JSON.stringify({score:g.score,teamIds:g.teamIds,
       rosters:g.rosters.map(side=>side.map(p=>p.id))}),
     count:document.querySelectorAll('#touchButtons [data-act]').length,
     state:g.matchState};
 } finally {
   a.tone=oldTone;a.ctx=oldCtx;a.unlocked=oldUnlocked;
   a.settings=oldSettings;a.last=oldLast;
 }
}"""

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,touch in [('desktop',False),('simulated-touch',True)]:
        ctx=browser.new_context(
            viewport={'width':844 if touch else 1280,'height':390 if touch else 720},
            is_mobile=touch,has_touch=touch)
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML,wait_until='load')
        page.wait_for_function("!!window.SupermagicFootball?.game",timeout=60000)
        for action in ('navQuick','navOnDevice','quick','kickoff'):
            page.locator(f'[data-action="{action}"]').first.click()
        # A click can return before the match is ready. Require a real six-a-side
        # match rather than treating an uninitialized/empty roster as an audio bug.
        page.wait_for_function("""() => {
          const g=window.SupermagicFootball?.game;
          return g?.matchState==='play' && g.players?.length===12 &&
            g.players.filter(p=>p.t===0&&!p.keeper).length>=2 &&
            g.players.some(p=>p.t===1&&!p.keeper);
        }""",timeout=15000)
        result=page.evaluate(SCRIPT)
        assert result['state']=='play',(label,result)
        assert result['good']==[370,494],(label,'real accurate pass',result)
        assert result['extra']==[],(label,'unintended teammate should be silent',result)
        assert result['intercepted']==[262,175],(label,'real interception',result)
        assert result['outcomes']==[
          {'friendly':True,'accurate':True},
          {'friendly':True,'accurate':False},
          {'friendly':False,'accurate':False}],(label,'event attributes',result)
        assert result['count']==4 and result['unchanged'],(label,'integrity',result)
        assert not errors,(label,errors)
        print('PASS_RECEIVE_AUDIO_BROWSER_PASS',label,
              'real engine take; friendly target, opportunistic teammate, interception',
              flush=True)
        ctx.close()
    browser.close()
