#!/usr/bin/env python3
"""Actual modular browser penalty resolution: 5-kick clinch and complete sudden-death pairs."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(), 'Run python3 scripts/build.py first'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
   args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                              ('simulated-touch',{'width':844,'height':390},True)]:
  context=browser.new_context(viewport=viewport,has_touch=touch,is_mobile=touch)
  page=context.new_page()
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("""() => {const data=new Map();
    Object.defineProperty(window,'localStorage',{configurable:true,value:{
      getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
      removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for act in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{act}"]').first.click()
  assert page.evaluate("SupermagicFootball.game.matchState")=='play',(label,'kickoff did not start')
  for case,outcomes,after_draw,winner,expected_pk in [
      ('clinch',[True,False,True,False,True,False],False,0,[3,0]),
      ('sudden_home',[True]*11+[False],True,0,[6,5]),
      ('sudden_away',[True]*10+[False,True],True,1,[5,6]),
      ('seventh_pair',[True]*12+[False,True],True,1,[6,7])]:
   actual=page.evaluate("""({outcomes,afterDraw}) => {
     const g=SupermagicFootball.game;
     g.score=[2,2];g.startPK(afterDraw);
     const initial=JSON.stringify({teamIds:g.teamIds,rosters:g.rosters.map(x=>x.map(p=>p.id)),
       plans:g.teamPlans,subs:g.substitutionsUsed});
     const turns=[];
     for(const goal of outcomes){
       if(g.matchState!=='penalty')throw Error('Finished before outcome sequence completed');
       const pk=g.pk,mid=(g.world?.goalTop??720);
       pk.ready=0;pk.shotTimer=.001;pk.shotMax=.8;pk.stage='shooting';
       pk.shotTargetY=goal?720+70:720;pk.saveY=720;
       g.updatePK(.02);
       turns.push({turn:pk.turn,state:g.matchState});
     }
     return {turns,score:g.score,pk:g.pk.kicks.map(side=>side.filter(Boolean).length),
       lengths:g.pk.kicks.map(side=>side.length),state:g.matchState,
       initial,final:JSON.stringify({teamIds:g.teamIds,rosters:g.rosters.map(x=>x.map(p=>p.id)),
         plans:g.teamPlans,subs:g.substitutionsUsed}),
       buttons:document.querySelectorAll('#touchButtons button[data-act]').length};
   }""",{'outcomes':outcomes,'afterDraw':after_draw})
   assert actual['state']=='finished',(label,case,actual)
   assert actual['score']==([2,2] if after_draw else expected_pk),(label,case,actual)
   assert actual['pk']==expected_pk,(label,case,actual)
   assert actual['lengths']==([3,3] if case=='clinch' else
           ([7,7] if case=='seventh_pair' else [6,6])),(label,case,actual)
   assert actual['buttons']==4 and actual['initial']==actual['final'],(label,case,'roster/mapping changed')
   assert all(x['state']=='penalty' for x in actual['turns'][:-1]),(label,case,'premature finish')
   assert actual['turns'][-1]['state']=='finished',(label,case,'no winner')
  assert not errors,(label,errors)
  print('PENALTY_LIFECYCLE_BROWSER_PASS',label,'4 real-engine cohorts, regulation score, 4 controls',flush=True)
  context.close()
 browser.close()
