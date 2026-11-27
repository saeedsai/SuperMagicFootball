#!/usr/bin/env python3
"""Desktop and simulated-touch Chromium acceptance for CPU dribble-trick threat selection."""
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
            const game=SupermagicFootball.game,field={x:150,y:155,w:2260.8,h:1220};
            const run=(team,nearestPatch={},farPatch={},byAI=true,multiDefender=false,random=.4,style='stepovers',carrierStats={},nearestStats={})=>{
                game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
                const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
                const carrier=game.player(team,3),nearest=game.player(1-team,3),far=game.player(1-team,4);
                for(const q of game.players)if(q!==carrier&&q!==nearest&&q!==far)
                    Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0});
                Object.assign(carrier,{x,y,z:0,down:false,stun:0,invuln:0,action:'run',actionTimer:0,
                    dx:dir,dy:0,face:dir,moveVX:0,moveVY:0,cd:0,trickCd:0,dribbleCooldown:0,fatigue:0,breath:1});
                Object.assign(carrier.src,{dribbleType:style,dribbling:10,agility:10,stamina:80,...carrierStats});
                Object.assign(nearest,{x:multiDefender?x+dir*48:x+dir*40,y:multiDefender?y-dir*50:y-50,z:0,down:false,stun:0,invuln:0,
                    action:'idle',actionTimer:0,dx:0,dy:0,face:-dir,moveVX:0,moveVY:0});
                Object.assign(nearest.src,{defence:100,aggression:100,...nearestStats});
                Object.assign(far,{x:multiDefender?x+dir*13:x+dir*80,y:multiDefender?y+dir*70:y+40,z:0,down:false,stun:0,invuln:0,
                    action:'idle',actionTimer:0,dx:0,dy:0,face:-dir,moveVX:0,moveVY:0});
                Object.assign(far.src,{defence:1,aggression:1});
                Object.assign(nearest,nearestPatch);Object.assign(far,farPatch);
                game.take(carrier);
                Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
                game.clock=1;const start=game.events.length,originalRandom=Math.random;
                try{Math.random=()=>random;game.tryDribbleTrick(carrier,byAI);}
                finally{Math.random=originalRandom;}
                const event=game.events.slice(start).find(e=>e.type==='dribbleTrick');
                return {attempted:!!event,success:event?.success,ai:event?.ai,yDelta:carrier.y-y,owner:game.ball.owner===carrier};
            };
            const rows=[];
            for(const team of [0,1]){
                const dir=team===0?1:-1;
                rows.push({team,kind:'downed',...run(team,{down:true})});
                rows.push({team,kind:'invulnerable',...run(team,{invuln:.4})});
                rows.push({team,kind:'shot-down',...run(team,{action:'shotDown',actionTimer:.3})});
                rows.push({team,kind:'active',...run(team)});
                rows.push({team,kind:'no-ready-rival',...run(team,{down:true},{down:true})});
                rows.push({team,kind:'human-legacy',...run(team,{down:true},{},false)});
                rows.push({team,kind:'multi-defender-lane',...run(team,{moveVY:-dir*220},{moveVY:-dir*300},true,true)});
                rows.push({team,kind:'human-multi-defender',...run(team,{moveVY:-dir*220},{moveVY:-dir*300},false,true)});
                rows.push({team,kind:'residual-stationary-read',...run(team,{}, {},true,true,.632,'rainbow',{dribbling:95,agility:90},{defence:80,aggression:80})});
                rows.push({team,kind:'residual-closing-read',...run(team,{moveVX:-dir*220,moveVY:dir*220},{},true,true,.632,'rainbow',{dribbling:95,agility:90},{defence:80,aggression:80})});
                rows.push({team,kind:'rainbow-2d-facing-away',...run(team,
                    {moveVX:-dir*220,moveVY:220,dx:0,dy:-1},{stun:1},true,false,.623,'rainbow',
                    {dribbling:95,agility:90},{defence:80,aggression:80})});
                rows.push({team,kind:'rainbow-2d-facing-toward',...run(team,
                    {moveVX:-dir*220,moveVY:220,dx:-dir,dy:1},{stun:1},true,false,.623,'rainbow',
                    {dribbling:95,agility:90},{defence:80,aggression:80})});
                const primarySlide={action:'slide',actionTimer:.3,slideTimer:.3,slideRemaining:120,
                    slideSpeed:720,slideDX:0,slideDY:1,z:0};
                rows.push({team,kind:'primary-slide-closing',...run(team,primarySlide,{},true,false,0,'stepovers',
                    {dribbling:96,agility:96})});
                rows.push({team,kind:'primary-slide-human',...run(team,primarySlide,{},false,false,0,'stepovers',
                    {dribbling:96,agility:96})});
                rows.push({team,kind:'primary-slide-expired',...run(team,
                    {...primarySlide,actionTimer:0,slideTimer:0},{},true,false,0,'stepovers',
                    {dribbling:96,agility:96})});
                rows.push({team,kind:'primary-slide-away',...run(team,
                    {...primarySlide,slideDY:-1},{},true,false,0,'stepovers',
                    {dribbling:96,agility:96})});
            }
            return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                canonicalTeams:SupermagicFootball.teams.filter(team=>
                    !['concept_demo','crown_royals_reference'].includes(team.group)).length};
        }""")
        assert result['buttons']==4,(kind,result)
        assert result['canonicalTeams']==223,(kind,result)
        assert len(result['rows'])==32,(kind,result)
        for row in result['rows']:
            assert row['attempted'],(kind,row)
            if row['kind'] in ('downed','invulnerable','shot-down'):
                assert row['ai'] is True and row['success'] is True and row['owner'] and row['yDelta']<0,(kind,row)
            elif row['kind']=='active':
                assert row['ai'] is True and row['success'] is False and row['yDelta']>0,(kind,row)
            elif row['kind']=='no-ready-rival':
                assert row['ai'] is True and row['success'] is True and row['owner'],(kind,row)
            elif row['kind']=='human-legacy':
                assert row['ai'] is False and row['success'] is False and row['yDelta']>0,(kind,row)
            elif row['kind']=='multi-defender-lane':
                direction=1 if row['team']==0 else -1
                assert row['ai'] is True and row['success'] is False and row['owner'] and row['yDelta']*direction<0,(kind,row)
            elif row['kind']=='human-multi-defender':
                direction=1 if row['team']==0 else -1
                assert row['ai'] is False and row['success'] is False and row['yDelta']*direction>0,(kind,row)
            elif row['kind']=='residual-stationary-read':
                assert row['ai'] is True and row['success'] is True and row['owner'],(kind,row)
            elif row['kind']=='residual-closing-read':
                assert row['ai'] is True and row['success'] is False and row['owner'],(kind,row)
            elif row['kind']=='rainbow-2d-facing-away':
                assert row['ai'] is True and row['success'] is True and row['owner'],(kind,row)
            elif row['kind']=='rainbow-2d-facing-toward':
                assert row['ai'] is True and row['success'] is False and row['owner'],(kind,row)
            elif row['kind']=='primary-slide-closing':
                assert row['ai'] is True and row['success'] is True and row['owner'] and row['yDelta']<0,(kind,row)
            elif row['kind']=='primary-slide-human':
                assert row['ai'] is False and row['success'] is True and row['owner'] and row['yDelta']>0,(kind,row)
            elif row['kind'] in ('primary-slide-expired','primary-slide-away'):
                assert row['ai'] is True and row['success'] is True and row['owner'] and row['yDelta']>0,(kind,row)
        assert not errors,(kind,errors)
        print('PASS',kind,'CPU active-threat duel, escape-side selection, human compatibility, 223 teams and four actions',flush=True)
        ctx.close()
    browser.close()
