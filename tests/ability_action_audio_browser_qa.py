#!/usr/bin/env python3
"""Real in-match hyperdash and two-player launch audio, desktop and simulated touch."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
fixture=ROOT/'tests/.generated/play.html'
assert fixture.exists(), 'Build modular play fixture first using scripts/build.py'
html=fixture.read_text(encoding='utf-8')
CHECK=r"""() => {
 const g=SupermagicFootball.game,a=SupermagicFootball.audio,notes=[];
 const old={tone:a.tone,ctx:a.ctx,unlocked:a.unlocked,settings:a.settings,
  last:a.last,visibilityPaused:a.visibilityPaused};
 const before=JSON.stringify({score:g.score,rosters:g.rosters.map(r=>r.map(p=>p.id)),
  teamPlans:g.teamPlans,lineups:g.lineups,talksUsed:g.talksUsed,
  substitutionsUsed:g.substitutionsUsed});
 try{
  a.tone=(f,duration,kind='sfx',wave='sine')=>notes.push({f,kind,wave});
  a.ctx={currentTime:15,state:'running'};a.unlocked=true;
  a.settings={...a.settings,mute:false,master:85,sfx:70};a.last=new Map();
  a.visibilityPaused=false;
  const p=g.players.find(q=>q.t===0&&!q.keeper);
  const teammate=g.players.find(q=>q.t===p?.t&&!q.keeper&&q!==p);
  if(!p||!teammate)throw Error('Missing match actors');
  const state={dashCd:p.dashCooldown,dashTimer:p.dashTimer,
    fatigue:p.fatigue,stun:p.stun,z:p.z,vz:p.vz,
    comboCd:p.comboCooldown,ballOwner:g.ball.owner};
  p.stun=0;p.fatigue=0;p.z=0;p.vz=0;p.dashTimer=0;p.dashCooldown=0;
  const dash=g.triggerHyperdash(p);
  const dashNotes=notes.splice(0);
  a.ctx.currentTime+=.7;
  p.comboCooldown=0;p.dashTimer=0;p.z=0;p.vz=0;p.fatigue=0;
  teammate.stun=0;teammate.z=0;teammate.fatigue=0;teammate.cd=0;
  teammate.x=p.x+10;teammate.y=p.y+10;
  g.ball.owner=null;
  const launch=g.tryTeammateLaunch(p);
  const launchNotes=notes.splice(0);
  // The mechanics themselves may change stamina/motion, but sound handlers
  // must not write persistent score/roster/lineup/talk/substitution structures.
  return {dash,launch,dashNotes,launchNotes,
   events:g.events.filter(e=>['hyperdash','teamLaunch'].includes(e.type))
    .slice(-2).map(e=>({type:e.type,team:e.team,player:e.player})),
   unchanged:before===JSON.stringify({score:g.score,
    rosters:g.rosters.map(r=>r.map(p=>p.id)),teamPlans:g.teamPlans,
    lineups:g.lineups,talksUsed:g.talksUsed,
    substitutionsUsed:g.substitutionsUsed}),
   controls:document.querySelectorAll('#touchButtons [data-act]').length,
   match:g.matchState};
 } finally {
  a.tone=old.tone;a.ctx=old.ctx;a.unlocked=old.unlocked;
  a.settings=old.settings;a.last=old.last;
  a.visibilityPaused=old.visibilityPaused;
 }
}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,touch in [('desktop',False),('simulated-touch',True)]:
  ctx=browser.new_context(viewport={'width':844 if touch else 1280,
                                    'height':390 if touch else 720},
                          has_touch=touch,is_mobile=touch)
  page=ctx.new_page()
  failures=[]
  page.on('pageerror',lambda err:failures.append(str(err)))
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
  for action in ('navQuick','navOnDevice','quick','kickoff'):
   page.locator(f'[data-action="{action}"]').first.click()
  result=page.evaluate(CHECK)
  assert result['match']=='play',(name,'match state',result)
  assert result['dash'] is True,(name,'engine dash activation',result)
  assert result['launch'] is True,(name,'engine assisted launch',result)
  assert [x['f'] for x in result['dashNotes']]==[196,294,392],(name,'dash audio',result)
  assert [x['f'] for x in result['launchNotes']]==[392,494,659],(name,'launch audio',result)
  assert all(x['kind']=='sfx' for x in result['dashNotes']+result['launchNotes']),result
  assert [e['type'] for e in result['events']]==['hyperdash','teamLaunch'],(name,'event bridge',result)
  assert result['unchanged'] is True and result['controls']==4,(name,'gameplay invariants',result)
  assert not failures,(name,failures)
  print('ABILITY_AUDIO_BROWSER_PASS',name,'real dash and team launch, full SFX bridge, four controls',flush=True)
  ctx.close()
 browser.close()
