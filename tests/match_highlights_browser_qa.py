#!/usr/bin/env python3
"""Real playable Pause, Half Time and Full Time event chronology on PC and touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(),'Build current game with python3 scripts/build.py before browser acceptance'
html=fixture.read_text(encoding='utf-8')
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for device,viewport,touch in [('desktop',{'width':1280,'height':720},False),
                               ('simulated-touch',{'width':844,'height':390},True)]:
  for mode in ('quick','versus'):
   ctx=browser.new_context(viewport=viewport,has_touch=touch,is_mobile=touch)
   page=ctx.new_page();errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.evaluate("""() => {const data=new Map();Object.defineProperty(window,'localStorage',
    {configurable:true,value:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),
    removeItem:k=>data.delete(k),clear:()=>data.clear()}})}""")
   page.set_content(html,wait_until='load')
   page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
   for action in ('navQuick','navOnDevice',mode,'kickoff'):
    page.locator(f'[data-action="{action}"]').first.click()
   assert page.evaluate("SupermagicFootball.game.matchState")=='play',(device,mode)
   assert page.locator('#touchButtons [data-act]').count()==4,(device,mode,'four action controls')
   page.locator('#pauseBtn').click(force=True)
   assert page.locator('.heading').inner_text()=='PAUSED',(device,mode)
   assert 'No major match moments' in page.locator('#matchHighlights').inner_text()
   before=page.evaluate("""() => {
    const g=SupermagicFootball.game;
    g.emit('goal',{team:0,hero:'<img src=x onerror=alert(1)>',score:[1,0]});
    g.emit('save',{team:1,player:{t:1,src:{name:'Away Keeper'}},saveType:'dive'});
    g.emit('substitution',{team:0,count:0,used:0,max:3});
    g.emit('dribbleTrick',{team:0,player:'Trickster',name:'rainbow',success:true});
    return {lineups:JSON.stringify(g.lineups),plans:JSON.stringify(g.teamPlans),
      score:JSON.stringify(g.score),substitutions:JSON.stringify(g.substitutionsUsed),
      talks:JSON.stringify(g.talksUsed),stored:localStorage.getItem('legend_teamPlans'),
      recorded:g.events.length,buttons:document.querySelectorAll('#touchButtons [data-act]').length};
   }""")
   page.evaluate("SupermagicFootball.game.onEvent({type:'pause'})")
   timeline=page.locator('#matchHighlights')
   text=timeline.inner_text()
   assert 'SKILL MOVE · HOME · Trickster · rainbow · SUCCESS' in text,(device,mode,text)
   assert 'KEEPER SAVE · AWAY · Away Keeper · dive' in text,(device,mode,text)
   assert 'GOAL · HOME' in text,(device,mode,text)
   assert 'SUBSTITUTION' not in text,(device,mode,'phantom zero substitution',text)
   assert timeline.locator('img').count()==0,(device,mode,'unsafe editable name')
   assert '&lt;img' in timeline.inner_html(),(device,mode,'goal hero needs escaping')
   def current():
    return page.evaluate("""() => {const g=SupermagicFootball.game;
      return {lineups:JSON.stringify(g.lineups),plans:JSON.stringify(g.teamPlans),
       score:JSON.stringify(g.score),substitutions:JSON.stringify(g.substitutionsUsed),
       talks:JSON.stringify(g.talksUsed),stored:localStorage.getItem('legend_teamPlans'),
       recorded:g.events.length,buttons:document.querySelectorAll('#touchButtons [data-act]').length};
    }""")
   assert current()==before,(device,mode,'opening Pause highlights mutated match',current(),before)
   page.evaluate("SupermagicFootball.game.onEvent({type:'halftime'})")
   assert page.locator('.heading').inner_text()=='HALF TIME'
   assert page.locator('#halfTalkHome').count()==1
   assert page.locator('#matchHighlights li').count()==3
   assert current()==before,(device,mode,'opening Half-Time highlights mutated match')
   page.screenshot(path=str(ROOT/'tests'/f'match_highlights_{device}_{mode}.png'))
   page.evaluate("SupermagicFootball.game.onEvent({type:'finished',score:[1,0]})")
   assert page.locator('.heading').inner_text()=='FULL TIME'
   assert page.locator('#matchHighlights li').count()==3,(device,mode,'Full Time moments missing')
   assert not errors,(device,mode,errors)
   print('MATCH_HIGHLIGHTS_PASS',device,mode,
         'real engine events, safe names, five-item chronology, half/full time, four controls',flush=True)
   ctx.close()
 browser.close()
