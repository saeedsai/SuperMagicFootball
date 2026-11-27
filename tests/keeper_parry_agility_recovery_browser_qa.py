#!/usr/bin/env python3
"""Desktop and simulated-touch actual-engine acceptance for keeper Agility parry recovery."""
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
        page=ctx.new_page()
        errors=[]
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
        page.wait_for_function('!!window.SupermagicFootball?.game?.tryKeeperDive')
        result=page.evaluate("""() => {
            const base=SupermagicFootball.game;
            const run=(team,profile,parry)=>{
                const match=new base.constructor({halfSeconds:120});
                match.init({home:0,away:1,mode:'quick',humans:0});
                const keeper=match.player(team,0),direction=team===0?-1:1;
                const src={...(keeper.src||{}),gkSkill:50,gkDiving:50};
                if(profile==='missing')delete src.agility;
                else if(profile==='invalid')src.agility=NaN;
                else src.agility=profile;
                keeper.src=src;keeper.fatigue=.15;
                Object.assign(match.ball,{owner:null,attacker:1-team,
                    x:keeper.x-direction*24,y:keeper.y,z:0,
                    vx:direction*(parry?2500:700),vy:0,vz:0,power:parry?60:0,
                    ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[]});
                const saved=match.tryKeeperDive(keeper,false);
                return {saved,parried:match.ball.owner===null&&match.ball.attacker===team,
                    caught:match.ball.owner===keeper,cooldown:keeper.diveCooldown,
                    actionTimer:keeper.actionTimer};
            };
            const rows=[];
            for(const team of [0,1]){
                const low=run(team,1,true),average=run(team,50,true),high=run(team,100,true);
                const missing=run(team,'missing',true),invalid=run(team,'invalid',true);
                const catchLow=run(team,1,false),catchHigh=run(team,100,false);
                rows.push({team,low,average,high,missing,invalid,catchLow,catchHigh});
            }
            return {rows,buttons:document.querySelectorAll('#touchButtons button[data-act]').length,
                teams:SupermagicFootball.teams.filter(team=>
                    !['concept_demo','crown_royals_reference'].includes(team.group)).length};
        }""")
        for row in result['rows']:
            assert all(row[k]['saved'] and row[k]['parried'] for k in ('low','average','high','missing','invalid')),(kind,row)
            assert row['high']['cooldown']<row['average']['cooldown']<row['low']['cooldown'],(kind,row)
            assert abs(row['missing']['cooldown']-row['invalid']['cooldown'])<1e-9,(kind,row)
            assert row['high']['cooldown']<=row['missing']['cooldown']<=row['low']['cooldown'],(kind,row)
            for key in ('low','average','high','missing','invalid'):
                sample=row[key]
                assert sample['cooldown']>=sample['actionTimer']+.34+.06-1e-6,(kind,row,key)
            assert row['catchLow']['saved'] and row['catchLow']['caught'],(kind,row)
            assert row['catchHigh']['saved'] and row['catchHigh']['caught'],(kind,row)
            assert abs(row['catchLow']['cooldown']-row['catchHigh']['cooldown'])<1e-9,(kind,row)
        assert result['buttons']==4 and result['teams']==223,(kind,result)
        assert not errors,(kind,errors)
        print('PASS',kind,'Agility-aware keeper parry recovery, get-up floor, neutral fallback, unchanged catch and four actions',flush=True)
        ctx.close()
    browser.close()
