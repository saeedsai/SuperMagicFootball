#!/usr/bin/env python3
"""Seeded real-modular keeper shot calibration: mirrored lanes, fatigue, FPS.

Tests actual freeBall/updateBall pathways and their live keeper/goal events.
This is not a claim of human-vs-CPU rates or statistically representative balance.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = (ROOT / 'tests/.generated/play.html').read_text(encoding='utf-8')
html = fixture.split('<script type="module">', 1)[0] + '</body></html>'
js = fixture.split('<script type="module">', 1)[1].split('</script>', 1)[0]

def seed_script():
    # Each fixture uses an independent pseudo-random stream, so repeated shots
    # are genuinely repeatable without mutating the game's source RNG.
    return r"""() => {
      const g=SupermagicFootball.game, rows=[];
      const oldRandom=Math.random;
      const rand=seed => {let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296)};
      const f=SupermagicFootball.world?.field||{x:150,w:2260.8};
      function fire(fps,side,shotKind,lane,fatigue,repeat) {
        Math.random=rand(20261016 + lane*31 + Math.round(fatigue*100)*101 +
          (shotKind==='super'?1901:0) + fps*19);
        g.init({home:0,away:0,humans:0,mode:'quick',
          options:{...g.options,weather:'Clear',terrain:'Grass',condition:'Good'}});
        g.matchState='paused';g.wind={x:0,y:0};g.cooldown=0;
        const k=g.player(side,0),attacker=1-side,shooter=g.player(attacker,3);
        const dir=side===0?-1:1;
        k.x=side===0?f.x+105:f.x+f.w-105;k.y=765;
        k.stun=0;k.fatigue=fatigue;k.diveCooldown=0;k.diveIntentCooldown=0;
        // No outfield interception, AI decision or unrelated opponent movement.
        for(const p of g.players.filter(p=>!p.keeper)){
          p.x=f.x+f.w*.5;p.y=220;p.stun=0;
        }
        shooter.x=k.x-dir*250;shooter.y=765+lane+5;
        shooter.face=dir;shooter.z=0;shooter.fatigue=0;
        g.take(shooter);
        const special=shotKind==='super';
        const shot=special?{behavior:'straight',level:1,color:'#fff',speed:1,phase:0}:null;
        g.freeBall(shooter,dir,0,special?990:790,
          {power:special?42:30,shot,ordinaryShot:!special,z:15,vz:0});
        shooter.x=f.x+f.w*.5;shooter.y=220;
        const b=g.ball; b.canCollect=1.4; b.age=0;
        const first=g.events.length;
        let outcome='unresolved';
        for(let tick=0;tick<Math.ceil(fps*1.1);tick++){
          g.updateBall(1/fps);
          const newEvents=g.events.slice(first);
          if(newEvents.some(e=>e.type==='save')){outcome='save';break;}
          if(newEvents.some(e=>e.type==='goal')){outcome='goal';break;}
        }
        const events=g.events.slice(first);
        const contacts=events.filter(e=>e.type==='keeperContact');
        const attempts=events.filter(e=>e.type==='keeperDiveAttempt');
        const saves=events.filter(e=>e.type==='save');
        const goals=events.filter(e=>e.type==='goal');
        if(contacts.some(e=>e.depth>e.contactDepth+1e-6))
          throw Error('Off-plane contact '+JSON.stringify({fps,side,shotKind,lane,fatigue,contacts}));
        if(saves.length&&!(contacts.length||events.some(e=>e.type==='keeperSuperSave')))
          throw Error('Save without recorded physical/ability contact');
        if(contacts.some(e=>e.team!==side)||attempts.some(e=>e.team!==side))
          throw Error('Wrong keeper side attributed');
        return {fps,side,shotKind,lane,fatigue,repeat,
          attempts:attempts.length,contacts:contacts.length,saves:Number(saves.length>0),rawSaveEvents:saves.length,goals:goals.length,
          outcome,score:g.score.slice(),maxContactDepth:contacts.length?
          Math.max(...contacts.map(e=>e.depth)):null};
      }
      try {
        for(const fps of [30,60,120])
          for(const shotKind of ['normal','super'])
            for(const lane of [0,85,132])
              for(const fatigue of [0,.75])
                for(const side of [0,1])
                  for(const repeat of [0,1])
                    rows.push(fire(fps,side,shotKind,lane,fatigue,repeat));
      } finally {Math.random=oldRandom}
      return rows;
    }"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    results = []
    for device in ('desktop', 'simulated-touch'):
        ctx = browser.new_context(viewport={'width': 1280, 'height': 720} if device == 'desktop'
                                  else {'width': 844, 'height': 390},
                                  has_touch=device != 'desktop', is_mobile=device != 'desktop')
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(html)
        page.evaluate("""() => {
          const m=new Map();
          Object.defineProperty(window,'localStorage',{configurable:true,
            value:{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),
              removeItem:k=>m.delete(k),clear:()=>m.clear()}});
        }""")
        page.add_script_tag(content=js, type='module')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        rows = page.evaluate(seed_script())
        assert len(rows) == 144, (device, len(rows))
        assert not errors, (device, errors)
        pairs = {}
        for row in rows:
            key = (row['fps'], row['shotKind'], row['lane'], row['fatigue'], row['side'])
            pairs.setdefault(key, []).append(row)
        assert len(pairs) == 72
        for key, (a,b) in pairs.items():
            fields = ['attempts','contacts','saves','rawSaveEvents','goals','outcome','score','maxContactDepth']
            assert all(a[f] == b[f] for f in fields), (device, key, a, b)
            assert a['attempts'] <= 1 and a['contacts'] <= 1 and a['saves'] <= 1, (device,key,a)
            assert a['saves'] + a['goals'] <= 1, (device, key, a)
        # Mirrored same-team keeper inputs should not inherently favor either end.
        for fps in (30,60,120):
            for shot in ('normal','super'):
                for lane in (0,85,132):
                    for fatigue in (0,.75):
                        left=pairs[(fps,shot,lane,fatigue,0)][0]
                        right=pairs[(fps,shot,lane,fatigue,1)][0]
                        assert left['outcome']==right['outcome'], (device, 'direction bias',left,right)
        results.append({'device':device,'fixtures':len(rows),
                        'uniqueFixtures':len(pairs),
                        'shotsWithDives':sum(v[0]['attempts']>0 for v in pairs.values()),
                        'physicalContacts':sum(v[0]['contacts']>0 for v in pairs.values()),
                        'keeperSaves':sum(v[0]['saves']>0 for v in pairs.values()),
                        'duplicateSaveEvents':sum(max(0,v[0]['rawSaveEvents']-1) for v in pairs.values()),
                        'goals':sum(v[0]['goals']>0 for v in pairs.values()),
                        'unresolved':sum(v[0]['outcome']=='unresolved' for v in pairs.values())})
        print('PASS', device, json.dumps(results[-1], sort_keys=True), flush=True)
        ctx.close()
    browser.close()
# Stable compact console-only evidence; full scripts' stdout is saved by CI.
assert results[0]['uniqueFixtures'] == results[1]['uniqueFixtures']
assert results[0]['keeperSaves'] == results[1]['keeperSaves']
assert results[0]['goals'] == results[1]['goals']
print('KEEPER_SEEDED_CALIBRATION_PASS', json.dumps(results, sort_keys=True), flush=True)
