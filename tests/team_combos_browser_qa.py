#!/usr/bin/env python3
"""Real modular four-button ordering regression: no teammate launch and aerial cross.

Every input sequence owns a fresh match, player/ball and controller state.
The archived test reused p.queuedPass / p.jumpTapPending from a previous
sequence and did not distinguish a failed setup from a gameplay failure.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from menu_test_routes import open_quick

ROOT = Path(__file__).resolve().parents[1]
RUN = r"""() => {
 const g=SupermagicFootball.game,rows=[];
 const snapshot=(label,p)=>({
   label,owner:g.ball.owner?.src?.id||null,expected:p.src.id,
   z:p.z,action:p.action,vz:g.ball.vz,passUsed:p.passUsed,
   queuedPass:!!p.queuedPass,pressed:{...g.input.pressed[0]},
   controlled:g.controlled[0],human:g.humans,
   launches:g.events.filter(e=>e.type==='teamLaunch').length,
   kicks:g.events.filter(e=>e.type==='kick').length,
   passes:g.events.filter(e=>e.type==='passIntent').map(e=>e.loft)
 });
 function reset() {
   g.init({home:0,away:0,humans:1,mode:'quick',
     options:{...g.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
   g.matchState='paused';g.clock=12;g.cooldown=0;g.events=[];
   g.input.reset();g.input.state[0]={};g.input.pressed[0]={};g.input.releases[0]={};
   const p=g.player(0,3);
   for(const q of g.players)if(q!==p){q.x=q.t===0?750:2650;q.y=250+q.i*55;q.stun=0;}
   p.x=1450;p.y=760;p.z=p.vz=p.cd=p.stun=p.fatigue=0;
   p.jumpTapPending=false;p.jumpHold=0;p.jumpCount=0;
   p.passHold=0;p.passUsed=false;p.passDirection=null;p.queuedPass=null;
   p.slideTimer=0;p.chase=0;p.moveVX=p.moveVY=0;
   g.take(p);g.controlled[0]=p.i;g.manualSwitchGrace[0]=1;
   if(!g.inControl(0)||g.ball.owner!==p||g.controlled[0]!==p.i)throw Error('Bad test setup');
   return p;
 }
 function frame(state,pressed={},released={}) {
   g.input.state[0]={x:0,y:0,...state};g.input.pressed[0]=pressed;g.input.releases[0]=released;
   g.updatePlayers(.016);
 }
 // Pass+Jump pressed at the same moment is not an AI teammate launch or aerial cross.
 let p=reset();
 frame({pass:1,jump:1},{pass:true,jump:true});
 const both=snapshot('simultaneous',p);
 if(both.owner!==both.expected||both.launches!==0||both.kicks!==0)
   throw Error('simultaneous Pass+Jump should retain possession: '+JSON.stringify(both));
 rows.push(both);
 // Pass-first then Jump is an ordinary pass on release, not an aerial cross.
 p=reset();
 frame({pass:1},{pass:true});
 frame({pass:1,jump:1},{jump:true});
 const first=snapshot('pass-before-jump-hold',p);
 if(first.owner!==first.expected||first.launches!==0||first.kicks!==0)
   throw Error('Pass-first must not cross: '+JSON.stringify(first));
 frame({jump:1},{},{pass:true});
 const released=snapshot('pass-before-jump-release',p);
 if(released.owner===released.expected||released.passes.includes('cross')||released.kicks!==1)
   throw Error('Pass-first should release exactly one ordinary pass: '+JSON.stringify(released));
 rows.push(first,released);
 // Tap Jump, resolve release to become airborne, then separately press Pass.
 p=reset();
 frame({jump:1},{jump:true});
 frame({},{},{jump:true});
 const airborne=snapshot('airborne-after-jump-release',p);
 if(airborne.z<=0)throw Error('Jump release did not lift player: '+JSON.stringify(airborne));
 frame({pass:1},{pass:true});
 const cross=snapshot('jump-then-pass',p);
 if(cross.owner===cross.expected||cross.vz<240||cross.kicks!==1||!cross.passes.includes('cross'))
   throw Error('Jump-then-Pass cross missing: '+JSON.stringify(cross));
 if(cross.launches!==0)throw Error('Human attempted forbidden teammate launch: '+JSON.stringify(cross));
 rows.push(airborne,cross);
 return {rows,buttons:document.querySelectorAll('#touchButtons [data-act]').length};
}"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    for name, mobile in [('desktop', False), ('simulated-touch', True)]:
        context = browser.new_context(
            viewport={'width':844 if mobile else 1280, 'height':390 if mobile else 720},
            is_mobile=mobile, has_touch=mobile)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content((ROOT/'play.html').read_text(), wait_until='load')
        page.wait_for_function("!!window.SupermagicFootball?.game")
        open_quick(page)
        page.locator('[data-action="kickoff"]').first.click()
        result = page.evaluate(RUN)
        assert result['buttons'] == 4, (name, result)
        assert not errors, (name, errors)
        print(name, 'PASS: 3 isolated four-button sequences, exact one-kick cross, '
                    'Pass-first ordinary pass, no teammate launch', flush=True)
        context.close()
    browser.close()
