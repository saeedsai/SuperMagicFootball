#!/usr/bin/env python3
"""Real-engine desktop and simulated-touch acceptance for goal-facing support-run selection."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=(ROOT/'tests/.generated/play.html').read_text(encoding='utf-8')
html=fixture.split('<script type="module">',1)[0]+'</body></html>'
js=fixture.split('<script type="module">',1)[1].split('</script>',1)[0]

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    for kind in ('desktop','simulated-touch'):
        ctx=browser.new_context(
            viewport={'width':1280,'height':720} if kind=='desktop' else {'width':844,'height':390},
            is_mobile=kind!='desktop',has_touch=kind!='desktop')
        page=ctx.new_page();errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.set_content(html)
        page.evaluate("""() => {
            const values=new Map();
            Object.defineProperty(window,'localStorage',{configurable:true,value:{
                getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,String(value)),
                removeItem:key=>values.delete(key),clear:()=>values.clear()
            }});
        }""")
        page.add_script_tag(content=js,type='module')
        page.wait_for_function('!!window.SupermagicFootball?.game')
        result=page.evaluate("""() => {
            const game=SupermagicFootball.game,rows=[];
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});
                const dir=team===0?1:-1,carrier=game.player(team,3),
                    turned=game.player(team,4),facing=game.player(team,5);
                const x=150+2260.8*.5,y=155+1220*.5;
                for(const p of game.players)if(![carrier,turned,facing].includes(p)){
                    Object.assign(p,{down:true,stun:1.1,invuln:1.1,z:0,action:'idle',actionTimer:0});
                }
                Object.assign(carrier,{x,y,down:false,stun:0,invuln:0,z:0,action:'idle',actionTimer:0,
                    face:dir,dx:0,dy:0,moveVX:0,moveVY:0,homeX:x,homeY:y});
                const sentinel={x:x-dir*240,y:y+220};
                for(const [p,face] of [[turned,-dir],[facing,dir]]){
                    Object.assign(p,{x:x+dir*50,y,down:false,stun:0,invuln:0,z:0,action:'idle',actionTimer:0,
                        face,dx:0,dy:0,moveVX:0,moveVY:0,homeX:x+dir*50,homeY:y,
                        aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null,
                        aiTimer:1,aiTarget:{...sentinel},comboCooldown:10,magicReadyAt:10,trickCd:10});
                }
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,shot:null,strike:null});
                game.clock=5;
                game.driveAI(facing,1/60);
                rows.push({team,dir,carrier:{x,y},target:facing.aiTarget,sentinel});
            }
            return {rows,buttons:document.querySelectorAll(
                '#touchButtons button[data-act="pass"],#touchButtons button[data-act="shoot"],'+
                '#touchButtons button[data-act="dribble"],#touchButtons button[data-act="jump"]').length};
        }""")
        assert result['buttons']==4,(kind,result)
        for row in result['rows']:
            target=row['target']
            assert target and target['x']!=row['sentinel']['x'],(kind,row)
            assert abs(target['x']-(row['carrier']['x']+row['dir']*160))<1e-6,(kind,row)
            assert abs(abs(target['y']-row['carrier']['y'])-112)<1e-6,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'goal-facing support receiver selected in both attack directions; four actions unchanged',flush=True)
        ctx.close()
    browser.close()
