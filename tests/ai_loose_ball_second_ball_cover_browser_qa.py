#!/usr/bin/env python3
"""Desktop and simulated-touch acceptance for second-defender loose-ball cover."""
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
        ctx=browser.new_context(viewport={'width':1280,'height':720} if kind=='desktop'
            else {'width':844,'height':390},is_mobile=kind!='desktop',has_touch=kind!='desktop')
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
            const field={x:150,y:155,w:2260.8,h:1220};
            for(const team of [0,1]){
                game.init({home:0,away:1,mode:'quick',humans:0});
                game.weather='Clear';
                const dir=team===0?1:-1,primary=game.player(team,3),support=game.player(team,4);
                const x=field.x+field.w*.5,y=field.y+field.h*.5;
                for(const p of game.players){
                    p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
                    p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
                }
                for(const p of [primary,support]){
                    Object.assign(p,{down:false,stun:0,invuln:0,action:'idle',actionTimer:0,z:0,
                        slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,
                        shotImpactRiseTimer:0,aiTimer:1});
                }
                Object.assign(primary,{x:x-dir*18,y});
                Object.assign(support,{x:x+dir*50,y:y+65});
                Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
                    x,y,z:54,vx:dir*260,vy:-80,vz:-40,canCollect:0,attacker:1-team,lastTouchTeam:1-team});
                game.clock=5;
                const flight=(-40+Math.sqrt(40*40+1000*54))/500;
                const expected={x:x+dir*260*flight-dir*26,y:y-80*flight};
                game.driveAI(primary,.016);game.driveAI(support,.016);
                rows.push({team,dir,expected,primary:primary.aiTarget,support:support.aiTarget});
            }
            return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['teams']>=223,(kind,result)
        for row in result['rows']:
            assert row['support'] and abs(row['support']['x']-row['expected']['x'])<1e-6,(kind,row)
            assert abs(row['support']['y']-row['expected']['y'])<1e-6,(kind,row)
            assert row['primary'] and ((row['primary']['x']-row['support']['x'])**2+
                (row['primary']['y']-row['support']['y'])**2)**.5>40,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'mirrored second-ball cover, four actions and no JavaScript errors',flush=True)
        ctx.close()
    browser.close()
