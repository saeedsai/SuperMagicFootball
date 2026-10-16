#!/usr/bin/env python3
"""Real playable match: procedural coaching/substitution sound on desktop and touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture=root/'tests/.generated/play.html'
assert fixture.exists(), 'Run python3 scripts/build.py first'
html=fixture.read_text(encoding='utf-8')
CHECK=r"""() => {
 const game=SupermagicFootball.game,audio=SupermagicFootball.audio,tones=[];
 const original={tone:audio.tone,ctx:audio.ctx,unlocked:audio.unlocked,
   settings:audio.settings,last:audio.last,visibilityPaused:audio.visibilityPaused};
 const before={score:JSON.stringify(game.score),lineups:JSON.stringify(game.lineups),
   plans:JSON.stringify(game.teamPlans),talks:JSON.stringify(game.talksUsed),
   substitutions:JSON.stringify(game.substitutionsUsed),
   buttons:document.querySelectorAll('#touchButtons [data-act]').length};
 try {
  audio.tone=(f,seconds,kind='sfx')=>tones.push({f,kind});
  audio.ctx={currentTime:12,state:'running'};audio.unlocked=true;
  audio.visibilityPaused=false;
  audio.settings={...original.settings,mute:false,master:90,ui:70,sfx:60};
  audio.last=new Map();
  game.emit('substitution',{team:0,count:0});
  const phantom=tones.splice(0).map(n=>n.f);
  game.emit('substitution',{team:0,count:1,used:1,max:3});
  const substitution=tones.splice(0);
  audio.ctx.currentTime+=.3;
  game.emit('teamTalk',{team:0,choice:'motivate',phase:'halftime',positive:5,backfires:0});
  const boosted=tones.splice(0);
  audio.ctx.currentTime+=.3;
  game.emit('teamTalk',{team:0,choice:'risk',phase:'halftime',positive:0,backfires:5});
  const backfired=tones.splice(0);
  audio.ctx.currentTime+=.3;
  game.emit('teamTalk',{team:1,choice:'steady',phase:'halftime',positive:3,backfires:3});
  const neutral=tones.splice(0);
  const after={score:JSON.stringify(game.score),lineups:JSON.stringify(game.lineups),
   plans:JSON.stringify(game.teamPlans),talks:JSON.stringify(game.talksUsed),
   substitutions:JSON.stringify(game.substitutionsUsed),
   buttons:document.querySelectorAll('#touchButtons [data-act]').length};
  return {phantom,substitution,boosted,backfired,neutral,before,after,state:game.matchState};
 } finally {
  audio.tone=original.tone;audio.ctx=original.ctx;audio.unlocked=original.unlocked;
  audio.settings=original.settings;audio.last=original.last;
  audio.visibilityPaused=original.visibilityPaused;
 }
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
    args=['--no-sandbox','--disable-dev-shm-usage'])
 for label,mobile in [('desktop',False),('simulated-touch',True)]:
  ctx=browser.new_context(viewport={'width':844 if mobile else 1280,'height':390 if mobile else 720},
    is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator('[data-action="'+action+'"]').first.click()
  result=page.evaluate(CHECK)
  assert result['state']=='play',(label,'kickoff',result)
  assert result['phantom']==[],(label,'phantom tactic sub',result)
  assert [x['f'] for x in result['substitution']]==[330,494],(label,'real sub',result)
  assert [x['f'] for x in result['boosted']]==[440,554,659],(label,'coach boost',result)
  assert [x['f'] for x in result['backfired']]==[294,220],(label,'coach risk',result)
  assert [x['f'] for x in result['neutral']]==[392],(label,'neutral talk',result)
  for key in ('substitution','boosted','backfired','neutral'):
   assert all(n['kind']=='ui' for n in result[key]),(label,'UI fader',key,result)
  assert result['before']==result['after'],(label,'mutated gameplay',result)
  assert result['before']['buttons']==4,(label,'four controls')
  assert not errors,(label,errors)
  print('TACTICAL_AUDIO_PASS',label,'genuine sub/coaching cues, no phantom, four controls, unchanged match',flush=True)
  ctx.close()
 browser.close()
