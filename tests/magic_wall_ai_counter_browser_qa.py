#!/usr/bin/env python3
"""Real-engine CPU slide counters for all tiered wall families and frame rates."""
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
assert FIXTURE.exists(),'Build the current modular browser fixture first'
HTML=FIXTURE.read_text(encoding='utf-8')

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.set_content(HTML,wait_until='load')
    page.wait_for_function('!!window.SupermagicFootball?.game')
    results=page.evaluate('''()=>{
      const sf=SupermagicFootball,g=sf.game,minimum={magicWall:1,fireWall:2,iceWall:3,demonWall:4},out=[];
      for(const [id,tier] of Object.entries(minimum))for(const fps of [30,60,120]){
        g.init({home:0,away:9,options:{...g.options,weather:'Clear'}});g.matchState='play';g.humans=0;g.cooldown=0;g.clock=5;
        const caster=g.player(0,1),carrier=g.player(1,3),runner=g.player(1,5);
        for(const p of g.players){p.dx=p.dy=p.moveVX=p.moveVY=0;p.aiTarget=null;p.aiTimer=2;p.stun=0;p.z=0;}
        Object.assign(caster,{x:1888,y:765,face:1,cd:0,abilityCd:0,fatigue:0,breath:100});
        caster.src={...caster.src,role:'DF',superAbility:{type:'defence',id,level:tier},superDefenceLevel:tier};
        Object.assign(carrier,{x:2100,y:765,dx:0,dy:0,moveVX:0,moveVY:0,aiTarget:null,aiTimer:2});
        Object.assign(runner,{x:2040,y:765,face:-1,dx:-1,dy:0,moveVX:0,moveVY:0,aiTarget:null,aiTimer:0,cd:0,stun:0,fatigue:0,breath:100});
        for(const p of g.players)if(![caster,carrier,runner].includes(p)){p.x=p.t===0?350:2200;p.y=350;p.dx=p.dy=p.moveVX=p.moveVY=0;}
        g.take(carrier);g.controlled=[3,3];
        if(!g.activateDefence(caster))throw Error(id+' failed legal tier '+tier+' placement');
        for(let frame=0;frame<Math.ceil(fps*1.1)&&g.magicWalls.length;frame++)g.update(1/fps);
        const event=g.events.find(e=>e.type==='magicWallCounter'&&e.player===runner.src.name&&e.counter==='slide');
        if(!event||g.magicWalls.length||runner.fatigue<=0||runner.breath>=100||runner.action!=='slide')
          throw Error(id+' '+fps+'Hz wall slide counter missing: '+JSON.stringify({event:!!event,walls:g.magicWalls.length,action:runner.action,fatigue:runner.fatigue,breath:runner.breath}));
        out.push(id+'@'+fps);
      }
      return out;
    }''')
    assert len(results)==12,results
    assert not errors,errors
    print('MAGIC_WALL_AI_COUNTER_BROWSER_PASS',' '.join(results),flush=True)
    browser.close()
